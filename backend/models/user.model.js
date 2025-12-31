import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minLength: [3, 'Username must be at least 3 characters long'],
        maxLength: [50, 'Username must be at most 50 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']

    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 characters long'],

    },
    isVerified: {
        type: Boolean,
        default: false
    },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpiresAt: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;