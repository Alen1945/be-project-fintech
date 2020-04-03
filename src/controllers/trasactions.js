const models = require('../models')
const {
  users: Users,
  user_balances: Balance,
  transaction_historys: TransactionHistory
} = require('../models');


exports.CreateTransfer = async (req, res, next) => {
  try {
    if (!req.body.id_receiver || !req.body.amount) {
      throw new Error('Required id_receiver and amount');
    }
    if (req.body.amount <= 0) {
      throw new Error('Amount Must Positif Integer');
    }
    const dataSender = await Users.findOne({
      where: { id: req.auth.id },
      include: [{ model: Balance, attributes: ['balance'] }]
    });
    if (parseFloat(dataSender.user_balance.balance) < parseFloat(req.body.amount)) {
      throw new Error('Not Enough Balance')
    }
    const dataReceiver = await Users.findOne({
      where: { id: req.body.id_receiver },
      include: [{ model: Balance, attributes: ['balance'] }]
    })
    if (!dataReceiver) {
      throw new Error('Account Receiver Has Not Exist Anymore');
    }
    const resultQueryUpdate = await models.sequelize.query(`
      UPDATE user_balances SET balance = 
      CASE id_user
        WHEN ${dataSender.id} THEN ${parseFloat(dataSender.user_balance.balance) - parseFloat(req.body.amount)}
        WHEN ${dataReceiver.id} THEN ${parseFloat(dataReceiver.user_balance.balance) + parseFloat(req.body.amount)} 
      END
      WHERE id_user in (${dataSender.id}, ${dataReceiver.id})
    `, { type: models.Sequelize.QueryTypes.UPDATE })
    if (resultQueryUpdate[1] === 2) {
      await dataSender.createTransaction_history({
        id_type_trasaction: 1,
        id_receiver: req.body.id_receiver,
        amount: parseFloat(req.body.amount)
      });
      res.send({
        success: true,
        msg: `Success Transfer to ${dataReceiver.username}`
      });
    } else {
      throw new Error('Failed to Transfer!');
    }
  } catch (e) {
    console.log(e);
    res.status(202).send({
      success: false,
      msg: e.message
    });
  }
};