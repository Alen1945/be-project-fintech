require('dotenv').config()
const App = require('./App')
const http = require('http')

const server = http.createServer(App)

const port = (process.env.PORT || 3001)
server.listen(port)

server.on('listening', () => {
  console.log('Server Running on Port ' + port)
})

server.on('error', (err) => {
  console.log('Get Error')
  console.log(err)
  throw err
})



