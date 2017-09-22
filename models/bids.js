'use strict';
module.exports = (sequelize, DataTypes) => {
    var bids = sequelize.define('bids', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        img_path: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        text: {
            type: DataTypes.TEXT,
        },
        url: {
            type: DataTypes.TEXT,
        },
        price: {
            type: DataTypes.INTEGER,
        },
        bidTime: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        }
    });
    return bids;
};