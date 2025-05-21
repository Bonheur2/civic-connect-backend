import express, { Request, Response } from 'express';
import { citizenJWT } from '../middleware/authentication';

const router = express.Router();

/**
 * @swagger
 * /api/help/faq:
 *   get:
 *     tags: [Help]
 *     summary: Get frequently asked questions
 *     responses:
 *       200:
 *         description: List of FAQs
 */
router.get('/faq', async (req: Request, res: Response) => {
  const faqs = [
    {
      question: 'How do I submit a complaint?',
      answer: 'You can submit a complaint by logging into your account and clicking on the "Submit Complaint" button in the dashboard. Fill out the required information and submit the form.'
    },
    {
      question: 'How can I track my complaint status?',
      answer: 'You can track your complaint status by visiting the "Complaint Tracker" section in your dashboard. Enter your complaint ID to see the current status and updates.'
    },
    {
      question: 'What information do I need to provide when submitting a complaint?',
      answer: 'When submitting a complaint, you need to provide: the complaint title, description, category, location, and any relevant images or documents.'
    },
    {
      question: 'How long does it take to process a complaint?',
      answer: 'The processing time varies depending on the type and complexity of the complaint. You will receive updates on your complaint status through the platform.'
    }
  ];
  res.json(faqs);
});

/**
 * @swagger
 * /api/help/contact:
 *   post:
 *     tags: [Help]
 *     summary: Submit a support request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Support request submitted successfully
 */
router.post('/contact', citizenJWT, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { subject, message, priority } = req.body;
    // Here you would typically save the support request to a database
    // and/or send an email to support staff
    res.json({ 
      message: 'Support request submitted successfully',
      ticketId: Math.random().toString(36).substr(2, 9)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting support request' });
  }
});

/**
 * @swagger
 * /api/help/guides:
 *   get:
 *     tags: [Help]
 *     summary: Get user guides and tutorials
 *     responses:
 *       200:
 *         description: List of guides and tutorials
 */
router.get('/guides', async (req: Request, res: Response) => {
  const guides = [
    {
      title: 'Getting Started',
      content: 'Learn how to create an account and navigate the platform.',
      videoUrl: 'https://example.com/videos/getting-started'
    },
    {
      title: 'Submitting Complaints',
      content: 'Step-by-step guide on how to submit and track complaints.',
      videoUrl: 'https://example.com/videos/submitting-complaints'
    },
    {
      title: 'Managing Your Profile',
      content: 'Learn how to update your profile and manage your settings.',
      videoUrl: 'https://example.com/videos/managing-profile'
    }
  ];
  res.json(guides);
});

export default router; 