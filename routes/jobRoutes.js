const express = require('express')
const router = express.Router()

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deactivateJob,
  reactivateJob,
  getPublicJobs
} = require('../controllers/jobController')
const requireAuth = require('../middlewares/authMiddleware')

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job management and public listing
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all public active jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter jobs by category
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *         description: Filter jobs by job type
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *         description: Filter jobs by employment type
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter jobs by tags (partial match)
 *       - in: query
 *         name: jobLocation
 *         schema:
 *           type: string
 *         description: Filter jobs by job location (remote/on-site)
 *       - in: query
 *         name: companyLocation
 *         schema:
 *           type: string
 *         description: Filter jobs by company location
 *     responses:
 *       200:
 *         description: List of public jobs
 */
router.get('/', getPublicJobs)

/**
 * @swagger
 * /api/jobs/create-job:
 *   post:
 *     summary: Create a new job (employer only)
 *     tags: [Jobs]
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
 *               - location
 *               - jobType
 *               - employmentType
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               jobType:
 *                 type: string
 *               employmentType:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: string
 *               minSalary:
 *                 type: integer
 *               maxSalary:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Job posted successfully
 */
router.post('/create-job', requireAuth, createJob)

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/:id', getJobById)

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job (employer only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               jobType:
 *                 type: string
 *               employmentType:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 */
router.put('/:id', requireAuth, updateJob)

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Deactivate a job (employer only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deactivated successfully
 */
router.delete('/:id', requireAuth, deactivateJob)

/**
 * @swagger
 * /api/jobs/reactivate/{id}:
 *   patch:
 *     summary: Reactivate a job (employer only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Job ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job reactivated successfully
 */
router.patch('/reactivate/:id', requireAuth, reactivateJob)

module.exports = router
