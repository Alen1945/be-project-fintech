'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_balances = sequelize.define('user_balances', {
    id_user: DataTypes.INTEGER,
    balance: DataTypes.DECIMAL,
    isDelete: DataTypes.TINYINT
  }, {});
  user_balances.associate = function (models) {
    user_balances.belongsTo(models.users, { foreignKey: 'id_user', targetKey: 'id' })
  };
  return user_balances;
};