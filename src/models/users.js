import mongoose from 'mongoose'
 
const Schema = mongoose.Schema
 
const UserSchema = new Schema({
    name: {
        type: String,
        required: 'Name required'
    },
    email :{
        type: String,
        required: true
    },
    profilePicture:{
        type: String,
        required: false
    },
    phone:{
        type: String,
        required: false
    },
    age:{
        type: Number,
        required: false
    },
    address:{
        type: String,
        required: false
    },
    occupation:{
        type: String,
        required: false
    },
    caption:{
        type: String,
        required: false
    }
})
 
export default UserSchema;