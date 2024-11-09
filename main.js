const express = require('express')
const jwt = require('jsonwebtoken')
const dotEnv = require('dotenv')

const app = express()
const PORT = 4000
app.use(express.json())
dotEnv.config()

const secretKey = process.env.mySecretKey
const users = [
    {
        id: '1',
        username: "mahesh",
        password: "mahesh",
        isAdmin: true
    },
    {
        id: '2',
        username: "suresh",
        password: "suresh",
        isAdmin: false
    }
]

// Middleware to verify user token
const verifyUser = (req, res, next) => {
    const userToken = req.headers.authorization
    if (userToken) {
        const token = userToken.split(" ")[1]
        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.status(403).json({ err: "Token is not valid" })
            }
            req.user = user
            next()
        })
    } else {
        res.status(401).json("You are not authenticated")
    }
}

// Login route to generate JWT token
app.post('/api/login', (req, res) => {
    const { username, password } = req.body

    const user = users.find((person) => {
        return person.username === username && person.password === password
    })

    if (user) {
        const accessToken = jwt.sign({
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin
        }, secretKey)
        res.json({
            username: user.username,
            isAdmin: user.isAdmin,
            accessToken
        })
    } else {
        res.status(401).json("User credentials not matching")
    }
})

// Delete user route with verification
app.delete('/api/User/:userId', verifyUser, (req, res) => {
    if (req.user.id === req.params.userId || req.user.isAdmin) {
        res.status(200).json("User is deleted successfully")
    } else {
        res.status(401).json("You are not allowed to delete this user")
    }
})

app.listen(PORT, () => {
    console.log(`Server started and running @ ${PORT}`)
})
