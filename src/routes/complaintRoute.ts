import express from 'express';
import { citizenJWT, agencyJWT } from '../middleware/authentication';
import { createComplaint, getAllComplaints, getComplaintById, updateComplaintStatus } from '../controllers/complaintController';

const router = express.Router();

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     tags: [Complaints]
 *     summary: Create a new complaint
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               location:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', citizenJWT, createComplaint);

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     tags: [Complaints]
 *     summary: Get all complaints
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complaints
 *       401:
 *         description: Unauthorized
 */
router.get('/', citizenJWT, getAllComplaints);

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     tags: [Complaints]
 *     summary: Get a complaint by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Complaint details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Complaint not found
 */
router.get('/:id', citizenJWT, getComplaintById);

/**
 * @swagger
 * /api/complaints/{id}/status:
 *   put:
 *     tags: [Complaints]
 *     summary: Update complaint status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, resolved, rejected]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Only agency can update status
 *       404:
 *         description: Complaint not found
 */
router.put('/:id/status', agencyJWT, updateComplaintStatus);

export default router; 