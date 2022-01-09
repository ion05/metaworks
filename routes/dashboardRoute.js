// routes after authentication
const express = require('express')
const router = express.Router();
const question = require('../models/questionSchema')

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
                    res.cookie('numbers', numbers)
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

// load questions in the database
// router.get('/load', ensureAuthenticated, (req, res) => {
//     // list of questions
//     const questions = [
//         {
//             question: 'What is the capital of India?',
//             answer: 'New Delhi'
//         },
//         {
//             question: 'What is the capital of USA?',
//             answer: 'Washington D.C'
//         },
//         {
//             question: 'What is the capital of China?',
//             answer: 'Beijing'
//         },
//         {
//             question: 'What is the capital of Japan?',
//             answer: 'Tokyo'
//         },
//         {
//             question: 'What is the capital of Germany?',
//             answer: 'Berlin'
//         },
//         {
//             question: 'What is the capital of France?',
//             answer: 'Paris'
//         },
//         {
//             question: 'What is the capital of Italy?',
//             answer: 'Rome'
//         },
//         {
//             question: 'What is the capital of Spain?',
//             answer: 'Madrid'
//         },
//         {
//             question: 'What is the capital of Australia?',
//             answer: 'Canberra'
//         },
//         {
//             question: 'What is the capital of Canada?',
//             answer: 'Ottawa'
//         },
//         {
//             question: 'What is the capital of New Zealand?',
//             answer: 'Wellington'
//         },
//         {
//             question: 'What is the capital of South Africa?',
//             answer: 'Pretoria'
//         },
//         {
//             question: 'What is the capital of South Korea?',
//             answer: 'Seoul'
//         },
//         {
//             question: 'What is the capital of Sweden?',
//             answer: 'Stockholm'
//         },
//         {
//             question: 'What is the capital of Switzerland?',
//             answer: 'Bern'
//         },
//         {
//             question: 'What is the capital of the United Kingdom?',
//             answer: 'London'
//         },
//         {
//             question: "Who is the president of India?",
//             answer: "Ram Nath Kovind"
//         },
//         {
//             question: "Who is the president of USA?",
//             answer: "Joe Biden"
//         },
//         {
//             question: "Who is the president of China?",
//             answer: "Xi Jinping"
//         },
//         {
//             question: "Who is the Prime Minister of Japan?",
//             answer: "Fumio Kishida"
//         },
//         {
//             question: "Who is the Chancellor of Germany?",
//             answer: "Olaf Scholz"
//         },
//         {
//             question: "Who is the president of France?",
//             answer: "Emmanuel Macron"
//         },
//         {
//             question: "Who is the prime minister of UK",
//             answer: "Boris Johnson"
//         },
//         {
//             question: "Who is the prime minster of India",
//             answer: "Narendra Modi"
//         },
//         {
//             question: "Who is the chief minister of Delhi",
//             answer: "Arvind Kejriwal"
//         },
//         {
//             question: "Who is the prime minister of Canada",
//             answer: "Justin Trudeau"
//         },
//     ]
//     for (let i = 0; i < questions.length; i++) {
//         const newQuestion = new Question({
//             question: questions[i].question,
//             answer: questions[i].answer,
//             number: i + 1
//         })
//         newQuestion.save()
//     }
//     console.log('done')
// })

module.exports =  router;