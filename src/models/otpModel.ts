import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
  expirationDate: Date;
}

const userOtpAuthentication = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  },
  token: {
    type: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  expirationDate: {
    type: Date
  }
}, { timestamps: true });

export const Otp = mongoose.model<IOtp>('Otp', userOtpAuthentication);
 