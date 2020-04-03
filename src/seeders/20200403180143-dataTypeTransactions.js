'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('type_transactions', [
      { name: 'transfer', },
      { name: 'purchasing' },
      { name: 'bill payment' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('type_transactions', null, {});
  }
};
