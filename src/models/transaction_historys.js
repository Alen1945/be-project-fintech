"use strict";
module.exports = (sequelize, DataTypes) => {
  const transaction_historys = sequelize.define(
    "transaction_historys",
    {
      id_type_transaction: DataTypes.INTEGER,
      id_sender: DataTypes.INTEGER,
      id_receiver: DataTypes.INTEGER,
      amount: DataTypes.DECIMAL,
      message: DataTypes.TEXT,
      isDelete: DataTypes.TINYINT,
    },
    {}
  );
  transaction_historys.associate = function (models) {
    transaction_historys.belongsTo(models.type_transactions, {
      foreignKey: "id_type_transaction",
      targetKey: "id",
    });
    transaction_historys.belongsTo(models.users, {
      as: 'sender',
      foreignKey: "id_sender",
      targetKey: "id",
    });
    transaction_historys.belongsTo(models.users, {
      as: 'receiver',
      foreignKey: "id_receiver",
      targetKey: "id",
    });
  };
  return transaction_historys;
};
