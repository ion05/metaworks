// routes after authentication
const express = require('express')
const router = express.Router();
const question = require('../models/questionSchema')
const user = require('../models/userSchema')

const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');
const Question = require('../models/questionSchema');

router.get('/', ensureAuthenticated, (req, res) => {
    const firstLogin = req.cookies.firstLogin || true;
    if (firstLogin== "false") {
        res.render('dashboard')
    } else {
        res.cookie('firstLogin', false)
        res.redirect('/dashboard/intro')
    }
    
})

router.get('/intro', ensureAuthenticated ,(req, res) => {
    res.render('intro')
})

router.get('/work', ensureAuthenticated, async (req, res) => {
    // generate random number between 1 and 4 
    // const randomNumber = Math.floor(Math.random() * 4) + 1;
    const randomNumber = 1;
    // render the corresponding page
    switch(randomNumber)  {
        case 1:
            // get number of documents in quiz
            question.countDocuments({}, async (err, count) => {
                console.log(count)
                if (err) {
                    console.log(err)
                } else {
                    // generate 4 random numbers between 1 and count
                    const randomNumbers = []
                    for (let i = 0; i < 4; i++) {
                        const number = Math.floor(Math.random() * count) + 1
                        // check if the number is already in the array
                        if (randomNumbers.includes(number)) {
                            i--
                        }
                        else {
                            randomNumbers.push(number)
                        }


                    }
                    const questions = []
                    const answers = []
                    const numbers = []
                    // get the corresponding question with number
                    for (let i = 0; i < 4; i++) {
                        const doc = await question.findOne({number: randomNumbers[i]})
                        questions.push(doc.question)
                        answers.push(doc.answer)
                        numbers.push(doc.number)
                    }
                    res.cookie('answers', answers)
                    // render the page
                    res.render('quiz', {
                        questions: questions,
                        answers: answers,
                        numbers: numbers,
                        user: req.user
                        })
            }
        })
            break;
    }
})

router.post('/quiz', ensureAuthenticated, (req, res) => {
    const {answer1, answer2, answer3, answer4} = req.body
    const answers = req.cookies.answers  
    console.log(answers)
    console.log(answer1, answer2, answer3, answer4)
    var correct = 0
    // make answer1, answer2, answer3, answer4 into lowercase

    if (answer1.toLowerCase() == answers[0].toLowerCase()) {
        correct++
    }
    if (answer2.toLowerCase() == answers[1].toLowerCase()) {
        correct++
    }
    if (answer3.toLowerCase() == answers[2].toLowerCase()) {
        correct++
    }
    if (answer4.toLowerCase() == answers[3].toLowerCase()) {
        correct++
    }
    const username = req.user.username
    var increase = 0
    if (correct >3) {
        increase = 400
    }  else if (correct > 1) {
        increase = 200
    } else if (correct > 0) {
        increase = 100
    } else {
        increase = -100
    }
    user.findOneAndUpdate({username: username}, {$inc: {money: increase, energy: -5}}, (err, doc) => {
        if (err) {
            console.log(err)
        } else {
            const money = doc.money
            const energy = doc.energy
            res.render('result', {
                correct: correct,
                activity:"quiz",
                money, energy, increase
            })
        }
    })
    
})

module.exports =  router;