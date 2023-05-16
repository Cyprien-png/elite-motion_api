import db from "../../db/index.js"
import { sendingEmail } from "../mailer.js"

export const sendMail = async () => {

    const date = new Date(new Date().setHours(0, 0, 0, 0))
    let schedules

    try {
        schedules = await db.getScheduleOnDate(date.toISOString())
    } catch (e) {
        console.log(e)
    }


    schedules.forEach(async (schedule) => {

        //Name of training session
        let session
        //String of all exercises in the session
        let exo = ""
        //Email of the user
        let mail


        let trainings = await db.getTrainingExercices(schedule.training_sessions_training_session_id)

        let trainingSession = (await db.getTrainingSessionsByID(trainings[0].exercices_exercice_id))[0]
        session = trainingSession.name

        let user = (await db.getUser({ "user_id": schedule.training_sessions_users_user_id }))[0]
        mail = user.mail

        await Promise.all(trainings.map(async (training) => {
            let exercise = (await db.getExerciseById(training.exercices_exercice_id))[0]

            if (exo === "") {
                exo = exercise.name
            } else {
                exo = exo + ", " + exercise.name
            }
        }));

        //TODO send mail
        sendingEmail()
    });
}