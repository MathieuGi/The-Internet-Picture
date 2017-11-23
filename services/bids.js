var models = require('../models');
var winston = require('winston');
var checkTypes = require('check-types');

var bid = models.bids;
const FILE_NAME = 'services/bids.js';

module.exports = {

    // This function is used to get a bid by his id
    getById: function (id) {
        return bid.findById(id).then(res => res);
    },

    // This function is used to get a bid by his id and his token
    getByIdAndToken: function (id, token) {
        return bid.findOne({
            where: {
                id: id,
                transaction_id: token
            },
        }).then(res => res);
    },

    // This function is used to get the best bid
    getBest: function () {
        return bid.findOne({
            where: {
                is_active: true
            },
            order: [
                ['price', 'DESC'],
                ['updatedAt', 'ASC']
            ]
        }).then(function (res) {
            if (res == null) {
                throw 'No result from database';
            } else {
                return res;
            }
        }).catch(function (err) {
            winston.error(FILE_NAME + ' - function "getBest" - Query failure: ' + err);
            throw 'Query failure: ' + err
        });
    },


    // This function is used to get all bids
    getAll: function (limit, offset) {
        return bid.findAll({
            where: {
                is_active: true
            },
            order: [
                ['price', 'DESC'],
                ['updatedAt', 'ASC']
            ],
            limit: limit,
            offset: offset
        }).then(function (res) {
            if (res == null) {
                throw 'No result from database';
            } else {
                return res;
            }
        }).catch(function (err) {
            winston.error(FILE_NAME + ' - function "getAll" - Query failure: ' + err);
            throw 'Query failure: ' + err
        });
    },

    // This function is used to create a new bid
    create: function (name, img_path, url, text, price, token) {
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
                price: price,
                transaction_id: token
            }).save().then(res => {
                winston.info(FILE_NAME + ' - New bid created successfully! ');
                return res;
            }).catch(err => {
                winston.error(FILE_NAME + ' - function "create" - Query failure: ' + err);
                throw 'Query failure: ' + err;
            });
        }
    },

    delete: function (id) {
        winston.info(FILE_NAME + " - Bid has been deleted !")
        return bid.destroy({
            where: {
                id: id
            }
        });
    },

    // This function modifiy the bid_time of the bid corresponding to the id_bid in argument
    setBidTime: function () {

        return this.getBest().then(function (res) {
            // Transform date object into timestamp object

            var createdAt = res.createdAt.getTime();
            var nowDate = Date.now();
            var bidTime = (nowDate - createdAt);

            return bid.update({
                bid_time: bidTime
            }, {
                    where: {
                        id: res.id
                    }
                }).then(function (res) {
                    return res;
                }).catch(function (err) {
                    throw err;
                })
        }).catch(function (err) {
            throw err;
        })
    },

    setActive: function (id, value) {
        return bid.update({
            is_active: value
        }, {
                where: {
                    id: id
                }
            }).then(function (res) {
                return res;
            }).catch(function (err) {
                throw err;
            });
    },

    increaseBid: function (id, value) {
        return bid.update({
            value: value
        }, {
                where: {
                    id: id
                }
            }).then(function (res) {
                return res;
            }).catch(function (err) {
                throw err;
            });
    }

}