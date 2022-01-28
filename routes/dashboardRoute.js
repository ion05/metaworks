// routes after authentication
const express = require('express')
const router = express.Router();
const question = require('../models/questionSchema')
const user = require('../models/userSchema')
const activity = require('../models/activitySchema')
const randomsentence = require('random-sentence')
const {energyCheck, moneyCheck, repoCheck, reset} = require('../services/fireCheck')

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
    const randomNumber = Math.floor(Math.random() * 2) + 1;
    console.log(randomNumber)
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
            res.cookie('answers', answers)
            // render the page
            res.render('quiz', {
                questions: questions,
                answers: answers,
                numbers: numbers,
                user: req.user
                })
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
    var energy = -5
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
    const power = req.cookies.power
    switch(power) {
        case 'energy':
            energy = -2.5
            break
        case 'repo':
            repo *= 2
            break
        case "money":
            increase *= 2
            break
    }

    const newActivity = new activity({
        name: "Quiz",
        username: username,
        money: increase,
        energy: energy,
        reputation: repo,
    })
    newActivity.save()
    user.findOneAndUpdate({username: username}, {$inc: {money: increase, energy: energy, reputation: repo}}, async (err, doc) => {
        if (err) {
            console.log(err)
        } else {
            const energyC = await energyCheck(username)
            const moneyC = await moneyCheck(username)
            const repoC = await repoCheck(username)
            if (energyC.ok && moneyC.ok && repoC.ok) {
                console.log('You can work')
                const money = doc.money
                const energy = doc.energy
                res.render('result', {
                    correct: correct,
                    activity:"quiz",
                    money, energy, increase
                })
            } else {
                var reason = ""
                if(!energyC.ok) {
                    reason = energyC.reason
                }
                else {
                    reason = moneyC.ok ? repoC.reason : moneyC.reason
                }
                reset(username)
                res.render('fired', {
                    reason
                })
            }


                
            
        }
    })
    
})

