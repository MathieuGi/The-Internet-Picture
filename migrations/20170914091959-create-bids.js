// To run migration : 'sequelize db:migrate'

'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('bids', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                allowNull: false,
                type: Sequelize.STRING
            },
            img_path: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            text: {
                type: Sequelize.TEXT
            },
            url: {
                type: Sequelize.TEXT
            },
            price: {
                type: Sequelize.INTEGER
            },
            bidTime: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('bids');
    }
};