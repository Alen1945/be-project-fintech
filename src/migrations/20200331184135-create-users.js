'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(11)
      },
      id_role: {
        type: Sequelize.INTEGER(11),
        defaultValue: 1,
        allowNull: false,
        references: {
          model: 'role_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      username: {
        type: Sequelize.STRING(40),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      status: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
      },
      isDelete: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};