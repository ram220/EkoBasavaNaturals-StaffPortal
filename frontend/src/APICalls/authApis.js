import axios from 'axios';

const liveUrl="https://eko-basava-naturals.vercel.app"
//const baseUrl="http://localhost:8000";

export const createAccount=async(userData)=>{
    const res=await axios.post(`${liveUrl}/api/auth/signup`,userData);
    return res.data;
}

export const loginToAccount=async(userData)=>{
    const res=await axios.post(`${liveUrl}/api/auth/login`,userData);
    return res.data;
}

export const verifyOtp=async(verificationData)=>{
    const res=await axios.post(`${liveUrl}/api/auth/verify-otp`,verificationData);
    return res.data;
}

export const sendEmailForForgotPassword=async(email)=>{
    const res=await axios.post(`${liveUrl}/api/auth/send-forgot-password-email`,{email});
    console.log(res);
    return res.data;
}

export const resetForgotPassword=async(passwordResetData)=>{
    const res=await axios.post(`${liveUrl}/api/auth/reset-forgot-password`,passwordResetData);
    console.log(res);
    return res.data;
}