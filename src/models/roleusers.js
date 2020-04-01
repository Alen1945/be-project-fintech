'use strict';

module.exports = (sequelize, DataTypes) => {
  const role_users = sequelize.define('role_users', {
    name: DataTypes.STRING,
    is_delete: DataTypes.TINYINT
  }, {});
  role_users.associate = function (models) {
    // associations can be defined here
  };
  return roleusers;
};