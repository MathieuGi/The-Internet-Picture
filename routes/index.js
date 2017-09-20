var express = require('express');
var router = express.Router();
var bidService = require('../services/bids');
var buttonBuyService = require('../services/buttonBuys');
var winston = require('winston');
var FILE_NAME = "routes/index.js";

/* GET home page. */
router.get('/', function(req, response, next) {

    var queries = [
        bidService.getBest(),
        bidService.getAll(),
        buttonBuyService.getCurrentButton(),
    ];

    var mostRecentPromise = function(array) {
        return array.reduce((previousPromise, query) => {
            return previousPromise.then(resultsArray => {
                return query.then(res => {
                    resultsArray.push(res);
                    return resultsArray;
                }).catch(err => {
                    winston.info(FILE_NAME + ' - Nothing retrieve from database')
                    resultsArray.push(null);
                    return resultsArray;
                });
            })
        }, Promise.resolve([]));
    }

    mostRecentPromise(queries).then(res => {
        var queries2 = [buttonBuyService.getNoTimeButton(res[2].value)];
        mostRecentPromise(queries2).then(res2 => {
            res.push(res2[0]);
            response.render('index', { res: res });
        })
    })

});

module.exports = router;