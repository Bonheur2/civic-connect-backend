"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Complaint_1 = require("../models/Complaint");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Submit a new complaint
router.post('/', auth_1.auth, async (req, res) => {
    var _a;
    try {
        const complaint = new Complaint_1.Complaint({
            ...req.body,
            citizenId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id
        });
        await complaint.save();
        res.status(201).json(complaint);
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating complaint' });
    }
});
// Get all complaints (with filtering)
router.get('/', auth_1.auth, async (req, res) => {
    var _a, _b;
    try {
        const filter = {};
        // Apply filters based on query parameters
        if (req.query.status)
            filter.status = req.query.status;
        if (req.query.category)
            filter.category = req.query.category;
        if (req.query.priority)
            filter.priority = req.query.priority;
        // If user is citizen, only show their complaints
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'citizen') {
            filter.citizenId = req.user._id;
        }
        // If user is agency, only show complaints assigned to them
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'agency') {
            filter.assignedTo = req.user.agency;
        }
        const complaints = await Complaint_1.Complaint.find(filter)
            .sort({ createdAt: -1 })
            .limit(parseInt(req.query.limit) || 10)
            .skip(parseInt(req.query.skip) || 0);
        res.json(complaints);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching complaints' });
    }
});
// Get a specific complaint
router.get('/:id', auth_1.auth, async (req, res) => {
    var _a;
    try {
        const complaint = await Complaint_1.Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        // Check if user has permission to view this complaint
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'citizen' && complaint.citizenId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(complaint);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching complaint' });
    }
});
// Update complaint status (admin/agency only)
router.patch('/:id/status', auth_1.auth, (0, auth_1.checkRole)(['admin', 'agency']), async (req, res) => {
    try {
        const complaint = await Complaint_1.Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        complaint.status = req.body.status;
        if (req.body.assignedTo) {
            complaint.assignedTo = req.body.assignedTo;
        }
        await complaint.save();
        res.json(complaint);
    }
    catch (error) {
        res.status(400).json({ error: 'Error updating complaint' });
    }
});
// Add comment to complaint
router.post('/:id/comments', auth_1.auth, async (req, res) => {
    var _a;
    try {
        const complaint = await Complaint_1.Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ error: 'Complaint not found' });
        }
        // Check if user has permission to comment
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'citizen' && complaint.citizenId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Add comment logic here (you'll need to add a comments field to the Complaint model)
        res.status(201).json({ message: 'Comment added successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Error adding comment' });
    }
});
exports.default = router;
