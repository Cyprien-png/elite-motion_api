import dotenv from "dotenv";
import express from "express";
import db from "../db/index.js";
import auth from "./utils/auth.js";
import jwt from "jsonwebtoken"

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


router.get("/getUser", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                let userData = await auth.getUser({ user_id: decoded.user_id }, res)
                delete userData.password


                res.json(userData)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })

})


router.post("/updateUser", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                const user = req.body
                
                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //update user's data
                try {
                    await db.updateUser(user, decoded.user_id)
                    res.sendStatus(200)

                } catch (e) {
                    res.sendStatus(409)
                }

            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })

})






router.get("/getPrograms", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //get user's programs
                let programs = await sport.getPrograms(decoded.user_id)
                res.json(programs)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })
})

router.get("/getTrainingSessions", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //get user's Training sessions
                let trSessions = await sport.getTraining(decoded.user_id)
                res.json(trSessions)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })
})

router.get("/getExercices", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //get user's exercices
                let exercices = await sport.getExercices(decoded.user_id)
                res.json(exercices)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })
})
//dasd
export default router