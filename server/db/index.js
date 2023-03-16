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


//get user by mail
em_db.getUser = (mail) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users WHERE mail LIKE '${mail}'`, (err, results) => {
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

export default em_db

