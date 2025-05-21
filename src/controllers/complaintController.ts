import { Request, Response } from 'express';
import { Complaint, IComplaint } from '../models/Complaint';
import { IUser } from '../models/User';
import { BadRequest, NotFound } from '../Error/Error';
import mongoose, { Types } from 'mongoose';
import { sendNotification } from '../middleware/sendNotification';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const createComplaint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, location, images } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      location,
      images,
      citizenId: new Types.ObjectId(req.user._id),
      status: 'pending'
    });

    await complaint.save();

    await sendNotification({
      user: new Types.ObjectId(req.user._id),
      message: 'Your complaint has been submitted.',
      type: 'complaint'
    });
    // Optional: Notify agency or user
  
    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error creating complaint'
    });
  }
};

export const getAllComplaints = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaints = await Complaint.find()
      .populate('citizenId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching complaints'
    });
  }
};

export const getComplaintById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error fetching complaint'
    });
  }
};

export const getComplaints = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const filter: any = {};
    
    // Apply filters based on query parameters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;
    
    // If user is citizen, only show their complaints
    if (req.user.role === 'citizen') {
      filter.citizenId = new Types.ObjectId(req.user._id);
    }
    
    // If user is agency, only show complaints assigned to them
    if (req.user.role === 'agency' && req.user.agency) {
      filter.assignedTo = new Types.ObjectId(req.user.agency);
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit as string) || 10)
      .skip(parseInt(req.query.skip as string) || 0);

    res.json({
      success: true,
      data: complaints
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateComplaintStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!['admin', 'agency'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and agencies can update complaint status'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.status = req.body.status;
    if (req.body.assignedTo) {
      complaint.assignedTo = new Types.ObjectId(req.body.assignedTo);
    }
    
    await complaint.save();

    // Send notifications
    const notificationPromises: Promise<void>[] = [];
  
    // Notify the user
    if (complaint.citizenId) {
      notificationPromises.push(
        sendNotification({
          user: new Types.ObjectId(complaint.citizenId.toString()),
          message: `Your complaint status has been updated to "${req.body.status}".`,
          type: 'complaint',
        })
      );
    }
  
    // Notify the agency (if assigned)
    if (complaint.assignedTo) {
      notificationPromises.push(
        sendNotification({
          user: new Types.ObjectId(complaint.assignedTo.toString()),
          message: `A complaint assigned to your agency is now "${req.body.status}".`,
          type: 'complaint',
        })
      );
    }
  
    // Send all notifications
    try {
      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Failed to send notifications:', error instanceof Error ? error.message : 'Unknown error');
    }
  
    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user has permission to comment
    if (req.user.role === 'citizen' && complaint.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add comment logic here (you'll need to add a comments field to the Complaint model)
    res.status(201).json({
      success: true,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  createComplaint,
  getAllComplaints,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  addComment
};