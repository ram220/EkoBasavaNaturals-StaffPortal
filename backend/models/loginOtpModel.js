const mongoose=require('mongoose');

const loginOtpSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true,
        index:true
    },
    otpHash:{
        type:String,
        required:true
    },
    expiresIn:{
        type:Date,
        required:true,
        xpires:0
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const LoginOtp=mongoose.model("LoginOtp",loginOtpSchema);

module.exports=LoginOtp;