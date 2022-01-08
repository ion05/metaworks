// landing page
const express = require('express')
const router = express.Router();

const {
    ensureAuthenticated,
    forwardAuthenticated
} = require('../config/auth');

router.get('/', forwardAuthenticated,(req,res)=> {
    res.render('index')
})
router.get('/login', forwardAuthenticated,(req,res)=> {
    res.render('login')
})
router.get('/register', forwardAuthenticated,(req,res)=>{
    res.render('register')
})
module.exports = router