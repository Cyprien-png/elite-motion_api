import dotenv from "dotenv";
import db from "../../db/index.js"
import jwt from "jsonwebtoken"
import moment from "moment"

dotenv.config()
let sport = {}

sport.getPrograms = async(user_id) => {
    let programs
    
    try {
        programs = await db.getUsersprograms(user_id)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }

    return programs
}


sport.getTraining = async(user_id) => {
    let trainingSessions
    
    try {
        trainingSessions = await db.getUsersTrainingSessions(user_id)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }

    return trainingSessions
}


sport.getExercices = async(user_id) => {
    let exercices
    
    try {
        exercices = await db.getUsersExercices(user_id)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }

    return exercices
}




export default sport