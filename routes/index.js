var express = require('express');
var router = express.Router();
var bidService = require('../services/bids');
var winston = require('winston');

/* GET home page. */
router.get('/', function(req, response, next) {

    var queries = [bidService.getBest(), bidService.getAll(), ];

    var mostRecentPromise = queries.reduce((previousPromise, query) => {
        return previousPromise.then(resultsArray => {
            return query.then(res => {
                resultsArray.push(res);
                return resultsArray;
            }).catch(err => {
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