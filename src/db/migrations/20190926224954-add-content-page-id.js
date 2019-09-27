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
      return Promise.all([
        queryInterface.addColumn('SeenTests', 'content_page_id', {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'delete this'
        }, { transaction: t }),
        queryInterface.renameColumn('SeenTests', 'doc_id', 'whirlpool_page_id', { transaction: t })
      ]);
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
      return Promise.all([
        queryInterface.removeColumn('SeenTests', 'content_page_id', { transaction: t }),
        queryInterface.renameColumn('SeenTests', 'whirlpool_page_id', 'doc_id', { transaction: t })
      ]);
    });
  }
};
