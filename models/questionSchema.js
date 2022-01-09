const mongoose = require('mongoose');
const reqString = {type: String, required: true};
const reqNumber = {type: Number, required: true};

const questionSchema = new mongoose.Schema({
    question:  reqString,
    answer : reqString,
})

const Question = mongoose.model('question', questionSchema);
module.exports = Question