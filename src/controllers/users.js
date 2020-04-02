const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const {
  users: Users,
  user_profiles: Profile,
  role_users: Role,
  user_balances: Balance
} = require("../models");
const verifyCode = require("../utility/generateCodeVerify");
const sendEmail = require("../utility/sendEmail");
const uploads = require("../middleware/uploadFiles");
exports.RegisterUsers = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password || !email) {
      throw new Error("username, password, and email is required");
    }
    if (!validator.isEmail(email)) {
      throw new Error("Please Enter Valid Email");
    }
    const user = await Users.findOne({ where: { username } });
    if (user) {
      throw new Error("Username Already Exists");
    }
    const hashPassword = bcrypt.hashSync(password);
    const resultUsers = Users.build({ username, password: hashPassword });
    const resultProfile = Profile.build({
      email,
      code_verify: await verifyCode()
    });
    const resultBalance = Balance.build();
    await resultUsers.save();
    await resultProfile.setUser(resultUsers);
    await resultBalance.setUser(resultUsers);
    await resultProfile.save();
    await resultBalance.save();

    if (resultProfile) {
      await sendEmail(email, resultProfile.get("code_verify"));
      res.status(201).send({
        success: true,
        msg: `Register Success, Please Check ${resultProfile.get(
          "email"
        )} to Verify Account`,
        data: {
          id: resultUsers.get("id"),
          username: resultUsers.get("username")
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(202).send({
      success: false,
      msg: err.message
    });
  }
};

exports.Verify = async (req, res, next) => {
  try {
    if (!req.query.code) {
      throw new Error("Required Code Verification");
    }
    const verify = await Profile.findOne({
      where: { code_verify: req.query.code }
    });
    console.log(verify);
    if (!verify) {
      throw new Error("Failed to Verify Your Account");
    }
    await Profile.update(
      { code_verify: null },
      { where: { code_verify: req.query.code } }
    );
    await Users.update({ status: 1 }, { where: { id: verify.id_user } });
    res.status(200).send({
      success: true,
      msg: "Your Account Is Verify Please Login"
    });
  } catch (e) {
    console.log(e);
    res.status(202).send({
      success: false,
      msg: e.message
    });
  }
};

exports.LoginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username && !password) {
      throw new Error("Username and Password is Required");
    }
    const dataUser = await Users.findOne({
      where: { username },
      include: [
        { model: Role, attributes: ["name"] },
        { model: Balance, attributes: ["balance"] },
        {
          model: Profile,
          attributes: ["fullname", "email", "gender", "picture", "address"]
        }
      ]
    });
    if (!dataUser || !bcrypt.compareSync(password, dataUser.password)) {
      throw new Error("Username Or Passowrd Wrong");
    }
    if (!dataUser.status) {
      throw new Error("Please Verify Your Account");
    }
    const token = jwt.sign(
      {
        id: dataUser.id,
        username: dataUser.username,
        role: dataUser.role_user.name
      },
      process.env.APP_KEY,
      { expiresIn: "1D" }
    );
    res.send({
      success: true,
      msg: "Login Success",
      data: {
        token,
        dataProfile: {
          id: dataUser.id,
          username,
          role: dataUser.role_user.name,
          balance: dataUser.user_balance.balance,
          ...dataUser.user_profile.dataValues
        }
      }
    });
  } catch (e) {
    console.log(e);
    res.status(401).send({
      success: false,
      msg: e.message
    });
  }
};

exports.ForgotPassword = async (req, res, next) => {
  try {
    if (!req.query.code) {
      if (!req.body.username) {
        throw new Error("Please Defined Username to Create New Password");
      }
      const dataUser = await Users.findOne({
        where: { username: req.body.username }
      });
      if (!dataUser) {
        throw new Error("Username Not Exists");
      }
      const updateCodeVerify = await Profile.update(
        { code_verify: await verifyCode() },
        {
          where: {
            id_user: dataUser.get("id")
          }
        }
      );
      if (!updateCodeVerify[0]) {
        throw new Error("Failed to Verify Your Account");
      }
      const dataProfile = await Profile.findOne({
        where: {
          id_user: dataUser.get("id")
        }
      });
      await sendEmail(dataProfile.get("email"), dataProfile.get("code_verify"));
      res.status(200).send({
        success: true,
        msg: `Request Success, Please Check Your email ${dataProfile.get(
          "email"
        )}, To get Code Verify `
      });
    } else {
      if (!req.body.new_password || !req.body.confirm_password) {
        throw new Error(
          "Please Defined new_password and confirm_password to update password"
        );
      }
      if (req.body.new_password !== req.body.confirm_password) {
        throw new Error("Confirm Password not Match");
      }
      const dataUser = await Profile.findOne({
        where: { code_verify: req.query.code },
        attributes: ["id_user"]
      });
      if (!dataUser) {
        throw new Error("Wrong Code Verification");
      }
      const idUser = dataUser.get("id_user");
      const updatePassword = await Users.update(
        { password: bcrypt.hashSync(req.body.new_password) },
        {
          where: {
            id: parseInt(idUser)
          }
        }
      );
      const setCodeToNull = await Profile.update(
        { code_verify: null },
        {
          where: {
            id_user: parseInt(idUser)
          }
        }
      );
      if (!updatePassword[0] || !setCodeToNull[0]) {
        throw new Error("Failed To Change Password");
      }
      return res.status(200).send({
        success: true,
        msg: "Success Change Password, Please Login"
      });
    }
  } catch (e) {
    console.log(e);
    res.status(202).send({
      success: false,
      msg: e.message
    });
  }
};

