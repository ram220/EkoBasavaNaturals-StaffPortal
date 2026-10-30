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


const allowedOrigins = [
    "http://localhost:3000",
    "https://eko-basava-naturals-staff-portal-p1h9gf5xk-ram220s-projects.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    methods:["POST","GET"],
    credentials: true
}));


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

