const mongoose = require('mongoose');
const reqString = {type: String, required: true};

const userSchema = new mongoose.Schema({
    fullname : reqString,
    username:  reqString,
    email : reqString,
    password : reqString,
},{
    timestamps: true
})

const User = mongoose.model('user', userSchema);
module.exports = User