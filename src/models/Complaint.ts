import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

export interface IComplaint extends Document {
  title: string;
  description: string;
  category: string;
  location: string;
  images: string[];
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  citizenId: IUser['_id'];
  assignedTo?: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'rejected'],
    default: 'pending'
  },
  citizenId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema); 