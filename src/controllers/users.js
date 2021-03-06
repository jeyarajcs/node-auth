import config from 'config'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'
import sgTransport from 'nodemailer-sendgrid-transport'
import jsonwebtoken from 'jsonwebtoken'
import userSchema from '../models/users'
import adminSchema from '../models/admin'
 
const JWTSecret = config.get('jwt.secret')
const JWTExpiry = config.get('jwt.expiryTime')
const SENDGRID_APIKEY = config.get('sendGrid.apiKey')
const SENDGRID_EMAIL = config.get('sendGrid.fromEmail')
const VERIFICATION_URL = config.get('verificationURL')

const User = mongoose.model('User', userSchema)
const Admin = mongoose.model('Admin', adminSchema)

 
/**
 * 
 * @description Create user.
 * @param {object} req 
 * @param {object} res 
 * @async true
 * @returns Promise
 * @requires req.body
 * @version 1.0.0
 * @author Jeyaraj
 */
export function addNewUser(req, res) {
    let newUser = new User(req.body)
    newUser.save((error, user) => {
        if (error) { res.json(error) }
        res.send({
            status: "success",
            data: user
        })
    })
}
 
/**
 * 
 * @description Get all users from db.
 * @param {object} req 
 * @param {object} res 
 * @async true
 * @returns Promise
 * @version 1.0.0
 * @author Jeyaraj
 */
export function getUsers(req, res) {
    User.find({}, (error, users) => {
        if (error) { res.json(error) }
        res.send({
            status: "success",
            data: users
        })
    })
}
 
/**
 * 
 * @description Get single user by id.
 * @param {object} req 
 * @param {object} res 
 * @async true
 * @returns Promise
 * @requires req.params.id
 * @version 1.0.0
 * @author Jeyaraj
 */
export function getUser(req, res) {
    User.findById(req.params.id, (error, user) => {
        if (error) { res.json(error) }
        res.send({
            status: "success",
            data: user
        })
    })
}
 
/**
 * 
 * @description Update user - Only admin can edit the record using access token. The user will get email notification also.
 * @param {object} req 
 * @param {object} res 
 * @async true
 * @returns Promise
 * @requires req.body,req.params.id
 * @version 1.0.0
 * @author Jeyaraj
 */
export function updateUser(req, res) {
    User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true }, (error, user) => {
        if (error) { res.json(error) }
        sendMail(user, "updateNotification").then(data=>{
                res.send({
                status: "success",
                message: user,
                data: data
            })
        }).catch(e=>{
            res.json(e)
        })
    })
}
 
/**
 * 
 * @description Delete a user from db by id.
 * @param {object} req 
 * @param {object} res 
 * @async true
 * @returns Promise
 * @requires req.params.id
 * @version 1.0.0
 * @author Jeyaraj
 */
export function deleteUser(req, res) {
    User.remove({ _id: req.params.id }, (error, user) => {
        if (error) { res.json(error) }
        res.send({
            status: "success",
            data: user
        })
    })
}

/**
 * 
 * @description register a admin user into db. After successfull registration, it will send the email verification link.
 * @param {object} req 
 * @param {object} res 
 * @async true
 * @returns Promise
 * @requires req.body
 * @version 1.0.0
 * @author Jeyaraj
 */
export function addAdmin(req, res) {
    req.body.role = "admin";
    let newAdmin = new Admin(req.body)
    newAdmin.save((error, admin) => {
        if (error) { res.json(error) }
        sendMail(admin, "emailVerification").then(data=>{
                res.send({
                status: "success",
                message: "Verification mail has been sent to your email.",
                data: data
            })
        }).catch(e=>{
            res.json(e)
        })
    })
}

/**
 * 
 * @description Verify the admin user when clicks on email link. This will be activated the admin user.
 * @param {object} req 
 * @param {object} res 
 * @async true
 * @returns Promise
 * @requires req.params.token
 * @version 1.0.0
 * @author Jeyaraj
 */
export function verifyAdmin(req, res) {
    jsonwebtoken.verify(req.params.token, JWTSecret, (err, decoded)=>{
        if(err){
            res.json({
                status:"error",
                message:"Email verification failed"
            })
        }else{
            let filter = {email:decoded.email, role:decoded.role, isEmailVerified:false}
            Admin.findOneAndUpdate(filter,{$set:{"isEmailVerified":true}},(error, admin)=>{
                if(error) { res.json(error)}
                res.send({
                    status:"success",
                    message: "Email verified successfully"
                })
            })
        }
    });
}

/**
 * 
 * @description Login for Admin user
 * @param {object} req 
 * @param {object} res
 * @async true
 * @returns Promise - If the email not verified, It throws error.
 * @version 1.0.0
 * @author Jeyaraj
 */
export function login(req, res) {
    let admin = {
        email: req.body.email,
        password: req.body.password,
        isEmailVerified: true
    }
    Admin.findOne(admin, (error, admin) => {
        if (error) { res.json(error) }
        if(admin && admin != null){
            res.send({
                status: "success",
                token: generateJWT(admin)
            })
        }else{
            res.send({
                status:"error",
                message:"Invalid Email/Password. If already registered, please verify your email."
            })
        }
        
    })
}

/**
 * 
 * @description Generate JWT for authentication
 * @param {object} data 
 * @requires data
 * @returns token
 * @version 1.0.0
 * @author Jeyaraj
 */
function generateJWT(data){
    try{
        const payload = {
            email:data.email,
            role:data.role
        }
        const token = jsonwebtoken.sign(payload, JWTSecret, {expiresIn: JWTExpiry});
        return token;
    }catch(e){
        return e;
    }
}

/**
 * 
 * @description Sending email to user's email
 * @param {object} admin contain email, role
 * @param {string} purpose notification type - email verification or update notification
 * @requires admin,purpose
 * @returns Promise
 * @async true
 * @version 1.0.0
 * @author Jeyaraj
 */
async function sendMail(admin, purpose){
    try{
        let htmlContent ="";
        let textContent = "";
        if(purpose && purpose == "emailVerification"){
            const token = generateJWT(admin)
            textContent = "Email Verification"
            htmlContent = `<a href=${VERIFICATION_URL}/admin/verification/${token}>Click to verify</a>`
        }
        else if(purpose && purpose == "updateNotification"){
            textContent = "Update Notification"
            htmlContent = `<h4>Your data that associate with ${admin.email} has been updated.</h4>`
        }
        else{
            htmlContent ="<h4>Dummy</h4>";
            textContent = "Dummy";
        }
        const account = await nodemailer.createTestAccount();
        
        const options = {
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: account.user,
                pass: account.pass
            }
        }
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport(options);
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: 'admin@nodeauth.com', // sender address
          to: admin.email, // list of receivers
          subject: textContent, // Subject line
          text: textContent, // plain text body
          html: htmlContent, // html body
        });
        return ({
            emailInfo:info,
            emailURL: nodemailer.getTestMessageUrl(info)
        })
    }catch(e){
        return e
    }
    
  }
