const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs')
const path = require('path');
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const mongoPass = process.env.MONGO_PASS;
const PORT = 5000 || process.env.PORT;
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

app.use(indexRoute)
// app.use(dashboardRoute)
// app.use(authRoute)


