"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("topup_historys", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(11)
      },
      id_user: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      topup_balance: {
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
    return queryInterface.dropTable("topup_historys");
  }
};
