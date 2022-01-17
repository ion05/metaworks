const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs')
const path = require('path');
const  expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const cookieParser = require('cookie-parser')
require('dotenv').config();

var passport = require('passport');
require('./config/passport')(passport)

const app = express();
const secret = process.env.SECRET;
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(expressLayouts)
app.use(cookieParser(secret))
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

const mongoPass = process.env.MONGO_PASS;
const PORT = process.env.PORT || 5000 ;
const mongoURI = `mongodb+srv://ion05:${mongoPass}@cluster0.qwcg0.mongodb.net/data?retryWrites=true&w=majority`
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}).then((result)=> {
    console.log('Connected MongoDB')
    app.listen(PORT, ()=> {
        console.log(`Server is running on port ${PORT}`)
    }
    )
})

const indexRoute = require('./routes/indexRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const authRoute = require('./routes/authRoute');
const marketRoute = require('./routes/marketRoute');
const leaderboardRoute = require('./routes/leaderboardRoute');

app.use(indexRoute)
app.use('/dashboard',dashboardRoute)
app.use(authRoute)
app.use('/dashboard/market',marketRoute)
app.use('/leaderboard', leaderboardRoute)


