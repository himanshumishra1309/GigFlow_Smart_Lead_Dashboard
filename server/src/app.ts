import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: '2mb'}));
app.use(express.urlencoded({extended: true, limit: '2mb'}));
app.use(express.static("public"))
app.use(cookieParser());

app.listen('/', () => {
    console.log("Healthy Server");
})

import userRouter from './routes/user.route'
import leadRouter from './routes/lead.routes'

app.use('/api/v1/user', userRouter)
app.use('/api/v1/lead', leadRouter)

export {app};