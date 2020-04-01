'use strict';

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    id_role: DataTypes.INTEGER,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.TINYINT,
    isDelete: DataTypes.TINYINT
  }, {});
  users.associate = models => {
    users.belongsTo(models.role_users, { foreignKey: 'id_role', targetKey: 'id' })
  };
  return users;
};