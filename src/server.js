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

// ---- SERVE STATIC FILES ---- //
app.use(function(req, res, next) {
    next();
}, express.static("public"));

app.use(cors())
app.use(helmet());
app.use(bodyParser.json({limit: "50mb"})) 
app.use(bodyParser.urlencoded({
    limit: "50mb",   // This limit is for avoid payload too large issue(When request contains base64 kind of files)
    extended: true,
    parameterLimit:50000  // This limit is for avoid payload too large issue
}))
 
routes(app)
 
app.listen(PORT, () => {
    console.log(`you are server is running on ${PORT}`);
})
