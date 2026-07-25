import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'User Name is required'],
        trim: true,
        minLength: [3, 'User Name must be atleast 3 characters long'],
        maxLength: [50, 'User Name must be less than 50 characters long']
    },
    email:{
        type: String,
        required: [true, 'User Email is required'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address']
    },
    password:{
        type:String,
        required: [true, 'User Password is required'],
        minLength: [8, 'User Password must be atleast 8 characters long']
    }
} , {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;