'use strict';
module.exports = (sequelize, DataTypes) => {
  const SeenTest = sequelize.define('SeenTest', {
    page_fp: {type: DataTypes.STRING, allowNull: false},
    page_type: {type: DataTypes.STRING, allowNull: false},
    doc_id: {type: DataTypes.STRING, allowNull: false},
    domain: {type: DataTypes.STRING, allowNull: false},
    fp_alg: {type: DataTypes.STRING, defaultValue: 'farmhash'},
    createdAt: { defaultValue: DataTypes.NOW, type: DataTypes.DATE},
    updatedAt: { allowNull: true, type: DataTypes.DATE}
  }, {});
  SeenTest.associate = function(models) {
    // associations can be defined here
  };
  return SeenTest;
};
