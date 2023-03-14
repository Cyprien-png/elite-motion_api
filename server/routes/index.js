import dotenv from "dotenv";
import express from "express";
import db from "../db/index.js"
import jwt from "jsonwebtoken"
import moment from "moment"

dotenv.config()

const router = express.Router()


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}




//Verify if mail and password match 
router.post("/login", async (req, res) => {

    const user = req.body
    let userData

    try {
        userData = (await db.getUser(user.mail))[0]
        //wrong email
        if (!userData || !userData.mail || !userData.password) res.sendStatus(401)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }

    if (!user.password || user.password !== userData.password) {
        //wrong password
        res.sendStatus(401)
    } else {
        const token = jwt.sign(user.mail + Date.now(), process.env.USER_SESSION_TOKEN_SECRET)
        const endDate = moment().add(1, "M").format('DD.MM.YYYY')

        try {
            //create session
            await db.createUserSession(token, endDate, userData.user_id)

            //send token
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            res
                .json({ token: token })
                //.sendStatus(200)

        } catch (e) {
            console.log(e)
            res.sendStatus(500)
        }
    }

})


export default router