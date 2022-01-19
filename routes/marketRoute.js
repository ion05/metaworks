const express = require('express')
const router = express.Router()
const question = require('../models/questionSchema')
const user = require('../models/userSchema')
const activity = require('../models/activitySchema')
const {moneyCheck, reset} = require('../services/fireCheck')
const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');


router.get('/',ensureAuthenticated, (req, res) => {
    const energy= req.user.energy 
    const maxenergy = req.user.maxEnergy
    const energy_per = Math.round((energy/maxenergy)*100)
    res.render('market',{   
        user: req.user,
        energy_per,
        power:req.cookies.power
    })
})
router.post('/money', ensureAuthenticated, async (req,res)=> {
    const username = req.user.username
    const moneyC = await moneyCheck(username)
    await user.findOneAndUpdate({username:username}, {$inc: {money: -300}})
    if (moneyC.ok){
        res.cookie('power', 'money', {
            maxAge: 12000000,
        })
        var date = new Date()
        date.setSeconds(date.getSeconds() + 12000000/1000)
        res.render('powerup',{
            power: "Double Money",
            expiry: date,
            cost: 300
        }) 
    } else {
        reset(username)
        res.render('fired', {
            reason: "You are out of money"
        })
    }
     

})

router.post('/energy', ensureAuthenticated, async (req,res)=> {
    const username = req.user.username
    const moneyC = await moneyCheck(username)
    await user.findOneAndUpdate({username:username}, {$inc: {money: -200}})
    if (moneyC.ok){
        res.cookie('power', 'energy', {
            maxAge: 12000000,
        })
        var date = new Date()
        date.setSeconds(date.getSeconds() + 12000000/1000)
        res.render('powerup',{
            power: "Half Energy Used",
            expiry: date,
            cost: 200
        }) 
    } else {
        reset(username)
        res.render('fired', {
            reason: "You are out of money"
        })
    }
    
})

router.post('/repo', ensureAuthenticated, async (req,res)=> {
    const username = req.user.username
    const moneyC = await moneyCheck(username)
    await user.findOneAndUpdate({username:username}, {$inc: {money: -200}})
    if (moneyC.ok){
        res.cookie('power', 'repo', {
            maxAge: 12000000,
        })
        var date = new Date()
        date.setSeconds(date.getSeconds() + 12000000/1000)
        res.render('powerup',{
            power: "Double Reputation",
            expiry: date.toUTCString(),
            cost: 200
        }) 
    } else {
        reset(username)
        res.render('fired', {
            reason: "You are out of money"
        })
    }
    
})

module.exports = router