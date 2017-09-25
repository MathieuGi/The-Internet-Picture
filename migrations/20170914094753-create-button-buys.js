// To run migration : 'sequelize db:migrate'

'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('buttonBuys', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            value: {
                type: Sequelize.INTEGER,
                defaultValue: 1
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            token: {
                type: Sequelize.STRING,
                defaultValue: ""
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
        return queryInterface.dropTable('buttonBuys');
    }
};