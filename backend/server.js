const express=require('express');
const dotenv=require('dotenv');
dotenv.config({path:'./envVariables.env'});
const connectDB=require('./config/db');
const cors=require('cors');
const authRoutes=require('./routes/authRoutes');
const productRoutes=require('./routes/productRoutes');
const invoiceRoutes=require('./routes/invoiceRoutes');


const app=express();
app.use(express.json());

connectDB();

app.use(cors({
    origin:'http://localhost:3000',
    methods:["POST","GET"]
}))

app.use('/api/auth',authRoutes);
app.use('/api/products',productRoutes);
app.use('/api/invoices',invoiceRoutes);


const port=process.env.PORT || 7000;

app.get('/',(req,res)=>{
    res.send('hello from the server');
})

app.listen(port,()=>{
    console.log("server is running on port: ",port);
})

