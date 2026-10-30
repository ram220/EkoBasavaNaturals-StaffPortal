const express=require('express');
const authControllers=require('../controllers/authControllers');

const router=express.Router();

router.post('/signup',authControllers.signUp);
router.post('/login',authControllers.login);
//router.post('/test-email',authControllers.sendEmailForOtpVerification);
router.post('/verify-otp',authControllers.verifyOtp);
router.post('/send-forgot-password-email',authControllers.sendForgotPasswordEmail);
router.post('/reset-forgot-password',authControllers.resetForgotPassword);

module.exports=router