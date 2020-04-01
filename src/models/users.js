'use strict';

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    id_role: DataTypes.INTEGER,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.TINYINT,
    is_delete: DataTypes.TINYINT
  }, {});
  users.associate = models => {
    users.belongsTo(models.role_users)
  };
  return users;
};