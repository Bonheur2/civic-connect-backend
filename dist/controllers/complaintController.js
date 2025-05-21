"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComment = exports.updateComplaintStatus = exports.getComplaintById = exports.getComplaints = exports.createComplaint = void 0;
const Complaint_1 = require("../models/Complaint");
const sendNotification_1 = require("../middleware/sendNotification");
const createComplaint = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const complaint = new Complaint_1.Complaint({
            ...req.body,
            citizenId: req.user._id
        });
        await complaint.save();
        await (0, sendNotification_1.sendNotification)({
            user: req.user._id,
            message: 'Your complaint has been submitted.',
            type: 'complaint'
        });
        // Optional: Notify agency or user
        res.status(201).json({
            success: true,
            message: 'Complaint created successfully',
            data: complaint
        });
    }
    catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating complaint',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createComplaint = createComplaint;
const getComplaints = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const filter = {};
        // Apply filters based on query parameters
        if (req.query.status)
            filter.status = req.query.status;
        if (req.query.category)
            filter.category = req.query.category;
        if (req.query.priority)
            filter.priority = req.query.priority;
        // If user is citizen, only show their complaints
        if (req.user.role === 'citizen') {
            filter.citizenId = req.user._id;
        }
        // If user is agency, only show complaints assigned to them
        if (req.user.role === 'agency') {
            filter.assignedTo = req.user.agency;
        }
        const complaints = await Complaint_1.Complaint.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(req.query.limit) || 10)
            .skip(parseInt(req.query.skip) || 0);
        res.json({
            success: true,
            data: complaints
        });
    }
    catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching complaints',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getComplaints = getComplaints;
const getComplaintById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const complaint = await Complaint_1.Complaint.findById(req.params.id)
            .populate('citizenId')
            .populate('assignedTo');
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }
        // Check if user has permission to view this complaint
        if (req.user.role === 'citizen' && complaint.citizenId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        res.json({
            success: true,
            data: complaint
        });
    }
    catch (error) {
        console.error('Get complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching complaint',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getComplaintById = getComplaintById;
const updateComplaintStatus = async (req, res) => {
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
        const complaint = await Complaint_1.Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }
        complaint.status = req.body.status;
        if (req.body.assignedTo) {
            complaint.assignedTo = req.body.assignedTo;
        }
        await complaint.save();
        // Prepare notifications
        const notifications = [];
        // Notify the user
        if (complaint.citizenId && 'email' in complaint.citizenId) {
            try {
                await (0, sendNotification_1.sendNotification)({
                    user: complaint.citizenId._id,
                    message: `Your complaint status has been updated to "${req.body.status}".`,
                    type: 'complaint',
                });
                console.log(`✅ Notification sent to user ${complaint.citizenId.email || complaint.citizenId._id}`);
            }
            catch (error) {
                console.error('Failed to send notification to user:', error instanceof Error ? error.message : 'Unknown error');
            }
        }
        else {
            console.warn(`[WARN] Complaint ${complaint._id} is missing a valid user reference.`);
        }
        // Notify the agency (if assigned)
        if (complaint.assignedTo && 'name' in complaint.assignedTo) {
            try {
                await (0, sendNotification_1.sendNotification)({
                    user: complaint.assignedTo._id,
                    message: `A complaint assigned to your agency is now "${req.body.status}".`,
                    type: 'complaint',
                });
                console.log(`✅ Notification sent to agency ${complaint.assignedTo.name || complaint.assignedTo._id}`);
            }
            catch (error) {
                console.error('Failed to send notification to agency:', error instanceof Error ? error.message : 'Unknown error');
            }
        }
        else {
            console.warn(`[WARN] Complaint ${complaint._id} is not yet assigned to an agency.`);
        }
        // Attempt to send all notifications
        try {
            await Promise.all(notifications);
        }
        catch (error) {
            console.error('Failed to send notifications:', error instanceof Error ? error.message : 'Unknown error');
        }
        res.json({
            success: true,
            message: 'Complaint status updated successfully',
            data: complaint
        });
    }
    catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating complaint',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
const addComment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const complaint = await Complaint_1.Complaint.findById(req.params.id);
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
    }
    catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.addComment = addComment;
exports.default = {
    createComplaint: exports.createComplaint,
    getComplaints: exports.getComplaints,
    getComplaintById: exports.getComplaintById,
    updateComplaintStatus: exports.updateComplaintStatus,
    addComment: exports.addComment
};
