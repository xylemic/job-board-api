/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Endpoints related to company profiles
 */

const express = require('express')
const router = express.Router()

const requireAuth = require('../middlewares/authMiddleware')
const {
  createCompany,
  getMyCompany,
  updateMyCompany,
  deactivateCompany,
  reactivateCompany
} = require('../controllers/companyController')

/**
 * @swagger
 * /api/companies/create:
 *   post:
 *     summary: Create a new company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - location
 *               - website
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company created successfully
 *       400:
 *         description: Validation error or company already exists
 *       403:
 *         description: Forbidden – Only employers can create company profiles
 */
router.post('/create', requireAuth, createCompany)

/**
 * @swagger
 * /api/companies/me:
 *   get:
 *     summary: Get current employer's company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company profile retrieved
 *       403:
 *         description: Forbidden – Only employers can view company
 *       404:
 *         description: Company not found
 */
router.get('/me', requireAuth, getMyCompany)

/**
 * @swagger
 * /api/companies/me:
 *   put:
 *     summary: Update current employer's company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company updated successfully
 *       403:
 *         description: Forbidden – Only employers can update company
 *       404:
 *         description: Company not found
 */
router.put('/me', requireAuth, updateMyCompany)

/**
 * @swagger
 * /api/companies/deactivate:
 *   delete:
 *     summary: Deactivate current employer's company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company deactivated successfully
 *       403:
 *         description: Forbidden – Only employers can deactivate company
 *       404:
 *         description: Company not found
 */
router.delete('/deactivate', requireAuth, deactivateCompany)

/**
 * @swagger
 * /api/companies/me/reactivate:
 *   patch:
 *     summary: Reactivate current employer's company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company reactivated successfully
 *       403:
 *         description: Forbidden – Only employers can reactivate company
 *       404:
 *         description: Company not found
 */
router.patch('/me/reactivate', requireAuth, reactivateCompany)

module.exports = router
