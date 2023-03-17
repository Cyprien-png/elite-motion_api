import dotenv from "dotenv";
import express from "express";
import db from "../db/index.js";
import auth from "./utils/auth.js";

dotenv.config()
const router = express.Router()


//Verify if mail and password match 
router.post("/login", async (req, res) => {

    const user = req.body

    if (!user || !user.mail || !user.password) {
        res.sendStatus(500)
        return
    }

    let userData = await auth.getUser(user, res)

    if (!user.password || !userData.password || user.password !== userData.password) {
        //wrong password
        res.sendStatus(401)

    } else {
        const token = auth.createToken(user.mail, userData.user_id)

        //Create session
        auth.createSession(res, token, userData.user_id)

        //send token
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        res.json({ token: token })
    }

})



//Create an account for the new user
router.post("/signup", async (req, res) => {

    const user = req.body

    if (!user || !user.mail || !user.password) {
        return res.sendStatus(500)

    }

    let ghostUser

    try {
        ghostUser = await db.getUser(user.mail)
        if (ghostUser.length > 0) {
            return res.sendStatus(409)

        }
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }

    //Create account
    try {
        await db.createUser(user.mail, user.password)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }

    //Read the new user fields in db to get its id
    let userData = await auth.getUser(user, res)


    //create token
    const token = auth.createToken(user.mail, userData.user_id)

    //Create session
    auth.createSession(res, token, userData.user_id)

    //send token
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    res.json({ token: token })

})



//Verify if user's token is still valid
router.get("/sessionCheck", async (req, res) => {
    auth.checkSession(req)
        .then((isValid) => {
            if (isValid) {
                res.sendStatus(200)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });

})



export default router