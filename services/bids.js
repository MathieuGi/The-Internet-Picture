var models = require('../models');
var winston = require('winston');
var checkTypes = require('check-types');

var bid = models.bids;
const FILE_NAME = 'services/bids.js';

module.exports = {

    // This function is used to get the best bid
    getBest: function() {
        return bid.findOne({
            order: [
                ['price', 'DESC'],
                ['createdAt', 'DESC']
            ]
        }).then(function(res) {
            if (res == null) {
                throw 'No result from database';
            } else {
                return res;
            }
        }).catch(function(err) {
            winston.error(FILE_NAME + ' - function "getBest" - Query failure: ' + err);
            throw 'Query failure: ' + err
        });
    },

    // This function is used to get all bids
    getAll: function() {
        return bid.findAll({
            order: [
                ['price', 'DESC'],
                ['createdAt', 'DESC']
            ]
        }).then(function(res) {
            if (res == null) {
                throw 'No result from database';
            } else {
                return res;
            }
        }).catch(function(err) {
            winston.error(FILE_NAME + ' - function "getAll" - Query failure: ' + err);
            throw 'Query failure: ' + err
        });
    },

    // This function is used to create a new bid
    create: function(name, img_path, url, text, price) {
        if (!checkTypes.integer(price) || price <= 0) {
            throw 'Price must be an integer greater than 0'
        } else if (!checkTypes.string(name) || name == "") {
            throw 'Name must be a string not empty'
        } else if (!checkTypes.string(img_path) || img_path == "") {
            throw 'Image path must be a non empty string'
        } else {
            if (url.substring(0, 7) != "http://" && url.substring(0, 8) != "https://" && url != "") {
                url = 'https://' + url;
            }
            bid.build({
                name: name,
                img_path: img_path,
                url: url,
                text: text,
                price: price
            }).save().then(res => {
                winston.info(FILE_NAME + ' - New bid created successfully! ');
                return res;
            }).catch(err => {
                winston.error(FILE_NAME + ' - function "create" - Query failure: ' + err);
                throw 'Query failure: ' + err
            });
        }
    },
}