/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Endpoints related to job applications
 */

const express = require('express')
const router = express.Router()
const requireAuth = require('../middlewares/authMiddleware')
const {
  applyToJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus
} = require('../controllers/applicationController')

/**
 * @swagger
 * /api/applications/jobs/{id}/apply:
 *   post:
 *     summary: Apply to a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the job to apply to
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resumeUrl
 *               - coverLetter
 *             properties:
 *               resumeUrl:
 *                 type: string
 *                 example: https://example.com/resume.pdf
 *               coverLetter:
 *                 type: string
 *                 example: I’m excited to apply for this role...
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       403:
 *         description: Forbidden – Only applicants can apply
 *       404:
 *         description: Job not found or not accepting applications
 *       409:
 *         description: You have already applied to this job
 */
router.post('/jobs/:id/apply', requireAuth, applyToJob)

/**
 * @swagger
 * /api/applications/my-applications:
 *   get:
 *     summary: Get current user's job applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications submitted by the user
 *       403:
 *         description: Forbidden – Only applicants can view their applications
 */
router.get('/my-applications', requireAuth, getMyApplications)

/**
 * @swagger
 * /api/applications/job/{id}/applicants:
 *   get:
 *     summary: Get all applicants for a specific job (employer only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the job
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of applicants
 *       403:
 *         description: Forbidden – Only employers can view applicants
 *       404:
 *         description: Job not found or not owned by user
 */
router.get('/job/:id/applicants', requireAuth, getApplicantsForJob)

/**
 * @swagger
 * /api/applications/{id}/status:
 *   patch:
 *     summary: Update application status (employer only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the application
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
 *                 enum: [PENDING, ACCEPTED, REJECTED]
 *                 example: ACCEPTED
 *     responses:
 *       200:
 *         description: Application status updated
 *       400:
 *         description: Invalid status format
 *       403:
 *         description: Forbidden – Only employers can update status
 *       404:
 *         description: Application not found
 */
router.patch('/:id/status', requireAuth, updateApplicationStatus)

module.exports = router
