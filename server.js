require('dotenv').config()

const express= require('express')
const app=express()
const mongoose = require('mongoose')  

mongoose.connect(process.env.DATABASE_URL)
const db=mongoose.connection
db.on('error',(error)=>console.error(error))
db.once('open',()=>console.log("🦅 << Database Connected >> 🦅"))

app.use(express.json())

const subscribersRouter = require('./routes/login-page')
app.use('/login-page',subscribersRouter)

const canteenroute = require('./routes/canteen')
app.use('/canteen',canteenroute)

const cartroute = require('./routes/addtocart')
app.use('/addtocart',cartroute)

app.listen(4201, ()=>console.log("🦅 << Server is on Air >> 🦅"))