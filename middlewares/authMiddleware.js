const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


const requireAuth = async (req, res, next) => {
  // get the token from the authorization header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized, token missing' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // get the user from the database (to attach more deets)
    const user = await prisma.user.findUnique({
      where : { id : decoded.userId },
      select : {
        id : true,
        email : true,
        name : true,
        role : true,
        companyId : true // include companyId if needed
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Not authorized, user not found' })
    }

    // attach user to the request object
    req.user = user
  
    next()
  } catch (err) {
    console.error('Authentication Error:', err)
    return res.status(401).json({ error: 'Not authorized, token invalid' })
  }
}


module.exports = requireAuth

