import dotenv from "dotenv";
import express from "express";
import db from "../db/index.js"
import jwt from "jsonwebtoken"
import moment from "moment"

dotenv.config()
const router = express.Router()


//check if session is still valid
const checkSession = (req) => {
    return new Promise((resolve, reject) => {
        let result = true

        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        result = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET, { json: true }, async function (err, decoded) {

            let sessions
            let currentSession

            if (!decoded || !decoded.user_id) {
                resolve(false);
            }

            //getCurrentSession
            try {
                currentSession = (await db.getSessionByToken(token))
            } catch (e) {
                reject(e);
            }

            //get all tokens of current user 
            try {
                sessions = (await db.getUsersSessions(decoded.user_id))
                if (!sessions || sessions.length < 1) {
                    resolve(false);
                }
            } catch (e) {
                console.log(e)
                reject(e);
            }
            //check every tokens date and remove outdated
            if (sessions && sessions.length > 0) {
                for (const session of sessions) {
                    if (moment(session.end_date, "YYYY-MM-DDTHH:mm:ssZ").format("x") < moment().format("x")) {
                        await db.deleteUsersSession(session.users_session_id);
                    }
                }
            }

            //check if token is valid 
            if (currentSession.length <= 0) {
                resolve(false);

            } else {
                //if right, renew date 
                try {
                    await db.postponeSessionEnd(currentSession[0].users_session_id, moment(moment()).add(1, "M").format("YYYY-MM-DDTHH:mm:ssZ"))
                } catch (e) {
                    console.log(e)
                    reject(e);
                }
            }
        })
        resolve(true);
    })
}


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

    if (!user.password || !userData.password || user.password !== userData.password) {
        //wrong password
        res.sendStatus(401)
    } else {
        let creationTime = moment().format("YYYY-MM-DDTHH:mm:ssZ")
        let payload = { "mail": user.mail, "user_id": userData.user_id, "created_at": creationTime }

        const token = jwt.sign(payload, process.env.USER_SESSION_TOKEN_SECRET)

        try {
            //create session
            await db.createUserSession(token, moment(creationTime).add(1, "M").format("YYYY-MM-DDTHH:mm:ssZ"), userData.user_id)

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



//Verify if user's token is still valid
router.get("/sessionCheck", async (req, res) => {

    checkSession(req)
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