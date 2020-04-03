'use strict';

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    'users',
    {
      id_role: DataTypes.INTEGER,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      status: DataTypes.TINYINT,
      isDelete: DataTypes.TINYINT
    },
    {}
  );
  users.associate = models => {
    users.belongsTo(models.role_users, {
      foreignKey: 'id_role',
      targetKey: 'id'
    });
    users.hasOne(models.user_profiles, { foreignKey: 'id_user' });
    users.hasOne(models.user_balances, { foreignKey: 'id_user' });
    users.hasMany(models.topup_historys, { foreignKey: 'id_user' });
    users.hasMany(models.transaction_historys, { foreignKey: 'id_sender' });
    users.hasMany(models.transaction_historys, { foreignKey: 'id_receiver' })
  };
  return users;
};
