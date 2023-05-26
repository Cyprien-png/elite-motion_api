import db from "../../db/index.js"
import { sendingEmail } from "../mailer.js"

export const sendMail = async () => {

    let today = new Date()
    let tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const date = tomorrow.setHours(0, 0, 0, 0)

    let schedules

    try {
        schedules = await db.getScheduleOnDate(tomorrow.toISOString())
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

        let trainingSession = await db.getTrainingSessionsByID(trainings[0].training_sessions_training_session_id)
        session = trainingSession[0].name

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


        let message = `Bonjour,\n\nSelon votre programme, demain vous ferez votre séance ${session}.\nPour rappel, cette séance contient des :\n${exo}\n\nNoubliez pas de bien vous hydrater.\nBonne séance !\n\nCordialement, l\'équipe Elite motion.`

        //TODO send mail
        sendingEmail(mail, 'Ne ratez pas votre entrainement demain !', message)
    });
    console.log("== Emails have been sent ==")
}