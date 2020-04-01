'use strict';

module.exports = (sequelize, DataTypes) => {
  const role_users = sequelize.define('role_users', {
    name: DataTypes.STRING,
    isDelete: DataTypes.TINYINT
  }, {});
  role_users.associate = function (models) {
    // associations can be defined here
  };
  return role_users;
};