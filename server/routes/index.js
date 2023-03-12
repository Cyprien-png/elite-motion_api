import dotenv from "dotenv";
import express from "express";
import db from "../db/index.js"
import jwt from "jsonwebtoken"

dotenv.config()

const router = express.Router()


const posts = [
    {
        username: "Carl",
        title: "post 1"
    },
    {
        username: "Patrick",
        title: "post 2"
    }
]

function createToken(user){
    const token = jwt.sign(user, process.env.USER_SESSION_TOKEN_SECRET) 

    console.log(token)
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]
    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user 
        next()
    })
}


router.get("/", async (req, res, next) => {
    try {
        let results = await db.all()
        res.json(results)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

//get user by mail
router.get("/users/getuser", async (req, res, next) => {
    try {
        let results = await db.getUser(req.body.mail)
        res.json(results)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

//test return fake post
router.get("/posts", authenticateToken, (req, res) => {

    res.json(posts.filter(post => post.username === req.user.name))
})


//try auth
router.get("/auth", async (req, res) => {

    let results
    try {
        results = await db.getUser(req.body.mail)
        res.json(results[0].password)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
  
    //check if password is wrong
    if(results[0].password !== req.body.password)res.sendStatus(403)
   // console.log(results[0].password)
   return (results)
})


app.delete("/logout", (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post("/login", (req, res) => {
    //auth by psw

    const username = req.body.username
    const user = req.body 

    const refreshToken = jwt.sign(user, process.env.USER_SESSION_TOKEN_SECRET) 
    res.json({ refreshToken: refreshToken })
})

app.post("/auth", async(req, res) => {
    //auth by psw
    //console.log(req.body)
    const user = req.body
    const results = await checkCredentials(user)

        console.log(results)
     //check if password is wrong
//     if(results[0].password !== user.password) res.sendStatus(403)
     res.json(user)
})



 export const checkCredentials = (user) =>  {

    let results
    try {
        results = db.getUser(user.mail)
    } catch (e) {
        console.log(e)
        return sendStatus(500)
    }
  
   
   // console.log(results[0].password)

   return (results)


}




export default router