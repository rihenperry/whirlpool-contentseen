'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.sequelize.transaction((t) => {
      return queryInterface.removeColumn('SeenTests', 'updatedAt', {transaction: t})
        .then((r) => {
          return queryInterface.addColumn('SeenTests', 'updatedAt', {
            type: Sequelize.DATE,
            allowNull: true,
          }, {transaction: t});
        });
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.sequelize.transaction((t) => {
      return queryInterface.removeColumn('SeenTests', 'updatedAt', {transaction: t})
        .then((r) => {
          return queryInterface.addColumn('SeenTests', 'updatedAt', {
            type: Sequelize.DATE,
            allowNull: false,
          }, {transaction: t});
        });
    });
  }
};
