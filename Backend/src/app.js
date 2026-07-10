import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRouter from './routes/auth.route.js';

const app = express();
app.use(cookieParser());
app.use(morgan('dev'));


app.get('/',(req,res)=>{
    res.status(200).json({
        message: "Welcome to Zentra APi"
    })
})


app.use('/api/auth',authRouter);

export default app;