var models = require('../models');
var winston = require('winston');

var bid = models.bids;

module.exports = {

    // This function is used to get the best bid
    getBest: function() {
        return bid.findOne({
            order: [
                ['price', 'DESC'],
                ['createAt', 'DESC']
            ]
        }).then(function(res) {
            if (res == null) {
                throw 'No result from database';
            } else {
                return res;
            }
        }).catch(function(err) {
            winston.error('Query failure: ' + err);
            throw 'Query failure: ' + err
        });
    },

    getAll: function() {
        return bid.findAll({
            order: [
                ['price', 'DESC'],
                ['createAt', 'DESC']
            ]
        }).then(function(res) {
            if (res == null) {
                throw 'No result from database';
            } else {
                return res;
            }
        }).catch(function(err) {
            winston.error('Query failure: ' + err);
            throw 'Query failure: ' + err
        });
    },
}