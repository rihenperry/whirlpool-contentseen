'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    var sim = require('../../helpers/simhash');
    var fs = require('fs');
    var mongoose = require('mongoose');

    return queryInterface.bulkInsert('SeenTests', [{
      page_fp: "-1906275206",
      page_type: "nc",
      whirlpool_page_id: mongoose.Types.ObjectId().toString(),
      content_page_id: mongoose.Types.ObjectId().toString(),
      domain: "www.jobs-openings.monster.com",
      fp_alg: "simhash",
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString()
    }]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.bulkDelete('SeenTests', {
      page_fp: '1'
    });
  }
};
