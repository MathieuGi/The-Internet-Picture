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
            allowNull: false
        },
        bid_time: {
            type: DataTypes.BIGINT,
            defaultValue: 0
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        transaction_id: {
            type: DataTypes.STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                // associations can be defined here
            }
        }
    });

    // bids.sync();
    return bids;
};