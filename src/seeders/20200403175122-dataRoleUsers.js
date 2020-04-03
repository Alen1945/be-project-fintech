'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('role_users', [
      { name: 'user', },
      { name: 'admin' },
      { name: 'superadmin' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('role_users', null, {});
  }
};
