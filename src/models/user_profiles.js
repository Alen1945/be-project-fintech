'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_profiles = sequelize.define('user_profiles', {
    id_user: DataTypes.INTEGER,
    fullname: DataTypes.STRING,
    email: DataTypes.STRING,
    gender: DataTypes.STRING,
    picture: DataTypes.TEXT,
    address: DataTypes.TEXT,
    isDelete: DataTypes.TINYINT
  }, {});
  user_profiles.associate = function (models) {
    user_profiles.belongsTo(models.users, { foreignKey: 'id_user', targetKey: 'id' })
  };
  return user_profiles;
};