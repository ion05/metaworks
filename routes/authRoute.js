// auth routes
const express = require('express')
const router = express.Router();
const User = require('../models/userSchema')
const bcrypt = require('bcryptjs')
const passport = require('passport')


router.post('/register',(req,res)=>{
    const {
        fullname,
        username,
        email,
        password,
        password2
    } = req.body
    let errors = []
    if(!fullname || !username || !email || !password || !password2){
        errors.push({msg: 'Please fill in all fields'})
    }
    if(password !== password2){
        errors.push({msg: 'Passwords do not match'})
    }
    if(password.length < 6){
        errors.push({msg: 'Password is short'})
    }
    if(errors.length>0){
        res.render('register',{
            errors,
            fullname,
            username,
            email,
            password,
            password2
        })
    }
    else{
        User.findOne({email: email, username: username})
        .then((user)=>{
            if(user){
                errors.push({msg: 'Email or username already exists'})
                res.render('register',{
                    errors,
                    fullname,
                    username,
                    email,
                    password,
                    password2
                })
            }
            else{
                var newUser = new User({
                    fullname,
                    username,
                    email
                })
                bcrypt.genSalt(10,(err,salt)=>{
                    bcrypt.hash(password,salt,(err,hash)=>{
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                        .then(()=>{
                            console.log('User created')
                            res.redirect('/login')
                        })
                        .catch((err)=>{
                            console.log(err)
                        })
                    })
                })
            }
        })
    }
})

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/login',
    })(req,res,next)
})

module.exports = router;