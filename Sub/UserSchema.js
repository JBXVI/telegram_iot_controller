const mongoose = require("mongoose")

const connectionSchema = new mongoose.Schema({
    username:{type:String,require:true},
    email:{type:String,require:true},
    password:{type:String,require:true},
    isVerified:{type:Boolean,require:true},
    verificationCode:{type:String},
    premiumUser:{type:Boolean,require:true},
    emailLimit:{type:Number},
    joinDate:{type:String},
    maxDevices:{type:Number}
    

})

const ConnectionModel = mongoose.model("elsocketUsers",connectionSchema)
module.exports =ConnectionModel


