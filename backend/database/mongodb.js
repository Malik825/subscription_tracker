import mongoose from 'mongoose';
import { DB_URI, NODE_ENV } from '../config/env.js';

if (!DB_URI) {
    throw new Error("Please set the DB_URI environment variable Inside .env<development/production>.local file");
}
const connectDB = async () => {
    try { 
        
        await mongoose.connect(DB_URI)
        console.log(`MongoDB connected successfully in ${NODE_ENV} mode`);
        
    }
    catch (err) {
        console.log(err, `Error connecting to the database`);
        this.exit(1);
        process.exit(1);
    }
}

export default connectDB;