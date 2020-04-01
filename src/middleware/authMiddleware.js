const jwt = require('jsonwebtoken')
const User = require('../models').users
require('dotenv').config()

async function checkAuthToken(req, res, next) {
  try {
    let token = req.headers.authorization || ''
    if (!token) {
      throw new Error('Not Authorized')
    }
    token = token.replace(/Bearer\s*/, '')
    req.auth = jwt.verify(token, process.env.APP_KEY)
    const user = await User.findOne({ where: { id: req.auth.id } })
    if (user) {
      return next()
    }
    throw new Error('Your Account Has Been Deleted')
  } catch (e) {
    res.status(401).send({
      success: false,
      msg: e.message
    })
  }
}

module.exports = checkAuthToken