router.post('/sentence', ensureAuthenticated, (req,res)=> {
    const csentence = req.cookies.sentence
    const sentence = req.body.answer
    res.clearCookie('sentence')
    const username = req.user.username
    var repo =0
    var energy = -5
    var increase = 0
    if (sentence == csentence) {
        increase = 200
        repo = 3
    } else {
        increase = -100
        repo = -2
    }
    const power = req.cookies.power
    switch(power) {
        case 'energy':
            energy = -2.5
            break
        case 'repo':
            repo *= 2
            break
        case "money":
            increase *= 2
            break
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
    user.findOneAndUpdate({username:username}, {$inc: {money: increase, energy: energy, reputation:repo}}).then(async doc => {
        const energyC = await energyCheck(username)
            const moneyC = await moneyCheck(username)
            const repoC = await repoCheck(username)
            if (energyC.ok && moneyC.ok && repoC.ok) {
                const money = doc.money
                const energy = doc.energy
                res.render('result', {
                correct: correct,
                activity:"sentence",
                money, energy, increase
        })
            } else {
                var reason = ""
                if(!energyC.ok) {
                    reason = energyC.reason
                }
                else {
                    reason = moneyC.ok ? repoC.reason : moneyC.reason
                }
                reset(username)
                res.render('fired', {
                    reason
                })
            }

        
    })
})

router.get('/rest', ensureAuthenticated, (req,res)=> {
    
    const username = req.user.username
    const maxenergy = req.user.maxEnergy
    user.findOneAndUpdate({username:username}, {$set: {energy: maxenergy}, $inc: {money:-10}).then(doc => {
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

router.post('/complain', ensureAuthenticated,  (req,res)=> {
const complaint = req.body.complaint
const type = req.body.type
switch (type) {
    case "1":
        console.log('hello')
        var userr = req.user
        if (userr.reputation % 10 == 0 && userr.reputation != 0) {
            const money = 0 
            const energy = -1
            const repo = 5 
            const newActivity = new activity({
                name: "Complain",
                username: userr.username,
                money: money,
                energy: energy,
                reputation: repo,
            })
            newActivity.save()
            user.findOneAndUpdate({username: userr.username}, {$inc: {money: money, reputation: repo, energy:energy}}).then(doc => {
                res.render('result', {
                    correct: "Complaint Successfull",
                    activity: "Working Conditions Complaint",
                    money: doc.money,
                    energy: doc.energy,
                    increase: 0

                    })
                })

        } else {
            console.log('un')
            const money = -100
            const energy = -5
            const repo = -2
            const newActivity = new activity({
                name: "Complain",
                username: userr.username,
                money: money,
                energy: energy,
                reputation: repo,
            })
            newActivity.save()
            user.findOneAndUpdate({username: userr.username}, {$inc: {money: money, energy: energy, reputation: repo}}).then(async doc => {
                console.log('updated')
                var username = userr.username
                const energyC = await energyCheck(username)
            const moneyC = await moneyCheck(username)
            const repoC = await repoCheck(username)
            if (energyC.ok && moneyC.ok && repoC.ok) {
                res.render('result', {
                    correct: "Complaint Unsucessfull",
                    activity: "Working Conditions Complaint",
                    money: doc.money,
                    energy: doc.energy,
                    increase: -100

                    })
                } else {
                    var reason = ""
                if(!energyC.ok) {
                    reason = energyC.reason
                }
                else {
                    reason = moneyC.ok ? repoC.reason : moneyC.reason
                }
                reset(username)
                res.render('fired', {
                    reason
                })
            }
        })


        }
        break
    case "2":
        var userr = req.user
        if (userr.reputation % 5 == 0  && userr.reputation != 0) {
            const money = 0 
            const energy = -1
            const repo = 5 
            const newActivity = new activity({
                name: "Complain",
                username: userr.username,
                money: money,
                energy: energy,
                reputation: repo,
            })
            newActivity.save()
            user.findOneAndUpdate({username: userr.username}, {$inc: {money: money, reputation: repo, energy:energy}}).then(doc => {
                res.render('result', {
                    correct: "Complaint Successfull",
                    activity: "Work Load Complaint",
                    money: doc.money,
                    energy: doc.energy,
                    increase: 0

                    })
                })

        } else {
            const money = -100
            const energy = -5
            const repo = -2
            const newActivity = new activity({
                name: "Complain",
                username: userr.username,
                money: money,
                energy: energy,
                reputation: repo,
            })
            newActivity.save()
            user.findOneAndUpdate({username: userr.username}, {$inc: {money: money, energy: energy, reputation: repo}}).then(async doc =>  {
                var username = userr.username
                const energyC = await energyCheck(username)
            const moneyC = await moneyCheck(username)
            const repoC = await repoCheck(username)
            if (energyC.ok && moneyC.ok && repoC.ok) {
                res.render('result', {
                    correct: "Complaint Unsucessfull",
                    activity: "Work Load Complaint",
                    money: doc.money,
                    energy: doc.energy,
                    increase: -100

                    })
                } else {
                    var reason = ""
                if(!energyC.ok) {
                    reason = energyC.reason
                }
                else {
                    reason = moneyC.ok ? moneyC.reason : repoC.reason
                }
                reset(username)
                res.render('fired', {
                    reason
                })
            }
        })
        }
        break



}
})
router.post('/request', ensureAuthenticated, (req,res)=> {
    var username = req.user.username
    const request = req.body.request
    const type = req.body.type 
    switch (type) {
        case "1":
            const repoo = req.user.reputation
            if (repoo % 5 == 0  && userr.reputation != 0) {
                var money = 200
                var energy = -1
                var repo = -2 
                const newActivity = new activity({
                    username: username,
                    name: "Request",
                    money: money,
                    energy: energy,
                    reputation: repo,
                })
                newActivity.save()
                user.findOneAndUpdate({username: username}, {$inc: {money: money, energy: energy, reputation: repo}}).then(async doc => {
                    const repoC = await repoCheck(username)
                    if (repoC.ok) {
                        res.render('result', {
                            correct: "Request Successfull",
                            activity: "Pay Raise Request",
                            money: doc.money,
                            energy: doc.energy,
                            increase: 200
                        })
                    } else {
                        var reason = repoC.reason
                        reset(username)
                        res.render('fired', {
                            reason
                        })
                    }
                    
                }
                )
            } else {
                const money = 0
                const energy = -2
                const repo = -2
                const newActivity = new activity({
                    username: username,
                    name: "Request",
                    money: money,
                    energy: energy,
                    reputation: repo,
                })
                newActivity.save()
                user.findOneAndUpdate({username: username}, {$inc: {money: money, energy: energy, reputation: repo}}).then(async doc => {
                    const repoC = await repoCheck(username)
                    const energyC = await energyCheck(username)
                    if (repoC.ok && energyC.ok) {
                        res.render('result', {
                            correct: "Request Unsucessfull",
                            activity: "Pay Raise Request",
                            money: doc.money,
                            energy: doc.energy,
                            increase: -200
                        })
                    }
                    else {
                        var reason = energyC.ok ? repoC.reason : energyC.reason
                        reset(username)
                        res.render('fired', {
                            reason
                        })
                    }
                })
            }
            break
        case "2":
            username  = req.user.username
            console.log(2)
            const repooo = req.user.reputation
            if (repooo % 10 == 0  && userr.reputation != 0) {
                console.log('approve')
                var money =  400
                var energy = -1
                var repo = 2
                const newActivity = new activity({
                    username: username,
                    name: "Request",
                    money: money,
                    energy: energy,
                    reputation: repo,
                })
                newActivity.save()
                user.findOne({username: username}).then(async doc => {
                    const level = doc.level
                    var newLevel = ""
                    switch (level) {
                        case "Trainee":
                            newLevel = "Trained"
                            break
                        case "Trained":
                            newLevel = "Professional"
                            break
                        case "Professional":
                            newLevel = "Expert"
                            break
                        case "Expert":
                            newLevel = "Elite"
                            break
                        case "Elite":
                            newLevel = "CEO"
                            break
                        case "CEO":
                            res.render('result', {
                                correct: "At Top of Company",
                                activity: "Promotion Request",
                                money: doc.money,
                                energy: doc.energy,
                                increase: 0
                                })
                            break
                    }
                    user.findOneAndUpdate({username: username}, {$set: {level: newLevel}, $inc: {money:money, energy:energy , reputation:repo}}).then(doc => {
                        res.render('result', {
                            correct: "Request Successfull",
                            activity: "Promotion Request",
                            money: doc.money,
                            energy: doc.energy,
                            increase: 400
                        })
                    })
                })
            } else {
                console.log('deny')
                const money = 0
                const energy = -2
                const repo = -2  
                console.log(username)
                const newActivity = new activity({
                    username: username,
                    name: "Request",
                    money: money,
                    energy: energy,
                    reputation: repo,
                })
                newActivity.save()
                user.findOneAndUpdate({username: username}, {$inc: {money: money, energy: energy, reputation: repo}}).then(async doc => {
                    const repoC = await repoCheck(username)
                    const energyC = await energyCheck(username)
                    if (repoC.ok && energyC.ok) {
                        res.render('result', {
                            correct: "Request Unscessfull",
                            activity: "Promotion Request",
                            money: doc.money,
                            energy: doc.energy,
                            increase: -400
                        })
                    }
                    else {
                        var reason = energyC.ok ? repoC.reason : energyC.reason
                        reset(username)
                        res.render('fired', {
                            reason
                        })
                    }
                })
            }
                

    } 

})
module.exports =  router;
