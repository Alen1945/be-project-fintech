const bcrypt = require('bcryptjs')
const Users = require('../models').users
const Profile = require('../models').user_profiles
exports.RegisterUsers = async (req, res, next) => {
  try {
    const { username, password, email } = req.body
    if (!username || !password || !email) {
      throw new Error('username, password, and email is required')
    }
    const user = await Users.findOne({ where: { username } })
    if (user) {
      throw new Error('Username Already Exists')
    }
    const hashPassword = bcrypt.hashSync(password)
    const resultUsers = Users.build({ username, password: hashPassword })
    const resultProfile = Profile.build({ email })
    await resultUsers.save()
    await resultProfile.setUser(resultUsers)
    await resultProfile.save()
    if (resultProfile) {
      res.status(201).send({
        status: true,
        msg: 'created success',
        data: {
          id: resultUsers.get('id'),
          username: resultUsers.get('username')
        }
      })
    }
  } catch (err) {
    console.log(err)
    res.status(202).send({
      success: false,
      msg: err.message
    })
  }
}