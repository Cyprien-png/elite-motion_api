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

em_db.createUserSession = () => {
    return new Promise((resolve, reject) => {
        pool.query(
            `INSERT INTO users_sessions (token, end_date, users_user_id) 
            VALUES (
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYWlsIjoiYWRtaW5AdGVzdC5jaCIsImlhdCI6MTY3ODYyNzIyOH0.BaPK0WsTgGx1fvzKgXCWhuBOUYgpmYmeOqpAGRT1xEa",
                "12.04.2033",
                1
            );`
            , (err, results) => {
                if (err) {
                    return reject(err)
                }
                return resolve(results)
            })
    })
}

export default em_db