// routes after authentication
const express = require('express')
const router = express.Router();
const question = require('../models/questionSchema')
const user = require('../models/userSchema')
const activity = require('../models/activitySchema')
const randomsentence = require('random-sentence')

const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');
const Question = require('../models/questionSchema');

router.get('/', ensureAuthenticated, (req, res) => {
    const firstLogin = req.cookies.firstLogin || true;
    if (firstLogin== "false") {
        activity.find({username:req.user.username}).sort({createdAt:-1}).then(data => {
            const energy= req.user.energy 
            const maxenergy = req.user.maxEnergy
            const energy_per = Math.round((energy/maxenergy)*100)
            res.render('dashboard',{
                user: req.user,
                activity_list: data,
                energy_per
            })
        })
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
    const randomNumber = 2;
    // render the corresponding page
    switch(randomNumber)  {
        case 1:
            // get number of documents in quiz
            question.countDocuments({}, async (err, count) => {
                
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
        case 2:
            const sentence = randomsentence({words:3})
            res.cookie('sentence', sentence)
            res.render('sentence', {
                sentence: sentence,
                user: req.user
            })
            

    }
})

router.post('/quiz', ensureAuthenticated, (req, res) => {
    const {answer1, answer2, answer3, answer4} = req.body
    const answers = req.cookies.answers  
    // delete answers cookie
    res.clearCookie('answers')
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
    var repo = 0
    if (correct >3) {
        increase = 400
        repo = 2
    }  else if (correct > 1) {
        increase = 200
        repo = 2
    } else if (correct > 0) {
        increase = 100
        repo = 0
    } else {
        increase = -100
        repo = -1
    }
    const newActivity = new activity({
        name: "Quiz",
        username: username,
        money: increase,
        energy: -5,
        reputation: repo,
    })
    newActivity.save()
    user.findOneAndUpdate({username: username}, {$inc: {money: increase, energy: -5, reputation: repo}}, (err, doc) => {
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
router.get('/market',ensureAuthenticated, (req, res) => {
    const energy= req.user.energy 
    const maxenergy = req.user.maxEnergy
    const energy_per = Math.round((energy/maxenergy)*100)
    res.render('market',{
        user: req.user,
        energy_per
    })
})
router.post('/sentence', ensureAuthenticated, (req,res)=> {
    const csentence = req.cookies.sentence
    const sentence = req.body.sentence
    res.clearCookie('sentence')
    const username = req.user.username
    var repo =0
    if (sentence == csentence) {
        var increase = 200
        repo = 3
    } else {
        increase = -100
        repo = -2
    }
    const newActivity = new activity({
        name: "Sentence",
        username: username,
        money: increase,
        energy: -5,
        reputation: repo,
    })
    newActivity.save()
    var correct = csentence==sentence ? "All correct" : "Incorrect"
    user.findOneAndUpdate({username:username}, {$inc: {money: increase, energy:-5, reputation:3}}).then(doc => {
        const money = doc.money
        const energy = doc.energy
        res.render('result', {
            correct: correct,
            activity:"sentence",
            money, energy, increase
        })
    })
})

router.get('/rest', ensureAuthenticated, (req,res)=> {
    
    const username = req.user.username
    const maxenergy = req.user.maxEnergy
    user.findOneAndUpdate({username:username}, {$set: {energy: maxenergy}}).then(doc => {
        const newactivity = new activity({
            name: "Rest",
            username: username,
            money: -10,
            energy: maxenergy,
            reputation: 0,
        })
         newactivity.save()
        res.redirect('/dashboard')
    })
})
module.exports =  router;