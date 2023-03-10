import { config } from "dotenv";
import {checkCredentials} from "./routes/index.js"
import express from "express"
import jwt from "jsonwebtoken";

config()
const app = express();

app.use(express.json());

app.delete("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post("/login", (req, res) => {
    //auth by psw

    const username = req.body.username
    const user = req.body 

    const refreshToken = jwt.sign(user, process.env.USER_SESSION_TOKEN_SECRET) 
    res.json({ refreshToken: refreshToken })
})

app.post("/auth", async(req, res) => {
    //auth by psw
    //console.log(req.body)
    const user = req.body
    const results = await checkCredentials(user)

        console.log(results)
     //check if password is wrong
//     if(results[0].password !== user.password) res.sendStatus(403)
     res.json(user)
})




function createToken(user){
    const token = jwt.sign(user, process.env.USER_SESSION_TOKEN_SECRET) 

    console.log(token)
}




app.listen(process.env.PORT || "3031", () => {
    console.log(`server is running on port: ${process.env.PORT || '3031'}`)
})