import express from 'express';
import apiRouter from "./routes/index.js"


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', apiRouter)

app.listen(process.env.PORT || "3030", () => {
    console.log(`server is running on port: ${process.env.PORT || '3030'}`)
})
