const mongoose = require('mongoose');
const reqString = {type: String, required: true};
const reqNumber = {type: Number, required: true};

const userSchema = new mongoose.Schema({
    username:  reqString,
    email : reqString,
    password : reqString,
    money: {
        type: Number,
        default: 1000,
        required: true
    },
    energy: {
        type: Number,
        default: 30,
        required: true
    },
    maxEnergy: {
        type: Number,
        default: 30,
        required: true
    },
    reputation: {
        type:Number, 
        default:0,
        required: true
    }
},{
    timestamps: true
})

const User = mongoose.model('user', userSchema);
module.exports = User