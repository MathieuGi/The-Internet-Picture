var express = require('express');
var router = express.Router();
var bidService = require('../services/bids');
var buttonBuyService = require('../services/buttonBuys');
var winston = require('winston');
//var ipn_verification = require('../paypal/ipn_verification');
var FILE_NAME = "routes/index.js";

// Resolve multiple promises and return their results in an array
var doPromises = function(array) {
    return array.reduce((previousPromise, promise) => {
        return previousPromise.then(resultsArray => {
            return promise.then(res => {
                winston.info(FILE_NAME + ' - Query success')
                resultsArray.push(res);
                return resultsArray;
            }).catch(err => {
                winston.warn(FILE_NAME + ' - Nothing retrieve from database')
                resultsArray.push(null);
                return resultsArray;
            });
        })
    }, Promise.resolve([]));
}

/* GET home page. */
router.get('/', function(req, response, next) {

    winston.info(FILE_NAME + ' - Prepare to answer to / request');
    var promisesArray = [
        bidService.getBest(),
        bidService.getAll(),
        buttonBuyService.getCurrentButton(),
    ];

    doPromises(promisesArray).then(res => {
        var promisesArray2 = [buttonBuyService.getNoTimeButton(res[2].value)];
        doPromises(promisesArray2).then(res2 => {
            res.push(res2[0]);
            winston.info(FILE_NAME + ' - Send respond to client');
            response.render('index', { res: res });
        })
    })

});

// router.post('/paypal', function(req, response, next) {
//     winston.info(FILE_NAME + ' - Prepare to answer to /paypal request');


// });

module.exports = router;