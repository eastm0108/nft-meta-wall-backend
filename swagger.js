const swaggerAutogen = require('swagger-autogen')()

const doc = {
  info: {
    title: 'nft-meta-wall-backend Api',
    description: 'nft-meta-wall-backend 相關 Api',
  },
  host: 'nft-meta-wall-backend.herokuapp.com',
  host: 'localhost:3005',
  schemes: ['http', 'https'],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      in: 'headers',
      name: 'Authorization',
      description: 'JWT Token',
    },
  },
  tags: [
    {
      name: "post",
      description: "貼文相關"
    },
    {
      name: "user",
      description: "使用者相關"
    },
  ],
}

const outputFile = './swagger-output.json'
const endpointsFiles = ['./app.js']

swaggerAutogen(outputFile, endpointsFiles, doc)