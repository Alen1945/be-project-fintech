const App = require('express')()
const morgan = require('morgan')
const createError = require('http-errors')
const bodyParser = require('body-parser')
const cors = require('cors')

// Routes
const { RegisterUsers, Verify, LoginUser } = require('./src/controllers/users')
App.use(morgan('tiny'))
App.use(bodyParser.urlencoded({ extended: false }))
App.use(bodyParser.json())
App.use(cors())

/* Redirect To api Docs */
App.get('/', (req, res, next) => {
  res.redirect('/api-docs')
})
/* API DOCS */
App.use('/api-docs', require('./src/docs/'))

App.post('/register', RegisterUsers)
App.get('/verify', Verify)
App.post('/login', LoginUser)
//Not Found
App.use((req, res, next) => {
  next(createError(404))
})
//Internal Server Error
App.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    error: {
      message: err.message
    }
  })
})
module.exports = App