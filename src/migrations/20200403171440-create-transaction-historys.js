'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transaction_historys', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(11)
      },
      id_type_trasaction: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: 'type_trasactions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      },
      id_sender: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION'
      },
      id_receiver: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
        defaultValue: 0,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      isDelete: {
        type: Sequelize.TINYINT(1),
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('transaction_historys');
  }
};