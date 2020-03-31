const Doc = require('express').Router()
const swaggerUi = require('swagger-ui-express')
const yamljs = require('yamljs')
const apiDocs = require('./apiDocs')
require('dotenv').config()

const docsPath = './src/docs/documents/'
const docsUrl = '/api-docs/documents/'
const apiDocsSettings = {
  openapi: '3.0.0',
  info: {
    title: 'API - QuickCash',
    version: '1.0.0',
    description: 'API for Development'
  },
  host: process.env.APP_URL,
  basePath: '/',
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
}

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: Object.keys(apiDocs).map(v => ({ name: v, url: docsUrl + v }))
  }
}

Doc.use('/', swaggerUi.serve)
Doc.get('/', swaggerUi.setup(null, swaggerOptions))

Doc.get('/documents/:name', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  res.send({
    ...apiDocsSettings,
    paths: {
      ...apiDocs[req.params.name].reduce((dataObject, v) => ({
        ...dataObject,
        ...yamljs.load(docsPath + v)
      }), {})
    }
  })
})

module.exports = Doc
