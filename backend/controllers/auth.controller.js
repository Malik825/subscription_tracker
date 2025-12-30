import mongoose from "mongoose"
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const registerUser = async (req, res, next) => { 
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Implement registration logic here
        const { username, email, password } = req.body;
        const existingUser = await mongoose.model('User').findOne({ email });
        if (existingUser) { 
            const error = new Error('User already exists with this email');
            error.statusCode = 409;
            throw error;

        }
        // Hash password before saviameg to database
        const salt = await bcrypt.genSalt(10);
        const hashePassword = await bcrypt.hash(password, salt);
        const newUser = await User.create([
            { username, email, password: hashePassword }
        ], { session });

    const token = jwt.sign(
    { userId: newUser[0]._id }, 
    JWT_SECRET,                 
    { expiresIn: JWT_EXPIRES_IN }
);

        await session.commitTransaction();
        session.endSession();
      res.status(201).json({ 
    success: true, 
    message: 'User created successfully', 
    data: {
        token, 
        user: newUser[0] 
    }
});

   } catch (error) {
        await session.abortTransaction();
        session.endSession();
    next(error);
   }

}
export const loginUser = async (req, res, next) => {
    
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) { 
            const error = new Error('Invalid email or password');
            error.statusCode = 404;
            throw error;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            { userId: user._id }, 
            JWT_SECRET,                 
            { expiresIn: JWT_EXPIRES_IN }
        );
        res.status(200).json({
            success: true, 
            message: 'User logged in successfully', 
            data: {
                token, 
                user
            }
        });

    } catch (error) {
        next(error);
    }
}
 

export const logoutUser = async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
}
 