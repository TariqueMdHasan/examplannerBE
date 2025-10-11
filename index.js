const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db.js')
const authRoutes = require('./routes/authRoutes.js')
const todoRoutes = require('./routes/todoRoutes.js')
const subjectRoutes = require('./routes/subjectRouter.js')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');

const app = express()
dotenv.config()
connectDB()
app.use(cookieParser());
app.use(cors({
  origin: "https://examplanner-fe.vercel.app",
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8000

app.use('/api/v0/auth', authRoutes)
app.use('/api/v0/subject', subjectRoutes)
app.use('/api/v0/todo', todoRoutes)

app.get('/', (req, res)=> {
    res.send('Welcome world')
    
})

app.listen(PORT, (req, res)=> {
    console.log(`Backend running on ${PORT}`)
})