const { PrismaClient, Role } = require('@prisma/client')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

// user controller
const registerUser = async (req, res) => {
  // extract name, email, password, role
  const { name, email, password, role } = req.body

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error : "All fields are required" })
  }

  try {
    // validate role
    const upperCaseRole = role.toUpperCase()
    if (!Object.values(Role).includes(upperCaseRole)) {
      return res.status(400).json({ error : `Invalid role: "${role}". Valid roles are: ${Object.values(Role).join(', ')}` })
    }


    // check if a user already exists with the same email
    const existingUser = await prisma.user.findUnique({
      where : { email }
    })

    if (existingUser) {
      return res.status(409).json({ error : `User with this email: "${existingUser.email}" already exists` })
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // create a user in the db
    const user = await prisma.user.create({
      data : {
        name,
        email,
        passwordHash : hashedPassword,
        role : upperCaseRole
      }
    })

    return res.status(201).json({
      message : 'User registered successfully',
      user : {
        id : user.id,
        name : user.name,
        email : user.email,
        role : user.role
      }
    })
  } catch (err) {
    console.error('Registration Error:', err)
    return res.status(500).json({ error: 'Something went wrong while registering user' })
  }
}


// login controller
const loginUser = async (req, res) => {
  // extract email and password
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error : "Email and password are required" })
  }

  try {
    // look for user with the given email
    const user = await prisma.user.findUnique({
      where : { email}
    })

    if (!user) {
      return res.status(404).json({ error : 'Invalid credentials' })
    }

    // compare password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error : 'Invalid credentials' })
    }


    // if email + password matcg, generate jwt
    const token = jwt.sign(
      {
        userId : user.id,
        role : user.role
      },
      process.env.JWT_SECRET,
      { expiresIn : '1d' }
    )

    return res.status(200).json({
      message : 'Login successful',
      token,
      user : {
        id : user.id,
        name : user.name,
        email : user.email,
        role : user.role
      }
    })
  } catch (err) {
    console.error('Login Error:', err)
    return res.status(500).json({ error: 'Something went wrong while logging in' })
  }
}


module.exports = {
  registerUser,
  loginUser
}

