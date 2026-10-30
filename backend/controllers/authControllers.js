const express=require('express');
const ClientsModel=require('../models/clientModel');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto=require('crypto');
const {randomInt}=require('crypto');
const LoginOtp=require('../models/loginOtpModel');

exports.signUp=async(req,res)=>{
    try{
        const {firstName,lastName,email,password,mobile}=req.body;
        console.log(req.body)
        if(!firstName || !lastName || !email || !password || !mobile){
            return res.status(400).json({
                status:"fail",
                message:"All fields are required"
            })
        }
        const normalizedEmail=email.trim().toLowerCase();
        const normalizedMobile=mobile.trim();
        const isUserExists=await ClientsModel.findOne({
            $or: [
                {email:normalizedEmail},
                {mobile:normalizedMobile}
            ]
        });
        if(isUserExists){
            const duplicateField=isUserExists.email===normalizedEmail ? "email" : "mobile number"
            return res.status(409).json({
                status:"fail",
                message:`An account with this ${duplicateField} already exists`
            })
        }

        
        const hashedPassword=await bcrypt.hash(password,10);

        const newUser=await ClientsModel.create({firstName,lastName,email:normalizedEmail,password:hashedPassword,mobile});
        

        res.status(201).json({
            status:"success",
            message:"User Account Created Successfully",
            data:{
                _id:newUser._id,
                firstName:newUser.firstName,
                lastName:newUser.lastName,
                email:newUser.email,
                mobile:newUser.mobile

            }
        })
    }
    catch(error){
        // res.status(500).json({
        //     status:"fail",
        //     message:"error while creating user Account,Please try after some time",
        //     err:error.message
        // })

        if (error.code === 11000) {
            return res.status(409).json({
                status: "fail",
                message: "Email or mobile number already exists"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                status: "fail",
                message: error.message
            });
        }

        return res.status(500).json({
            status: "fail",
            message: "Error while creating user account. Please try again later."
        });
    
    }
}

exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Email and password are required"
            });
        }
        const normalizedEmail=email.trim().toLowerCase()
        const user=await ClientsModel.findOne({email:normalizedEmail});
        if(!user){
            return res.status(404).json({
                status:"fail",
                message:"User not found please ckeck your Email"
            })
        }

        const isPasswordMatch=await bcrypt.compare(password,user.password);

        if(!isPasswordMatch){
            return res.status(401).json({
                status:"fail",
                message:"Invalid Credentials,please check your password"
            })
        }

        const otp=randomInt(100000,1000000).toString();

        const otpHash=crypto.createHash("sha256").update(otp).digest("hex");

        const expiresIn=new Date(Date.now() + 5 * 60 * 1000);

        await LoginOtp.deleteMany({
            email:normalizedEmail
        });

        const newOtpRecord=await LoginOtp.create({
            email:normalizedEmail,
            otpHash,
            expiresIn,
            attempts:0
        });

        try{
            await sendEmail({
                to:normalizedEmail,
                subject:"Your Ekobasava Naturals Login OTP",
                text:`Your login verification code is ${otp}. ` +
                    "It expires in 5 minutes. Do not share this code with anyone.",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                        <h2>Ekobasava Naturals</h2>
                        <p>Use the following code to complete your login:</p>
                        <h1 style="letter-spacing: 8px;">${otp}</h1>
                        <p>This code expires in 5 minutes.</p>
                        <p>Do not share this code with anyone.</p>
                        <p>If you did not try to log in, you can ignore this email.</p>
                    </div>
                `
            })
        }
        catch(emailError){
            await LoginOtp.deleteOne({
                _id:newOtpRecord._id
            });

            throw emailError;
        }

        res.status(200).json({
            status:"success",
            message:"OTP sent to your registered email",
            email:normalizedEmail
        })
    }
    catch(error){
        res.status(500).json({
            status:"fail",
            message:"error while trying to login, please try after some time",
            err:error.message
        })
    }
}

exports.sendEmailForOtpVerification=async(req,res)=>{
    try{
        const {to}=req.body;
        console.log(to);
        if(!to){
            return res.status(400).json({
                status:"fail",
                message:"Recipient Email is required"
            })
        }

        const result=await sendEmail({
            to,
            subject:"Ekobasava Naturals - Email Test",
            text:"Congratulations! Your Resend email integration is working."
        })

        console.log("result in sending email: ",result);

        res.status(200).json({
            status:"success",
            message:"Email sent successfully",
            mailId:result.id
        })
    }
    catch(error){
        res.status(500).json({
            status: "fail",
            message: "Unable to send test email: "+error.message
        });
    }
}


exports.verifyOtp=async(req,res)=>{
    try{
        const {email,otp}=req.body;

        console.log(req.body)
        if(!email || !otp){
            return res.status(400).json({
                status:"fail",
                message:"Email and OTP are required"
            })
        }

        const normalizedEmail=email.trim().toLowerCase();

        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                status: "fail",
                message: "Please enter a valid 6-digit OTP"
            });
        }

        const otpRecord=await LoginOtp.findOne({
            email:normalizedEmail
        })

        console.log(otpRecord);

        if(!otpRecord){
            return res.status(400).json({
                status:"fail",
                message:"OTP not found or already used. Please log in again."
            })
        }

        if(otpRecord.expiresIn.getTime() <= Date.now()){
            await LoginOtp.deleteOne({
                _id:otpRecord._id
            })

            return res.status(400).json({
                status:"fail",
                message:"OTP has expired. Please log in again."
            })
        } 

        if(otpRecord.attempts >= 3){
            await LoginOtp.deleteOne({
                _id:otpRecord._id
            })

            return res.status(429).json({
                status:"fail",
                message:"Too many incorrect attempts. Please log in again."
            })
        }

        const submittedOtp=crypto.createHash("sha256").update(otp).digest("hex");

        const submittedBuffer=Buffer.from(submittedOtp,"hex");
        const storedBuffer=Buffer.from(otpRecord.otpHash,"hex")

        const isOtpMatch=
            submittedBuffer.length===storedBuffer.length && 
            crypto.timingSafeEqual(submittedBuffer,storedBuffer);

        if(!isOtpMatch){
            otpRecord.attempts += 1;
            await otpRecord.save();

            return res.status(400).json({
                status:"fail",
                message:"Incorrect OTP. Please try again."
            })
        }


        const user=await ClientsModel.findOne({
            email:normalizedEmail
        });

        if(!user){
            await LoginOtp.deleteOne({
                _id:otpRecord._id
            })

            return res.status(401).json({
                status: "fail",
                message: "Unable to verify this account. Please log in again."
            });
        }

        // 9. Consume the OTP before issuing a token
        await LoginOtp.deleteOne({ _id: otpRecord._id });

        // 10. Issue JWT only after OTP verification
        const token = jwt.sign(
            { id: user._id },
            process.env.MY_SECRET_KEY,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            status: "success",
            message: "Login successful",
            token,
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                mobile: user.mobile
            }
        });
    }
    catch(error){
        console.error("OTP verification error:", error.message);

        return res.status(500).json({
            status: "fail",
            message: "Unable to verify OTP. Please try again."
        });
    }
}


exports.sendForgotPasswordEmail=async(req,res)=>{
    try{
        console.log(req.body);
        const {email}=req.body;
        console.log(email);
        if(!email || typeof email !="string"){
            return res.status(400).json({
                status:"fail",
                message:"Please enter your password"
            })
        }
        const normalizedEmail=email.trim().toLowerCase();
        const user=await ClientsModel.findOne({email:normalizedEmail});

        const message="If an account exists with this email, a password reset link will be sent.";

        if(!user){
            return res.status(404).json({
                status:"fail",
                message
            })
        }

        const resetToken=crypto.randomBytes(32).toString("hex");

        const hashedToken=crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken=hashedToken;
        user.resetPasswordExpires=new Date(Date.now() + 15 * 60 * 1000);

        await user.save();

        const frontendResetLink=`${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        try{
            await sendEmail({
                to:normalizedEmail,
                subject:"Reset Your Password | Ekobasava Naturals",
                text:
                    `Click this link to reset your password. ` +
                    `This link expires in 15 minutes:\n${frontendResetLink}`,
                html: `
                    <div style="font-family:Arial,sans-serif;
                                max-width:500px;margin:auto;padding:20px">
                        <h2 style="color:#367346">
                            Ekobasava Naturals
                        </h2>

                        <h3>Reset Your Password</h3>

                        <p>
                            Click the button below to create a new password.
                        </p>

                        <a href="${frontendResetLink}"
                           style="display:inline-block;
                                  background:#367346;
                                  color:white;
                                  padding:12px 20px;
                                  text-decoration:none;
                                  border-radius:6px">
                            Reset Password
                        </a>

                        <p>
                            This link expires in 15 minutes and can
                            only be used once.
                        </p>

                        <p>If you did not request this, ignore this email.</p>
                    </div>
                `
            })
        }
        catch(error){
            user.resetPasswordToken=undefined;
            user.resetPasswordExpires=expires;
            await user.save();

            throw emailError;
        }

        res.status(200).json({
            status:"success",
            message
        })
    }
    catch(error){
        console.error("Forgot password error:", error);

        return res.status(500).json({
            status: "fail",
            message: "Unable to send the reset link. Please try again."+error.message
        });
    }
}


exports.resetForgotPassword=async(req,res)=>{
    try{
        const {token,password,confirmPassword}=req.body;
        if(!token || !password || !confirmPassword){
            return res.status(400).json({
                status:"fail",
                message:"All fields are required"
            })
        }

        if(password.length<6){
            return res.status(400).json({
                status:"fail",
                message:"Password must be at least 6 characters"
            })
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                status:"fail",
                message:"Passwords do not match"
            })
        }

        const hashedToken=crypto.createHash("sha256").update(token).digest("hex");

        const user=await ClientsModel.findOne({
            resetPasswordToken:hashedToken,
            resetPasswordExpires:{$gt:new Date()}
        })

        if(!user){
            return res.status(400).json({
                status:"fail",
                message:"Reset password link is invalid or expired. Please request a new one"
            })
        }

        const hashNewPassword=await bcrypt.hash(password,10);

        user.password=hashNewPassword;
        user.resetPasswordToken=undefined,
        user.resetPasswordExpires=undefined,

        user.save();

        res.status(200).json({
            status:"success",
            message:"Password reset successfully. Please try to login"
        });
    }
    catch(error){
        console.log("error in reset forgot password: ",error.message);
        res.status(500).json({
            status:"fail",
            message:"error while try to reset password: "+error.message
        })
    }
}