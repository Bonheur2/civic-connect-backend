"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerification = exports.verifyEmail = exports.registerUser = void 0;
const User_1 = require("../models/User");
const otpModel_1 = require("../models/otpModel");
const sendMail_1 = require("../middleware/sendMail");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const registerUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName, role = 'citizen', agency, phoneNumber, address } = req.body;
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        // Create new user
        const user = new User_1.User({
            email,
            password,
            firstName,
            lastName,
            role,
            agency,
            phoneNumber,
            address
        });
        await user.save();
        // Generate OTP
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
        // Save OTP
        const otpRecord = new otpModel_1.Otp({
            user: user._id,
            token: otp,
            expirationDate: otpExpiry
        });
        await otpRecord.save();
        // Send verification email
        const emailBody = `
      <h1>Welcome to Civic Connect!</h1>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;
        await (0, sendMail_1.sendEmail)(email, 'Verify Your Email', emailBody);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production', { expiresIn: '24h' });
        res.status(201).json({
            success: true,
            message: 'Registration successful. Please verify your email.',
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    agency: user.agency
                },
                token
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during registration',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.registerUser = registerUser;
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const otpRecord = await otpModel_1.Otp.findOne({
            user: user._id,
            token: otp,
            expirationDate: { $gt: new Date() }
        });
        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }
        // Delete used OTP
        await otpModel_1.Otp.deleteOne({ _id: otpRecord._id });
        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during email verification',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Generate new OTP
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);
        // Save new OTP
        const otpRecord = new otpModel_1.Otp({
            user: user._id,
            token: otp,
            expirationDate: otpExpiry
        });
        await otpRecord.save();
        // Send new verification email
        const emailBody = `
      <h1>Email Verification</h1>
      <p>Your new verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;
        await (0, sendMail_1.sendEmail)(email, 'New Verification Code', emailBody);
        res.json({
            success: true,
            message: 'New verification code sent successfully'
        });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending new verification code',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.resendVerification = resendVerification;
exports.default = {
    registerUser: exports.registerUser,
    verifyEmail: exports.verifyEmail,
    resendVerification: exports.resendVerification
};
