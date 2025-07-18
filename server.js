require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 8080
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')
const cors = require('cors')

const userRoutes = require('./routes/userRoutes')
const protectedRoutes = require('./routes/protectedRoutes')
const companyRoutes = require('./routes/companyRoutes')
const jobRoutes = require('./routes/jobRoutes')
const applicationRoutes = require('./routes/applicationRoutes')

// enable CORS
app.use(cors())

// middleware to parse incoming json
app.use(express.json())


// serve swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


// mount user routes
app.use('/api/users', userRoutes)

// mount protected routes
app.use('/api', protectedRoutes)

// mount company routes
app.use('/api/companies', companyRoutes)

// mount job routes
app.use('/api/jobs', jobRoutes)

// mount application routes
app.use('/api/applications', applicationRoutes)

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`))

