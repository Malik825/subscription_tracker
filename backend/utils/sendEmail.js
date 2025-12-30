import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASSWORD } from '../config/env.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
    },
});

export const sendVerificationEmail = async (email, verificationToken) => {
    // Determine the frontend URL based on environment (simplified for now)
    // In production, this should come from process.env.CLIENT_URL
    const clientUrl = 'http://localhost:8080';
    const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - SubTrack',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">Welcome to SubTrack!</h2>
                <p style="text-align: center; color: #333;">Please verify your email address to activate your account and start tracking your subscriptions.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                </div>
                <p style="text-align: center; color: #666; font-size: 12px;">Link expires in 24 hours.</p>
                <p style="text-align: center; color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Could not send verification email');
    }
};
