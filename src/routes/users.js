const UserRouter = require('express').Router()
const autMiddleware = require("../middleware/authMiddleware");
const { GetProfile, GetAllUsers } = require('../controllers/users')

UserRouter.get('/:id', autMiddleware, GetProfile)
UserRouter.get('/', autMiddleware, GetAllUsers)

module.exports = UserRouter