exports.GetProfile = async (req, res, next) => {
  try {
    const dataUser = await Users.findOne({
      where: { id: req.auth.id },
      include: [
        { model: Role, attributes: ["name"] },
        { model: Balance, attributes: ["balance"] },
        {
          model: Profile,
          attributes: ["fullname", "email", "gender", "picture", "address"]
        }
      ]
    });
    if (!dataUser) {
      throw new Error("Your Account Has Not Exist Anymore");
    }
    return res.status(200).send({
      success: true,
      data: {
        id: dataUser.id,
        username: dataUser.username,
        balance: dataUser.user_balance.balance,
        role: dataUser.role_user.name,
        ...dataUser.user_profile.dataValues
      }
    });
  } catch (e) {
    res.status(202).send({
      success: false,
      msg: e.message
    });
  }
};

exports.UpdateUser = async (req, res, next) => {
  try {
    await uploads(req, res, "picture");
    const { id } = req.auth;
    const fillable = ["fullname", "email", "gender", "address", "picture"];
    const params = Object.keys(req.body).reduce((dataUpdate, key) => {
      console.log(dataUpdate);
      if (key && fillable.includes(key) && req.body[key]) {
        return { ...dataUpdate, [key]: req.body[key] };
      } else {
        return dataUpdate;
      }
    }, {});

    if (req.file) {
      params["picture"] = "uploads/" + req.file.filename;
    }

    if (req.body.old_password) {
      const user = await Users.findOne({ where: { id } });
      const oldPassword = user.password;
      if (!(req.body.new_password && req.body.confirm_password)) {
        throw new Error("New Password or Confirm Password Not Defined");
      }
      if (!(req.body.new_password === req.body.confirm_password)) {
        throw new Error("Confirm Password Not Match");
      }
      if (!bcrypt.compareSync(req.body.old_password, oldPassword)) {
        throw new Error("Old Password Not Match");
      }
      console.log("alen");
      params["password"] = bcrypt.hashSync(req.body.new_password);
    }
    if (!params || !(Object.keys(params).length > 0)) {
      throw new Error("Something Wrong with your sented data");
    }
    const updateProfile = await Profile.update(params, {
      where: { id_user: id }
    });
    let updatePassword;
    if (params.password) {
      updatePassword = await Users.update(
        { password: params.password },
        { where: { id } }
      );
    }
    if (updateProfile[0] || (updatePassword && updatePassword[0])) {
      res.send({
        success: true,
        msg: `User ${req.auth.username} has been updated`
      });
    } else {
      throw new Error("Failed to update user!");
    }
  } catch (e) {
    console.log(e);
    res.status(202).send({
      success: false,
      msg: e.message
    });
  }
};
exports.TopUp = async (req, res, next) => {
  try {
    if (!req.body.nominal_topup) {
      throw new Error("Please Entry nominal_topup");
    }
    if (req.body.nominal_topup <= 0) {
      throw new Error("Nominal Top Up Must Positif Integer");
    }
    const dataUser = await Users.findOne({
      where: { id: req.auth.id },
      include: [{ model: Balance, attributes: ["balance"] }]
    });
    if (!dataUser) {
      throw new Error("Your Account Has Not Exist Anymore");
    }
    const updateBalance = await Balance.update(
      {
        balance:
          parseFloat(dataUser.user_balance.balance) +
          parseFloat(req.body.nominal_topup)
      },
      { where: { id_user: req.auth.id } }
    );
    if (updateBalance[0]) {
      res.send({
        success: true,
        msg: `Success TopUp for ${req.auth.username}`
      });
    } else {
      throw new Error("Failed to TopUp!");
    }
  } catch (e) {
    console.log(e);
    res.status(202).send({
      success: false,
      msg: e.message
    });
  }
};
