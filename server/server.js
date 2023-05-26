import express from 'express';
import apiRouter from "./routes/index.js"
import cors from 'cors';
import schedule from 'node-schedule';
import { sendMail } from './mail/utils/sendMail.js';


const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', apiRouter)

const job = schedule.scheduleJob('00 12 * * *', () => {
  console.log("== Sending Emails ==")
  sendMail()
})


app.listen(process.env.PORT || "3030", () => {
  console.log(`server is running on port: ${process.env.PORT || '3030'}`)
})