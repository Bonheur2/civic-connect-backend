import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { Otp } from '../models/otpModel';
import { sendEmail } from '../middleware/sendMail';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'citizen' | 'admin' | 'agency' | 'super-admin';
    agency?: string;
    phoneNumber?: string;
    address?: string;
  };
}

export const registerUser = async (req: RegisterRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role = 'citizen', agency, phoneNumber, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new user
    const user = new User({
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
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    // Save OTP
    const otpRecord = new Otp({
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

    await sendEmail(email, 'Verify Your Email', emailBody);

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id.toString() },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      { expiresIn: '24h' }
    );

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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const otpRecord = await Otp.findOne({
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
    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during email verification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

    // Save new OTP
    const otpRecord = new Otp({
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

    await sendEmail(email, 'New Verification Code', emailBody);

    res.json({
      success: true,
      message: 'New verification code sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending new verification code',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  registerUser,
  verifyEmail,
  resendVerification
};