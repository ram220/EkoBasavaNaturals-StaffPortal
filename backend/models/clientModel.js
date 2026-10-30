const mongoose=require('mongoose');

const clientSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowerase:true,
        match:[
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please enter a valid email address"
        ]
    },
    password:{
        type:String,
        required:true,
        min:[6,"password should be atlest 6 characters"],
    },
    mobile:{
        type:String,
        required:true,
        match:[
            /^[6-9]\d{9}$/,
            "Please enter a valid 10-digit Indian mobile number"
        ]

    },
    resetPasswordToken:{
        type:String
    },
    resetPasswordExpires:{
        type:Date
    }

},{timestamps:true});

const ClientsModel=mongoose.model("Clients",clientSchema);

module.exports=ClientsModel;