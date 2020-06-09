import express from 'express'
import routes from './routes/routes'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import config from 'config'
 
const app = express()
const PORT = process.env.PORT || config.get('PORT')
const DB_URL = config.get('db.url')
 
mongoose.Promise = global.Promise;
mongoose.connect(DB_URL)

app.use(cors())
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
 
routes(app)
 
app.listen(PORT, () => {
    console.log(`you are server is running on ${PORT}`);
})
