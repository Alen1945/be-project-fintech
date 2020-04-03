'use strict';
module.exports = (sequelize, DataTypes) => {
  const transaction_historys = sequelize.define('transaction_historys', {
    id_type_trasaction: DataTypes.INTEGER,
    id_sender: DataTypes.INTEGER,
    id_receiver: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL,
    isDelete: DataTypes.TINYINT
  }, {});
  transaction_historys.associate = function (models) {
    transaction_historys.belongsTo(models.type_transactions, { foreignKey: 'id_type_trasaction', targetKey: 'id' })
    transaction_historys.belongsTo(models.users, { foreignKey: 'id_sender', targetKey: 'id' })
    transaction_historys.belongsTo(models.users, { foreignKey: 'id_receiver', targetKey: 'id' })
  };
  return transaction_historys;
};