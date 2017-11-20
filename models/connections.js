'use strict';
module.exports = (sequelize, DataTypes) => {
  var connections = sequelize.define('connections', {
    numberConnections: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return connections;
};