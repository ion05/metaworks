const user = require('../models/userSchema')
const activity = require('../models/activitySchema')

const energyCheck = async (username) => {
  const data = await user.findOne({username:username})
  const energy = data.energy 
    console.log(energy)
    if (energy < 0) {
        return {
            "reason": "You worked too much",
            "ok": false
        }
    } else {
        return {
            "reason": "You can work",
            "ok": true
        }
    }
}

const moneyCheck = async (username) => {
    const data = await user.findOne({username:username})
    const money = data.money
    if (money < 0) {
        return {
            "reason": "You have no money",
            "ok": false
        }
    } else {
        return {
            "reason": "You can work",
            "ok": true
        }
    }
}
const repoCheck = async (username) => {
    const data = await user.findOne({username:username})
    const repo = data.reputation
    if (repo < 0) {
        return {
            "reason": "You have no reputation",
            "ok": false
        }
    } else {
        return {
            "reason": "You can work",
            "ok": true
        }
    }
}


module.exports = {energyCheck, moneyCheck, repoCheck}