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
    getAll: function(limit, offset) {
        return bid.findAll({
            order: [
                ['price', 'DESC'],
                ['createdAt', 'DESC']
            ],
            limit: limit,
            offset: offset
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
            return bid.build({
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
                throw 'Query failure: ' + err;
            });
        }
    },

    delete: function(id) {
        return bid.destroy({
            where: {
                id: id
            }
        })
    },

    // This function update a bid from 'is_active': false to 'is_active': true  function(idBids)
    setBidActive: function(idBid) {
        if (!checkTypes.integer(idBid)) {
            throw "idBid must be an integer"
        } else {
            return bid.update({
                is_active: true
            }, {
                where: {
                    id: idBid
                }
            }).then(function(res) {
                return res;
            }).catch(function(err) {
                throw err;
            })
        }
    },

    // This function check if the value of the bids (in argument) is superior to the value of the current bid function(idBids)
    isValueSuperiorCurrentBid: function(valueOfBid) {
        return this.getBest().then(function(res) {
            if (res.value >= valueOfBid) {
                // return the getBest in order to use it directly in setBidTime 
                return res;
            } else {
                return false;
            }
        }).catch(function(err) {
            throw err;
        })
    },

    // This function modifiy the bid_time of the bid corresponding to the id_bid in argument
    setBidTime: function() {

        return this.getAll(1,1).then(function(res) {
            // Transform date object into timestamp object
            
            var createdAt = res[0].createdAt.getTime();
            var nowDate = Date.now();
            var bidTime = (nowDate - createdAt);

            bid.update({
                bid_time: bidTime
            }, {
                where: {
                    id: res[0].id
                }
            }).then(function(res) {
                return res;
            }).catch(function(err) {
                throw err;
            })
        }).catch(function(err) {
            throw err;
        })
    }

}