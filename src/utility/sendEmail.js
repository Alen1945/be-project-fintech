const nodeMailer = require('nodemailer')
require('dotenv').config()
const transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.PASS_EMAIL
  }
})

const mailOptions = (to, codeVerify) => ({
  from: process.env.USER_EMAIL,
  to: to,
  subject: 'Verify Your Account',
  html: `
   <h2>Hai</h2>
   <h3>This is Code to Verify Your Account</h3>
   <strong>${codeVerify}</strong>
  `
})

const SendingEmail = (to, codeVerify) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions(to, codeVerify), (err, info) => {
      if (err) {
        reject(err)
      } else {
        resolve(true)
      }
    })
  })
}

module.exports = SendingEmail
