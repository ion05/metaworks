const router = require('express').Router()
const user = require('../models/userSchema')

router.get('/', (req, res) => {
    user.find().sort({money:-1}).then(data => {
        console.log(data)
        res.render('leaderboard', {
            user: req.user,
            leaderboard: data
        }
        )
    })
})

module.exports= router