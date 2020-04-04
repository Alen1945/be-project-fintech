const UserRouter = require('express').Router()
const autMiddleware = require("../middleware/authMiddleware");
const { GetProfile } = require('../controllers/users')

UserRouter.get('/:id', autMiddleware, GetProfile)

module.exports = UserRouter