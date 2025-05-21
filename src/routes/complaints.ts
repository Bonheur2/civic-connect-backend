import express from 'express';
import { Complaint } from '../models/Complaint';
import { auth, checkRole } from '../middleware/auth';

const router = express.Router();

// Submit a new complaint
router.post('/', auth, async (req, res) => {
  try {
    const complaint = new Complaint({
      ...req.body,
      citizenId: req.user?._id
    });
    await complaint.save();
    res.status(201).json(complaint);
  } catch (error) {
    res.status(400).json({ error: 'Error creating complaint' });
  }
});

// Get all complaints (with filtering)
router.get('/', auth, async (req, res) => {
  try {
    const filter: any = {};
    
    // Apply filters based on query parameters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;
    
    // If user is citizen, only show their complaints
    if (req.user?.role === 'citizen') {
      filter.citizenId = req.user._id;
    }
    
    // If user is agency, only show complaints assigned to them
    if (req.user?.role === 'agency') {
      filter.assignedTo = req.user.agency;
    }

    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit as string) || 10)
      .skip(parseInt(req.query.skip as string) || 0);

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching complaints' });
  }
});

// Get a specific complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check if user has permission to view this complaint
    if (req.user?.role === 'citizen' && complaint.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching complaint' });
  }
});

// Update complaint status (admin/agency only)
router.patch('/:id/status', auth, checkRole(['admin', 'agency']), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    complaint.status = req.body.status;
    if (req.body.assignedTo) {
      complaint.assignedTo = req.body.assignedTo;
    }
    
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(400).json({ error: 'Error updating complaint' });
  }
});

// Add comment to complaint
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check if user has permission to comment
    if (req.user?.role === 'citizen' && complaint.citizenId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add comment logic here (you'll need to add a comments field to the Complaint model)
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error adding comment' });
  }
});

export default router; 