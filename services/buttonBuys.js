const FILE_NAME = 'services/buttonBuys.js';

var winston = require('winston');
var models = require('../models');
var check = require('check-types');
var math = require('math');

var buttonBuy = models.buttonBuys;

module.exports = {

    // Function wich return the button associated to the token given in argument
    getByToken: function(token) {

        if (check.string(token)) {

            return buttonBuy.findOne({
                where: {
                    token: token
                }
            }).then(function(res) {
                if (res == null) {
                    throw "No result from the database";
                }
                return res;
            }).catch(function(err) {
                throw (err);
                winston.error(FILE_NAME + ' - function "getByToken" - Query failure: ' + err);
            })
        } else {
            throw "the field is not a string";
        }
    },

    // Function wich return the button of "renchérir"
    getCurrentButton: function() {

        return buttonBuy.findOne({
            where: {
                is_active: true,
            },
            order: [
                ['value', 'ASC'],
            ]
        }).then(function(res) {
            return res;

            // findOne has returned an error
        }).catch(function(err) {
            throw (err);
            winston.error(FILE_NAME + ' - function "getCurrentButton" - Query failure: ' + err);
        })
    },

    // Function wich return the button "j'ai pas le temps"
    getNoTimeButton: function(valueOfCurrentButton) {

        if (isNaN(valueOfCurrentButton)) {
            throw "The value of CurrentButton is not a number";
        } else {
            valueOfNoTimeButton = math.trunc(((valueOfCurrentButton + 50) / 100) + 1) * 100;
            return buttonBuy.findOne({
                where: {
                    value: valueOfNoTimeButton
                }
            }).then(function(res) {
                if (res == null) {
                    throw "No result from the database";
                }
                return res;

                // findOne has returned an error
            }).catch(function(err) {
                throw err;
                winston.error(FILE_NAME + ' - function "getNoTimeButton" - Query failure: ' + err);
            });
        }
    },

    // Function wich put "true" in database to "isActiv" for the current button
    setCurrentButtonInactiv: function(idOfCurrentButton) {

        if (isNaN(idOfCurrentButton)) {
            throw "The value of CurrentButton is not a number";
        } else {
            return buttonBuy.update({
                is_active: false
            }, {
                where: {
                    id: idOfCurrentButton
                }
            }).then(function(res) {
                winston.info(FILE_NAME + ' - function "setCurrentButtonInactiv" - CurrentButton has been inactivated');
                return res;

                // updateAttributes has returned an error
            }).catch(function(err) {
                throw err;
                winston.error(FILE_NAME + ' - function "setCurrentButtonInactiv" - Query failure: ' + err);
            })
        }
    }
}