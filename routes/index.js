// Variables settings
var express = require('express');
var router = express.Router();
var bidService = require('../services/bids');
var buttonBuyService = require('../services/buttonBuys');
var winston = require('winston');
var sharedService = require('../services/shared');
const FILE_NAME = "routes/index.js";
var multer = require('multer');
var fileExt = require('file-extension');
var checkType = require('check-types');
var stripe = require("stripe")("sk_test_XAfsNpri7WZmRNUlmmpopsBS");

var returnRouter = function(io) {

    /* GET home page. */
    router.get('/', function(req, response, next) {

        winston.info(FILE_NAME + ' - Prepare to answer to / request');

        bidService.getAll(10, 0).then(res => {
            winston.info(FILE_NAME + ' - Send respond to client');
            response.render('index', { bidders: res });
        }).catch(err => {
            winston.info(FILE_NAME + ' - Fail to use bidService.getAll() function: ' + err);
        });






        // Uncomment if multiple request are needed
        // // Prepare an array of queries
        // var promisesArray = [
        //     bidService.getAll(),
        // ];

        // // Execute all queries in the array
        // sharedService.doPromises(promisesArray).then(res => {

        //     winston.info(FILE_NAME + ' - Send respond to client');
        //     response.render('index', { res: res });
        // })

    });

    // Load more element in rank-table
    router.get('/getBidsList', function(req, response, next) {
        winston.info(FILE_NAME + ' - Prepare to answer to /getBidsList request');

        var query = req.query;

        bidService.getAll(10, parseInt(query.offset)).then(res => {
            winston.info(FILE_NAME + ' - Send respond to client');
            response.json({ bidders: res });
        }).catch(err => {
            winston.info(FILE_NAME + ' - Fail to use bidService.getAll() function: ' + err);
        });
    });

    // Use multer to get image from post resquest
    var upload = multer({ dest: 'public/images/fullsize' });

    // Post request to create a new bid
    router.post('/createBid', upload.single('image'), function(req, res, next) {
        winston.info(FILE_NAME + ' - Prepare to answer to /createBid request');

        // Variables settings
        var body = req.body;
        var originalName = req.file.originalname;
        var extension = fileExt(originalName);
        var newName = req.file.filename + '.' + extension
        var acceptedFiles = ["jpeg", "jpg", "png", "gif"];

        // Check if variables are right
        if (body.name == "") {
            winston.error(FILE_NAME + ' - Trying to create bid without name. Request canceled');
            res.status(500).json({ error: "missingField" });
        }

        if (!(checkType.string(body.name) &&
                checkType.string(body.url) &&
                checkType.string(body.text) &&
                checkType.string(body.token))) {

            winston.error(FILE_NAME + ' - Trying to create bid with wrong type of variables');
            res.status(500).json({ error: "wrongFieldsType" });
        }

        // Verifying the file extension
        if (acceptedFiles.indexOf(fileExt(extension)) == -1) {
            winston.error(FILE_NAME + ' - Trying to create bid with wrong file extension. Request canceled')
            res.status(500).json({ error: "wrongType" });
        } else {
            try {
                // Save image in folder (fullsize and resized)
                sharedService.saveImage(req.file, newName);


                // Create the new bid
                bidService.create(body.name, newName, body.url, body.text, parseInt(body.price)).then(function(newBid) {
                    stripe.charges.create({
                        // Send price in centimes
                        amount: newBid.price * 100,
                        currency: "eur",
                        description: "new Bid",
                        source: body.token,
                    }, function(err, charge) {
                        if (err) {
                            bidService.delete(newBid.id);
                            res.status(500).json({ error: 'paiementFailed' });
                        } else {
                            bidService.setBidTime().then(res => {
                                sharedService.emitNewBidder(io);
                                res.status(200).json({ result: 'success' });                            
                            });

                        }
                    });
                }).catch(function(err) {
                    winston.error(FILE_NAME + ' - Fail to add new bid in database');
                    winston.error(FILE_NAME + ' - create bid: ' + err)
                    res.status(500).json({ error: 'creationFailed' });
                });
            } catch (err) {
                // Error when trying to save image and resize it
                winston.error(FILE_NAME + ' - ' + err);
                res.status(500).json({ error: err });
            }
        }
    });

    return router;
}

module.exports = returnRouter;