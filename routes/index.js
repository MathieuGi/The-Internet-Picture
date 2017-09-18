var express = require('express');
var router = express.Router();
var winston = require('winston');

/* GET home page. */
router.get('/', function(req, res, next) {
    winston.log('info', 'Server running')
    res.render('index', { title: 'Express' });
});

module.exports = router;