// Variables settings
var express = require('express');
var router = express.Router();
var bidService = require('../services/bids');
var sharedService = require('../services/shared');
var winston = require('winston');
const FILE_NAME = "routes/index.js";
var multer = require('multer');
var fileExt = require('file-extension');
var checkType = require('check-types');
var stripe = require("stripe")("sk_test_XAfsNpri7WZmRNUlmmpopsBS");
var ejs = require('ejs');
var sequelize = require('sequelize')
var returnRouter = function (io) {

    router.get('/googledfd1b614c73d040a.html', function (req, res, next) {
        res.sendFile(__dirname + '/googledfd1b614c73d040a.html');
    });

    /* GET home page. */
    router.get('/', function (req, response, next) {
        winston.info(FILE_NAME + ' - Prepare to answer to / request');
        winston.info(FILE_NAME + ' - Request from ' + req.device.type);
        var ip = typeof req.get('X-Real-IP') !== 'undefined' ? req.get('X-Real-IP') : req.get('X-Forwarded-For');
        sharedService.addConnection(ip);

        bidService.getAll(10, 0).then(res => {
            winston.info(FILE_NAME + ' - Send respond to client');
            if (req.device.type === "phone") {
                response.render('mobile/index', { bidders: res });
            } else {
                response.render('index', { bidders: res });
            }
        }).catch(err => {
            winston.info(FILE_NAME + ' - Fail to use bidService.getAll() function: ' + err);
            response.render('error');
        });
    });

    // Get bid information
    router.get('/getBidInfo', function (req, response, next) {
        winston.info(FILE_NAME + ' - Prepare to answer to /getBidInfo request');

        var id = parseInt(req.query.id);

        bidService.getById(id).then(res => {
            winston.info(FILE_NAME + ' - Render bid info id: ' + id)
            response.render('increase-bid', { bidder: res });
        }).catch(err => {
            winston.error(FILE_NAME + ' - Fail to use bidService.getById() function: ' + err);
            response.json({ error: 'error' })
        });
    });

    // Load more element in rank-table
    router.get('/getBidsList', function (req, response, next) {
        winston.info(FILE_NAME + ' - Prepare to answer to /getBidsList request');
        winston.info(FILE_NAME + ' - Request from ' + req.device.type);

        var offset = parseInt(req.query.offset);

        bidService.getAll(10, offset).then(res => {
            winston.info(FILE_NAME + ' - Send respond to client');
            if (req.device.type === "phone") {
                response.render('mobile/rankTableContent', { bidders: res, offset: offset });
            } else {
                response.render('rankTableContent', { bidders: res, offset: offset });
            }
        }).catch(err => {
            winston.error(FILE_NAME + ' - Fail to use bidService.getAll() function: ' + err);
        });
    });

    router.post('/confirmBid', function (req, res, next) {

        // Variables settings
        var body = req.body;
        var oldId = body.oldId != "" ? body.oldId : 1;
        bidService.getByIdAndToken(body.id, body.token).then(bidder => {
            bidService.getBest().then(bestBidder => {
                bidService.getById(parseInt(oldId, 10)).then(oldBid => {
                    var params = body.email !== "" ? {
                        // Send price in centimes
                        amount: bidder.price - oldBid.price,
                        currency: "eur",
                        receipt_email: body.email,
                        description: "Nouvelle enchère",
                        source: bidder.transaction_id,
                    } : {
                            // Send price in centimes
                            amount: bidder.price - oldBid.price,
                            currency: "eur",
                            description: "Nouvelle enchère",
                            source: bidder.transaction_id,
                        };

                    if (body.oldId !== "") {
                        bidService.setActive(parseInt(body.oldId, 10), false).then(function () {
                            bidService.setActive(bidder.id, true);
                        });
                    } else {
                        bidService.setActive(bidder.id, true);
                    }

                    stripe.charges.create(params, function (err, charge) {
                        if (err) {
                            winston.error(FILE_NAME + ' - Paiement failed:' + err);

                            if (body.oldId !== "") {
                                bidService.setActive(parseInt(body.oldId, 10), true).then(function () {
                                    bidService.setActive(bidder.id, false);
                                });
                            } else {
                                bidService.setActive(bidder.id, false);
                            }

                            return res.status(500).json({ error: 'paiementFailed' });
                        } else {

                            if (body.oldId !== "") {
                                bidService.setActive(parseInt(body.oldId, 10), false).then(function () {
                                    bidService.setActive(bidder.id, true).then(function () {
                                        sharedService.emitNewBidder(io);
                                        sharedService.emitOldId(io, body.oldId);
                                        return res.status(200).json({ result: 'success' });
                                    });
                                });
                            } else {
                                bidService.setBidTime().then(() => {
                                    bidService.setActive(bidder.id, true).then(function () {
                                        sharedService.emitNewBidder(io);
                                        return res.status(200).json({ result: 'success' });
                                    });
                                });
                            }
                        }
                    });
                }).catch(err => {
                    winston.info(FILE_NAME + ' - Fail to use bidService.getBest() function: ' + err);
                });
            }).catch(err => {

            });


        }).catch(err => {
            winston.info(FILE_NAME + ' - Fail to use bidService.getById() function: ' + err);
            return res.status(500).json({ error: 'IdNotFound' })
        });
    });

    // Use multer to get image from post resquest
    var upload = multer({ dest: 'public/images/fullsize' });

    // Post request to create a new bid
    router.post('/createBid', upload.single('image'), function (req, res, next) {
        winston.info(FILE_NAME + ' - Prepare to answer to /createBid request');

        // Variables settings
        var body = req.body;

        // Check if variables exist
        if (body.name == "") {
            winston.error(FILE_NAME + ' - Trying to create bid without name. Request canceled');
            return res.status(500).json({ error: "missingField" });
        }

        if (typeof req.file == 'undefined') {
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
                checkType.positive(parseInt(body.price * 100, 10)))
            ) {

                winston.error(FILE_NAME + ' - Trying to create bid with wrong type of variables');
                return res.status(500).json({ error: "wrongFieldsType" });
            }

            if (body.name.length > 40 || body.text.length > 130) {
                winston.error(FILE_NAME + ' - Trying to create bid with too long fields');
                return res.status(500).json({ error: "wrongFieldsType" });
            }

            // Save image in folder (fullsize and resized)
            sharedService.saveImage(req.file, req.file.filename).then(function () {
                // Create the new bid
                bidService.create(body.name, newName, body.url, body.text, parseInt(body.price * 100), body.token).then(function (newBid) {
                    winston.info('this is the smiley : ' + newBid.name);
                    if (req.device.type === "phone") {
                        return res.status(200).render('mobile/confirmBid', { bidder: newBid });
                    } else {
                        return res.status(200).render('confirmBid', { bidder: newBid });
                    }
                }).catch(function (err) {
                    winston.error(FILE_NAME + ' - Fail to add new bid in database');
                    winston.error(FILE_NAME + ' - create bid: ' + err)
                    return res.status(500).json({ error: 'creationFailed' });
                });
            }).catch(err => {
                // Error when trying to save image and resize it
                winston.error(FILE_NAME + ' - ' + err);
                return res.status(500).json({ error: err });
            });
        }
    });

    // Post request to create a new bid
    router.post('/increaseBid', function (req, res, next) {
        winston.info(FILE_NAME + ' - Prepare to answer to /createBid request');

        // Variables settings
        var body = req.body;

        // Verifying the file extension

        // Check variables types
        if (!(checkType.string(body.token) &&
            parseInt(body.price * 100, 10) >= 50 &&
            checkType.string(body.text))
        ) {
            console.log(parseInt(body.price * 100, 10));
            winston.error(FILE_NAME + ' - Trying to create bid with wrong type of variables');
            return res.status(500).json({ error: "wrongFieldsType" });
        }

        bidService.getById(body.id).then(bid => {

            var text = body.text !== "" ? body.text : bid.text;

            // Create the new bid
            bidService.create(bid.name, bid.img_path, bid.url, text, parseInt(body.price * 100) + bid.price, body.token).then(function (newBid) {

                if (req.device.type === "phone") {
                    return res.status(200).render('mobile/confirmBid', { bidder: newBid });
                } else {
                    return res.status(200).render('confirmBid', { bidder: newBid });
                }
            }).catch(function (err) {
                winston.error(FILE_NAME + ' - Fail to add new bid in database');
                winston.error(FILE_NAME + ' - create bid: ' + err)
                return res.status(500).json({ error: 'creationFailed' });
            });
        }).catch(err => {
            winston.error(FILE_NAME + ' - fail to find bid by id: ' + err)
            return res.status(500).json({ error: 'error' });
        });



    });

    return router;
}

module.exports = returnRouter;