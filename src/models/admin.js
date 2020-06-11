import mongoose from 'mongoose'
 
const Schema = mongoose.Schema

/**
 * 
 * @description Admin schema
 * @package mongoose
 * @version 1.0.0
 * @author jeyaraj
 */
const AdminSchema = new Schema({
    firstName: {
        type: String,
        required: 'First Name required'
    },
    lastName: {
        type: String,
        required: false
    },
    email :{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    isEmailVerified:{
        type: Boolean,
        required: true,
        default: false
    },
    role:{
        type: String,
        required: true
    }
})
 
export default AdminSchema;