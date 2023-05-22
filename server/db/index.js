import { config } from "dotenv";
import mysql from "mysql"

config()



const pool = mysql.createPool({
    connectionLimit: 10,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
})

let em_db = {}

em_db.all = () => {
    return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM users", (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}


//get user by mail or user_id
em_db.getUser = (user) => {

    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users WHERE ${user.mail ? 'mail LIKE "' + user.mail + '"' : 'user_id =' + user.user_id}`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}

//update user's data
em_db.updateUser = (user, user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE users SET mail = '${user.mail}', firstname = '${user.firstname}', lastname = '${user.lastname}', birthdate = '${user.birthdate}' WHERE user_id = ${user_id};`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}

//get current user's sessions
em_db.getUsersSessions = (user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users_sessions WHERE users_user_id LIKE '${user_id}'`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}


//delete outdated user's sessions
em_db.deleteUsersSession = (users_session_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM users_sessions WHERE users_session_id = '${users_session_id}'`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}

//check if session still exist
em_db.getSessionByToken = (token) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users_sessions WHERE token LIKE '${token}'`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}

//renew end_date of the session
em_db.postponeSessionEnd = (users_session_id, end_date) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE users_sessions SET end_date = '${end_date}' WHERE users_session_id = '${users_session_id}'`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}


//Create new user
em_db.createUser = (mail, password) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO users (mail, password) VALUES ("${mail}","${password}");`, (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

em_db.deleteUser = (user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `DELETE FROM users WHERE user_id = ${user_id}` , (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}


//Generate a new session for a user
em_db.createUserSession = (token, endDate, userId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO users_sessions (token, end_date, users_user_id) VALUES ("${token}","${endDate}",${userId});`, (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

            
//Create new exercice for the user
em_db.createExo = (exercice, userId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO exercices (name, description, reps, sets, users_user_id) 
            VALUES ("${exercice.name}", "${exercice.description}", "${exercice.reps}", "${exercice.sets}", "${userId}") `, (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

em_db.getUsersExercices = (user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM exercices WHERE users_user_id =${user_id} ORDER BY exercice_id DESC;`, (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

//get exercise by id
em_db.getExerciseById = (exercise_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM exercices WHERE exercice_id =${exercise_id};`, (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

em_db.deleteExercice = (exercice_id, user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `DELETE FROM exercices WHERE exercice_id =${exercice_id} AND users_user_id = ${user_id}` , (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

//update exercice data
em_db.editExercice = (exo, user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE exercices SET name = "${exo.name}", description = "${exo.description}", reps = "${exo.reps}", sets = "${exo.sets}" WHERE exercice_id = ${exo.exercice_id} AND users_user_id = ${user_id};`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}


//create an empty training session
em_db.createTraining = (training_name, user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO training_sessions (name, users_user_id) VALUES ("${training_name}", '${user_id}');`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}

//get a specific training session of a user by its name
em_db.getTrainingByName = (training_name, user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM training_sessions WHERE name = "${training_name}" and users_user_id = "${user_id}";`, (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

//get all training sessions of a user
em_db.getUsersTrainingSessions = (user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM training_sessions WHERE users_user_id =${user_id};`, (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
      })
}

//get training sessions by id
em_db.getTrainingSessionsByID = (training_session_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM training_sessions WHERE training_session_id = ${training_session_id};`, (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
      })
}

//add exercices to a training session
em_db.fillTraining = (training_id, exercise_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO training_sessions_group_exercices (training_sessions_training_session_id, exercices_exercice_id) VALUES ('${training_id}', '${exercise_id}');`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}

em_db.deleteTraining = (training_session_id, user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `DELETE FROM training_sessions WHERE training_session_id = ${training_session_id} and users_user_id = ${user_id}` , (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}


em_db.getTrainingExercices = (training_session_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM training_sessions_group_exercices WHERE training_sessions_training_session_id = ${training_session_id};` , (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

//update training session
em_db.editTrainingName = (training_session_id, users_user_id, newName) => {
    return new Promise((resolve, reject) => {
        pool.query(`UPDATE training_sessions SET name = "${newName}" WHERE training_session_id = ${training_session_id} and users_user_id = ${users_user_id}`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}

//clear training from exercises
em_db.clearTraining = (training_session_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM training_sessions_group_exercices WHERE training_sessions_training_session_id = ${training_session_id}`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}

//get training session by exercice
em_db.getTrainingExercicesByExercise = (exercise_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM training_sessions_group_exercices WHERE exercices_exercice_id = ${exercise_id};` , (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

//schedule a training session
em_db.scheduleTraining = (date, training_session_id, user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO schedules (date, training_sessions_training_session_id, training_sessions_users_user_id) VALUES ("${date}", ${training_session_id}, ${user_id})` , (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

//get all scheduled training session of an user
em_db.getUserSchedules = (user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM schedules WHERE training_sessions_users_user_id = ${user_id};` , (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

//delete a scheduled training session
em_db.deleteScheduledTraining = (user_id, date) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `DELETE FROM schedules WHERE training_sessions_users_user_id = ${user_id} AND date = "${date}"` , (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

//get all scheduled training session on a date
em_db.getScheduleOnDate = (date) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM schedules WHERE date = "${date}";` , (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}


export default em_db

