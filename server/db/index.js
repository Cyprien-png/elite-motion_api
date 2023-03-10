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

let chriprdb = {}

chriprdb.all = () => {
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
chriprdb.getUser = (mail) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users WHERE mail LIKE '${mail}'`, (err, results) => {
            if (err) {
                return reject(err)
            }
            return resolve(results)
        })
    })
}


export default chriprdb