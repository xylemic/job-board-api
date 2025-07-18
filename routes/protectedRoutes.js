/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Access a protected route (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Protected route accessed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello Jane Doe, you have access to this protected route!
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized – missing or invalid token
 */

const express = require('express')
const router = express.Router()
const requireAuth = require('../middlewares/authMiddleware')

router.get('/protected', requireAuth, (req, res) => {
  res.json({
    message: `Hello ${req.user.name}, you have access to this protected route!`,
    user: req.user
  })
})

module.exports = router
