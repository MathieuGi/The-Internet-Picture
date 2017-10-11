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
var ejs = require('ejs');

var returnRouter = function(io) {

    /* GET home page. */
    router.get('/', function(req, response, next) {
        console.log(req.device.type + '---------------');
        winston.info(FILE_NAME + ' - Prepare to answer to / request');

        bidService.getAll(10, 0).then(res => {
            winston.info(FILE_NAME + ' - Send respond to client');
            if(req.device.type === "phone"){
                response.render('mobile/index', { bidders: res });
            } else {
                response.render('index', { bidders: res });
            }
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
            response.render('rankTableContent', {bidders: res});
        }).catch(err => {
            winston.error(FILE_NAME + ' - Fail to use bidService.getAll() function: ' + err);
        });
    });

    // Use multer to get image from post resquest
    var upload = multer({ dest: 'public/images/fullsize' });

    // Post request to create a new bid
    router.post('/createBid', upload.single('image'), function(req, res, next) {
        winston.info(FILE_NAME + ' - Prepare to answer to /createBid request');

        // Variables settings
        var body = req.body;

        // Check if variables exist
        if (body.name == "") {
            winston.error(FILE_NAME + ' - Trying to create bid without name. Request canceled');
            return res.status(500).json({ error: "missingField" });
        }

        if(typeof req.file == 'undefined'){
            winston.error(FILE_NAME + ' - Trying to create bid without image. Request canceled');
            return res.status(500).json({ error: "noImage" });
        }

        var originalName = req.file.originalname;
        var extension = fileExt(originalName);
        var newName = req.file.filename + '.' + "jpg"
        var acceptedFiles = ["jpeg", "jpg", "png", "gif"];

        // Verifying the file extension
        if (acceptedFiles.indexOf(fileExt(extension)) == -1) {
            winston.error(FILE_NAME + ' - Trying to create bid with wrong file extension. Request canceled')
            return res.status(500).json({ error: "wrongType" });
        } else {

           // Check variables types
            if (!(checkType.string(body.name) &&
                    checkType.string(body.url) &&
                    checkType.string(body.text) &&
                    checkType.string(body.token) &&
                    checkType.integer(parseInt(body.price, 10)))
                ) {

                winston.error(FILE_NAME + ' - Trying to create bid with wrong type of variables');
                return res.status(500).json({ error: "wrongFieldsType" });
            }

            if(body.name.length > 40 || body.text.length > 130){
                winston.error(FILE_NAME + ' - Trying to create bid with too long fields');
                return res.status(500).json({ error: "wrongFieldsType" });
            }

            try {
                // Save image in folder (fullsize and resized)
                sharedService.saveImage(req.file, req.file.filename);


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
                            return res.status(500).json({ error: 'paiementFailed' });
                        } else {
                            bidService.setBidTime().then(() => {
                                sharedService.emitNewBidder(io);
                                return res.status(200).json({ result: 'success' });                            
                            });

                        }
                    });
                }).catch(function(err) {
                    winston.error(FILE_NAME + ' - Fail to add new bid in database');
                    winston.error(FILE_NAME + ' - create bid: ' + err)
                    return res.status(500).json({ error: 'creationFailed' });
                });
            } catch (err) {
                // Error when trying to save image and resize it
                winston.error(FILE_NAME + ' - ' + err);
                return res.status(500).json({ error: err });
            }
        }
    });

    return router;
}

module.exports = returnRouter;