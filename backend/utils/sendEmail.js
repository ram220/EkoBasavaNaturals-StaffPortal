const {Resend}=require('resend')

const resend=new Resend(process.env.RESEND_API_KEY);

const sendEmail=async({to,subject,text,html})=>{
    const {data,error}=await resend.emails.send({
        //from:process.env.RESEND_FROM_EMAIL,
        from: "Ekobasava Naturals <notifications@ekobasavanaturals.com>",
        to,
        subject,
        text,
        html
    })

    if(error){
        console.error("Resend email error:", error);
        throw new Error("Failed to send email");
    }

    return data;
}

module.exports=sendEmail;