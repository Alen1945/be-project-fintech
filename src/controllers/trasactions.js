require('dotenv').config()
const models = require("../models");
const {
  users: Users,
  user_balances: Balance,
  topup_historys: TopupHistory,
  transaction_historys: TransactionHistory,
} = require("../models");

exports.CreateTransfer = async (req, res, next) => {
  try {
    if (!req.body.id_receiver || !req.body.amount) {
      throw new Error("Required id_receiver and amount");
    }
    if (req.body.amount <= 0) {
      throw new Error("Amount Must Positif Integer");
    }
    const dataSender = await Users.findOne({
      where: { id: req.auth.id },
      include: [{ model: Balance, attributes: ["balance"] }],
    });
    if (
      parseFloat(dataSender.user_balance.balance) < parseFloat(req.body.amount)
    ) {
      throw new Error("Not Enough Balance");
    }
    const dataReceiver = await Users.findOne({
      where: { id: req.body.id_receiver },
      include: [{ model: Balance, attributes: ["balance"] }],
    });
    if (!dataReceiver) {
      throw new Error("Account Receiver Has Not Exist Anymore");
    }
    const resultQueryUpdate = await models.sequelize.query(
      `
      UPDATE user_balances SET balance = 
      CASE id_user
        WHEN ${dataSender.id} THEN ${
      parseFloat(dataSender.user_balance.balance) -
      parseFloat(req.body.amount)
      }
        WHEN ${dataReceiver.id} THEN ${
      parseFloat(dataReceiver.user_balance.balance) +
      parseFloat(req.body.amount)
      } 
      END
      WHERE id_user in (${dataSender.id}, ${dataReceiver.id})
    `,
      { type: models.Sequelize.QueryTypes.UPDATE }
    );
    if (resultQueryUpdate[1] === 2) {
      await dataSender.createTransaction_history({
        id_type_trasaction: 1,
        id_receiver: req.body.id_receiver,
        amount: parseFloat(req.body.amount),
        message: req.body.message || "",
      });
      res.send({
        success: true,
        msg: `Success Transfer to ${dataReceiver.username}`,
      });
    } else {
      throw new Error("Failed to Transfer!");
    }
  } catch (e) {
    console.log(e);
    res.status(202).send({
      success: false,
      msg: e.message,
    });
  }
};

exports.GetAllHistoryTopup = async (req, res, next) => {
  try {
    const params = {
      currentPage: parseInt(req.query.page) || 1,
      perPage: parseInt(req.query.limit) || 10,
    }
    const dataHistory = await TopupHistory.findAndCountAll({
      limit: params.perPage,
      offset: (parseInt(params.perPage) * (parseInt(params.currentPage) - 1)),
    })
    console.log(req)
    const totalPages = Math.ceil(dataHistory.count / parseInt(params.perPage))
    const query = req.query
    query.page = parseInt(params.currentPage) + 1
    const nextPage = (parseInt(params.currentPage) < totalPages ? process.env.APP_URL.concat(`${req.route.path}?page=${query.page}&limit=${params.perPage}`) : null)
    query.page = parseInt(params.currentPage) - 1
    const previousPage = (parseInt(params.currentPage) > 1 ? process.env.APP_URL.concat(`${req.route.path}?page=${query.page}&limit=${params.perPage}`) : null)

    const pagination = {
      currentPage: params.currentPage,
      nextPage,
      previousPage,
      totalPages,
      perPage: params.perPage,
      totalEntries: dataHistory.count
    }
    if (dataHistory.rows.length > 0) {
      res.status(200).send({
        success: true,
        data: dataHistory.rows,
        pagination
      })
    } else {
      res.status(200).send({
        success: true,
        data: false,
        msg: 'Data is Empty'
      })
    }
  } catch (err) {
    console.log(err)
    res.status(202).send({
      success: false,
      msg: e.message
    })
  }
}
