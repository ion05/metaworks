// routes after authentication
const express = require('express')
const router = express.Router();
const quiz = require('../models/questionSchema')

const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');

router.get('/', ensureAuthenticated, (req, res) => {
    const firstLogin = req.cookies.firstLogin || true;
    if (!firstLogin) {
        res.render('dashboard')
    } else {
        res.cookie('firstLogin', false)
        res.render('intro')
    }
    
})

router.get('/work', ensureAuthenticated, (req, res) => {
    // generate random number between 1 and 4 
    const randomNumber = Math.floor(Math.random() * 4) + 1;
    // render the corresponding page
    switch(randomNumber) {
        case 1:
            // get number of documents in quiz
            const count = quiz.count()
            console.log(count)
            break;
    }
})

module.exports =  router;