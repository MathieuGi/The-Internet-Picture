'use strict';
module.exports = (sequelize, DataTypes) => {
  var connections = sequelize.define('connections', {
    ip: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return connections;
};