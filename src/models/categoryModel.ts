import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  agency_id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  agency_id: {
    type: Schema.Types.ObjectId,
    ref: 'Agency',
    required: [true, 'Agency ID is required']
  }
}, { timestamps: true });

export const Category = mongoose.model<ICategory>('Category', categorySchema);