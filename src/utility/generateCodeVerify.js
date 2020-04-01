const Profile = require('../models').user_profiles
function generateCode() {
  const char = "123456789";
  let code = '';
  for (let i = 0; i < 6; i++) {
    let hasil = Math.floor(Math.random() * char.length);
    code += char.substring(hasil, hasil + 1);
  }
  return code
}
async function getVerifyCode() {
  let code
  statusCode = false
  while (!false) {
    code = generateCode()
    console.log(code)
    const dataCode = await Profile.findOne({ where: { code_verify: code } })
    if (!dataCode) {
      return code.toString()
    }
  }

}
module.exports = getVerifyCode