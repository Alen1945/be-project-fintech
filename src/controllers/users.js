const bcrypt = require('bcryptjs')
const validator = require('validator')
const Users = require('../models').users
const verifyCode = require('../utility/generateCodeVerify')
const Profile = require('../models').user_profiles
const sendEmail = require('../utility/sendEmail')
exports.RegisterUsers = async (req, res, next) => {
  try {
    const { username, password, email } = req.body
    if (!username || !password || !email) {
      throw new Error('username, password, and email is required')
    }
    if (!validator.isEmail(email)) {
      throw new Error('Please Enter Valid Email')
    }
    const user = await Users.findOne({ where: { username } })
    if (user) {
      throw new Error('Username Already Exists')
    }
    const hashPassword = bcrypt.hashSync(password)
    const resultUsers = Users.build({ username, password: hashPassword })
    const resultProfile = Profile.build({ email, code_verify: await verifyCode() })
    await resultUsers.save()
    await resultProfile.setUser(resultUsers)
    await resultProfile.save()
    if (resultProfile) {
      await sendEmail(email, resultProfile.get('code_verify'))
      res.status(201).send({
        status: true,
        msg: `Register Success, Please Check ${resultProfile.get('email')} to Verify Account`,
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