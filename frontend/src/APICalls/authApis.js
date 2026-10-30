import axios from 'axios';
export const createAccount=async(userData)=>{
    const res=await axios.post('http://localhost:8000/api/auth/signup',userData);
    return res.data;
}

export const loginToAccount=async(userData)=>{
    const res=await axios.post('http://localhost:8000/api/auth/login',userData);
    return res.data;
}

export const verifyOtp=async(verificationData)=>{
    const res=await axios.post('http://localhost:8000/api/auth/verify-otp',verificationData);
    return res.data;
}

export const sendEmailForForgotPassword=async(email)=>{
    const res=await axios.post('http://localhost:8000/api/auth/send-forgot-password-email',{email});
    console.log(res);
    return res.data;
}

export const resetForgotPassword=async(passwordResetData)=>{
    const res=await axios.post('http://localhost:8000/api/auth/reset-forgot-password',passwordResetData);
    console.log(res);
    return res.data;
}