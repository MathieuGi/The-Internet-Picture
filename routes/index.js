var express = require('express');
var router = express.Router();
var bidService = require('../services/bids');
var winston = require('winston');
var FILE_NAME = "routes/index.js";

/* GET home page. */
router.get('/', function(req, response, next) {

    var queries = [bidService.getBest(), bidService.getAll(), ];

    var mostRecentPromise = queries.reduce((previousPromise, query) => {
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

    mostRecentPromise.then(res => {
        response.render('index', { res: res });
    })

});

module.exports = router;