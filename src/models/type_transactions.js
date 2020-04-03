'use strict';
module.exports = (sequelize, DataTypes) => {
  const type_transactions = sequelize.define('type_transactions', {
    name: DataTypes.STRING,
    isDelete: DataTypes.TINYINT
  }, {});
  type_transactions.associate = function (models) {
    type_transactions.hasMany(models.transaction_historys, { foreignKey: 'id_type_transaction' })
  };
  return type_transactions;
};