// auth routes
const express = require('express')
const router = express.Router();
const User = require('../models/userSchema')
const bcrypt = require('bcryptjs')
const passport = require('passport')


router.post('/register',(req,res)=>{
    const {
        username,
        email,
        password,
        password2
    } = req.body
    let errors = []
    if(!username || !email || !password || !password2){
        errors.push({msg: 'Please fill in all fields'})
    }
    if(password !== password2){
        errors.push({msg: 'Passwords do not match'})
    }
    if(password.length < 6){
        errors.push({msg: 'Password is short'})
    }
    if(errors.length>0){
        console.log(errors)
        res.render('register',{
            errors,
            username,
            email,
            password,
            password2
        })
    }
    else{
        User.findOne({email: email})
        .then((user)=>{
            if(user){
                errors.push({msg: 'An account with the email already exists'})
                console.log(errors)
                res.render('register',{
                    errors,
                    username,
                    email,
                    password,
                    password2
                })
            }
            else{
                User.findOne({username: username}).then((user)=>{
                    if(user){
                        errors.push({msg: 'An account with the username already exists'})
                        console.log(errors)
                        res.render('register',{
                            errors,
                            username,
                            email,
                            password,
                            password2
                        })
                    }
                    else{

                    var newUser = new User({
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
    }
})

router.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        successRedirect: '/dashboard',
        failureRedirect: '/login',
    })(req,res,next)
})

module.exports = router;