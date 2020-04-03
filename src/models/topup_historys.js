"use strict";
module.exports = (sequelize, DataTypes) => {
  const topup_historys = sequelize.define(
    "topup_historys",
    {
      id_user: DataTypes.INTEGER,
      topup_balance: DataTypes.DECIMAL,
      isDelete: DataTypes.TINYINT
    },
    {}
  );
  topup_historys.associate = function(models) {
    topup_historys.belongsTo(models.users, {
      foreignKey: "id_user",
      targetKey: "id"
    });
  };
  return topup_historys;
};
