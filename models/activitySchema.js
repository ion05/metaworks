const mongoose = require('mongoose');
const reqString = {type: String, required: true}
const reqNumber = {type: Number, required: true}

const activitySchema =  new mongoose.Schema({
    name: reqString,
    username: reqString,
    money: reqNumber,
    energy: reqNumber,
    reputation: reqNumber,
},{
    timestamps: true
})

const activity = mongoose.model('activity', activitySchema)
module.exports = activity