const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const { users: Users, user_profiles: Profile, role_users: Role } = require('../models')
const verifyCode = require('../utility/generateCodeVerify')
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

exports.Verify = async (req, res, next) => {
  try {
    if (!req.query.code) {
      throw new Error('Required Code Verification')
    }
    const verify = await Profile.findOne({ where: { code_verify: req.query.code } })
    console.log(verify)
    if (!verify) {
      throw new Error('Failed to Verify Your Account')
    }
    await Profile.update({ code_verify: null }, { where: { code_verify: req.query.code } })
    await Users.update({ status: 1 }, { where: { id: verify.id_user } })
    res.status(200).send({
      success: true,
      msg: 'Your Account Is Verify Please Login'
    })
  } catch (e) {
    console.log(e)
    res.status(202).send({
      success: false,
      msg: e.message
    })
  }
}



exports.LoginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username && !password) {
      throw new Error('Username and Password is Required')
    }
    const dataUser = await Users.findOne({
      where: { username }, include: [
        { model: Role, attributes: ['name'] },
        { model: Profile, attributes: ['fullname', 'email', 'gender', 'picture', 'address'] }]
    })
    if (!dataUser || !bcrypt.compareSync(password, dataUser.password)) {
      throw new Error('Username Or Passowrd Wrong')
    }
    if (!dataUser.status) {
      throw new Error('Please Verify Your Account')
    }
    const token = jwt.sign({ id: dataUser.id, username: dataUser.username, role: dataUser.role_user.name }, process.env.APP_KEY, { expiresIn: '1D' })
    res.send({
      success: true,
      msg: 'Login Success',
      data: {
        token,
        dataProfile: {
          id: dataUser.id,
          username,
          ...dataUser.user_profile.dataValues
        }
      }
    })
  } catch (e) {
    console.log(e)
    res.status(401).send({
      success: false,
      msg: e.message
    })
  }
}