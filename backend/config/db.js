const mongoose=require('mongoose');

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.CONN_STR);
        console.log("Database connected successfully");
    }
    catch(error){
        console.log("error while connecting to Database: ",error);
    }
}

module.exports=connectDB;