require('dotenv').config()
const models = require("../models");
const {
  users: Users,
  user_profiles: Profile,
  user_balances: Balance,
  topup_historys: TopupHistory,
  type_transactions: TypeTransactions,
  transaction_historys: TransactionHistory,
} = require("../models");
const getPagination = require('../utility/getPagination')
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
        id_type_transaction: 1,
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
      where: { id_user: req.auth.id },
      limit: params.perPage,
      offset: (parseInt(params.perPage) * (parseInt(params.currentPage) - 1)),
      order: [
        ['createdAt', 'DESC']
      ]
    })
    if (dataHistory.rows.length > 0) {
      res.status(200).send({
        success: true,
        data: dataHistory.rows,
        pagination: getPagination(req, params, dataHistory.count)
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

exports.GetAllHistoryTransaction = async (req, res, next) => {
  try {
    const params = {
      currentPage: parseInt(req.query.page) || 1,
      perPage: parseInt(req.query.limit) || 10,
    }
    const dataHistory = await TransactionHistory.findAndCountAll({
      where: {
        [models.Sequelize.Op.or]: [
          { id_sender: req.auth.id },
          { id_receiver: req.auth.id }
        ]
      },
      limit: params.perPage,
      offset: (parseInt(params.perPage) * (parseInt(params.currentPage) - 1)),
      order: [
        ['createdAt', 'DESC']
      ],
      include: [{ model: TypeTransactions, attributes: ['name'] }, { model: Users, attributes: ['username'], include: [{ model: Profile, attributes: ['picture'] }] }],
    })
    if (dataHistory.rows.length > 0) {
      res.status(200).send({
        success: true,
        data: dataHistory.rows.map(data => {
          if (data.type_transaction.name = 'transfer') {
            if (data.id_sender === req.auth.id) {
              return {
                id: data.id,
                id_type_transaction: data.id_type_transaction,
                id_sender: data.id_sender,
                id_receiver: data.id_receiver,
                amount: data.amount,
                message: data.message,
                receiverName: data.user.username,
                receiverPicture: data.user.user_profile.dataValues.picture,
                type_transaction: 'Outgoing Transfer',
                createdAt: data.createdAt,
              }
            } else {
              return {
                id: data.id,
                id_type_transaction: data.id_type_transaction,
                id_sender: data.id_sender,
                id_receiver: data.id_receiver,
                amount: data.amount,
                message: data.message,
                senderName: data.user.username,
                senderPicture: data.user.user_profile.dataValues.picture,
                type_transaction: 'Incoming Transfer',
                createdAt: data.createdAt,
              }
            }
          } else {
            return {
              id: data.id,
              id_type_transaction: data.id_type_transaction,
              type_transaction: data.type_transaction.name,
              id_sender: data.id_sender,
              amount: data.amount,
              createdAt: data.createdAt,
            }
          }
        }),
        pagination: getPagination(req, params, dataHistory.count)
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