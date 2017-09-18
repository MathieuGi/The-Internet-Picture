'use strict';
module.exports = (sequelize, DataTypes) => {
    var buttonBuys = sequelize.define('buttonBuys', {
        value: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        token: {
            type: DataTypes.STRING,
            defaultValue: ""
        }
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        }
    });
    return buttonBuys;
};