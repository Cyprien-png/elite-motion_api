import dotenv from "dotenv";
import db from "../../db/index.js"
import jwt from "jsonwebtoken"
import moment from "moment"

dotenv.config()
let auth = {}

//create new token
auth.createToken = (mail, user_id) => {
    let creationTime = moment().format("YYYY-MM-DDTHH:mm:ssZ")
    let payload = { "mail": mail, "user_id": user_id, "created_at": creationTime }

    return jwt.sign(payload, process.env.USER_SESSION_TOKEN_SECRET)
}


auth.createSession = async (res, token, user_id) => {
    try {
        //create session
        await db.createUserSession(token, moment(moment().format("YYYY-MM-DDTHH:mm:ssZ")).add(1, "M").format("YYYY-MM-DDTHH:mm:ssZ"), user_id)

    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
}


//check if session is still valid
auth.checkSession = (req) => {
    return new Promise((resolve, reject) => {


        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        jwt.verify(token, process.env.USER_SESSION_TOKEN_SECRET, { json: true }, async function (err, decoded) {

            let sessions
            let currentSession

            if (!decoded || !decoded.user_id) {
                resolve(false);
                return
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
                return
            } else {
                //if right, renew date 
                try {
                    await db.postponeSessionEnd(currentSession[0].users_session_id, moment(moment()).add(1, "M").format("YYYY-MM-DDTHH:mm:ssZ"))
                } catch (e) {
                    console.log(e)
                    reject(e);
                }
            }
            resolve(true);
        })
    })
};


auth.getUser = async (user) => {
    let userData
    try {
        userData = (await db.getUser(user))[0]

        //wrong email
        if (!userData || !userData.mail || !userData.password) {
            throw new Error("Invalid credentials")
        }
    } catch (e) {
        console.log(e)
        throw new Error("Failed to get user")
    }
    return userData
}



export default auth