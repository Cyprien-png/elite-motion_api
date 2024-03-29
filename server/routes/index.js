import dotenv from "dotenv";
import express from "express";
import db from "../db/index.js";
import auth from "./utils/auth.js";
import sport from "./utils/sport.js";
import jwt from "jsonwebtoken"

dotenv.config()
const router = express.Router()


//Verify if mail and password match 
router.post("/login", async (req, res) => {

    const user = req.body

    if (!user || !user.mail || !user.password) {
        return res.sendStatus(500)
    }

    try {
        let userData = await auth.getUser(user)

        if (!userData || !user.password || !userData.password || user.password !== userData.password) {
            //wrong password
            return res.sendStatus(401)
        } else {
            const token = auth.createToken(user.mail, userData.user_id)

            //Create session
            auth.createSession(res, token, userData.user_id)

            //send token
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            return res.json({ token: token })
        }
    } catch (e) {
        console.log(e)
        res.sendStatus(401)
    }

})



//Create an account for the new user
router.post("/signup", async (req, res) => {

    const user = req.body

    if (!user || !user.mail || !user.password) {
        return res.sendStatus(500)

    }

    //Check if email is already taken
    let ghostUser
    try {
        ghostUser = await db.getUser({ mail: user.mail })

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
    let userData = await auth.getUser(user)


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

                let userData = await auth.getUser({ user_id: decoded.user_id })
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


router.put("/updateUser", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                const user = req.body
                
                //Check if informations are in a valid format
                if ('user_id' in user && 'mail' in user && 'firstname' in user && 'lastname' in user && 'birthdate' in user) {
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

                }

                else {
                    res.status(500).send("Internal Server Error")
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


router.get("/getExercises", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //get user's exercises
                let exercises = await sport.getExercises(decoded.user_id)
                res.json(exercises)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })
})


router.delete("/removeExercise", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {
                const exo = req.body

                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                let linkedTrainingsessions = await db.getTrainingExercisesByExercise(exo.exercise_id)


                //remove every training that have less than 2 exercises
                linkedTrainingsessions.forEach(async (session) => {
                    let training = await db.getTrainingExercises(session.training_sessions_training_session_id)

                    if (training.length <= 2) {
                        //delete user's training session
                        await db.deleteTraining(training[0].training_sessions_training_session_id, decoded.user_id)
                    }
                })

                //get user's exercises
                await db.deleteExercise(exo.exercise_id, decoded.user_id)

                res.sendStatus(200)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })
})


router.put("/editExercise", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                const exo = req.body

                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //update user's data
                try {
                    await db.editExercise(exo, decoded.user_id)
                    res.sendStatus(200)

                } catch (e) {
                    res.sendStatus(500)
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


router.post("/createExercise", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                const exercise = req.body

                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //get user's exercises

                try {
                    await db.createExo(exercise, decoded.user_id)
                } catch (e) {
                    console.log(e)
                    return res.sendStatus(500)
                }

                res.sendStatus(200)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })
})


router.delete("/deleteUser", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //get user's exercises
                await db.deleteUser(decoded.user_id)
                res.sendStatus(200)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            res.status(500).send("Internal Server Error");
        })
})


router.post("/createTraining", async (req, res) => {
    //Create a new training session
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                const training = req.body

                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //generate the the new training (empty)
                try {
                    await db.createTraining(training.name, decoded.user_id)
                } catch (e) {
                    if (e.code == "ER_DUP_ENTRY") {
                        //The user already have a training with this name
                        return res.sendStatus(409)
                    } else {
                        return res.sendStatus(500)
                    }
                }

                //get new training ID
                let newTraining = (await db.getTrainingByName(training.name, decoded.user_id))[0]

                //link exercises to the new training session
                training.exercisesId.forEach(async (exo) => {
                    await db.fillTraining(newTraining.training_session_id, exo.exerciseId)
                })

                res.sendStatus(200)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            res.status(500).send("Internal Server Error");
        })
})

router.delete("/removeTraining", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {
                const training = req.body

                //get user data
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decodedUser = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //delete user's training session
                await db.deleteTraining(training.training_session_id, decodedUser.user_id)
                res.sendStatus(200)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })
})

router.get("/getTrainingExercises", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                const training = req.query

                //get training's exercises
                let exercises = await db.getTrainingExercises(training.training_session_id)
                res.json(exercises)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })
})

router.put("/editTrainingSession", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                const training = req.body

                //get user's id
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                try {
                    //edit training name
                    await db.editTrainingName(training.training_session_id, decoded.user_id, training.name)

                    //remove all exercises from the training session
                    await db.clearTraining(training.training_session_id)

                    //link exercises to the current training session
                    training.exercises.forEach(async (exo) => {
                        await db.fillTraining(training.training_session_id, exo.exercise_id)
                    })

                } catch (e) {
                    if (e.code == "ER_DUP_ENTRY") {
                        //The user already have a training with this name
                        return res.sendStatus(409)
                    } else {
                        return res.sendStatus(500)
                    }
                }

                res.sendStatus(200)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })
})


router.post("/createNewSchedule", async (req, res) => {
    //Create a new training session
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                const schedule = req.body
                //get user info
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //delete if a training is already planned at this date
                try {
                    await db.deleteScheduledTraining(decoded.user_id, schedule.date)
                } catch {
                    res.sendStatus(500)
                }

                //schedule new training
                try {
                    await db.scheduleTraining(schedule.date, schedule.training_session_id, decoded.user_id)
                } catch (e) {
                    return res.sendStatus(500)
                }

                res.sendStatus(200)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            res.status(500).send("Internal Server Error");
        })
})

router.get("/getUserSchedules", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {

                //get user info
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decoded = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //get user's scheduled training sessions
                let schedules = await db.getUserSchedules(decoded.user_id)
                res.json(schedules)
            } else {
                res.status(401).send("Unauthorized");
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        })
})

router.delete("/removeScheduledTraining", async (req, res) => {
    //check if session still valid
    auth.checkSession(req)
        .then(async (isValid) => {
            if (isValid) {
                const schedule = req.body

                //get user data
                const token = req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
                const decodedUser = jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET)

                //delete user's training session
                try {
                    await db.deleteScheduledTraining(decodedUser.user_id, schedule.date)
                    res.sendStatus(200)
                } catch {
                    res.sendStatus(500)
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

export default router