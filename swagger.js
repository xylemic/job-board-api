const swaggerJsDoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Board API',
      version: '1.0.0',
      description: 'API for job board platform with roles, companies, jobs, and applications.'
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Local server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js'] // path to myroute files for annotations
}

const swaggerSpec = swaggerJsDoc(options)
module.exports = swaggerSpec
