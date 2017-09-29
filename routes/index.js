// Variables settings
var express = require('express');
var router = express.Router()
var bidService = require('../services/bids');
var buttonBuyService = require('../services/buttonBuys');
var winston = require('winston');
//var ipn_verification = require('../paypal/ipn_verification');
var sharedService = require('../services/shared')
const FILE_NAME = "routes/index.js";
var multer = require('multer');
var fileExt = require('file-extension');
var checkType = require('check-types');

var returnRouter = function(io) {

    /* GET home page. */
    router.get('/', function(req, response, next) {

        winston.info(FILE_NAME + ' - Prepare to answer to / request');

        // Prepare an array of queries
        var promisesArray = [
            bidService.getBest(),
            bidService.getAll(),
            buttonBuyService.getCurrentButton(),
        ];

        // Execute all queries in the array
        sharedService.doPromises(promisesArray).then(res => {

            // Use current button to find no time button
            var promisesArray2 = [buttonBuyService.getNoTimeButton(res[2].value)];
            sharedService.doPromises(promisesArray2).then(res2 => {

                // Add no time button to result
                res.push(res2[0]);
                winston.info(FILE_NAME + ' - Send respond to client');
                response.render('index', { res: res });
            })
        })

    });

    // router.post('/paypal', function(req, response, next) {
    //     winston.info(FILE_NAME + ' - Prepare to answer to /paypal request');


    // });

    // Use multer to get image from post resquest
    var upload = multer({ dest: 'public/images/fullsize' });

    // Post request to create a new bid
    router.post('/createBid', upload.single('image'), function(req, res, next) {

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

                // Search the value of button
                buttonBuyService.getByToken(body.token).then(button => {

                    // Create the new bid
                    bidService.create(body.name, newName, body.url, body.text, button.value).then(function(newBid) {
                        res.status(200).json({ result: 'success' });
                    }).catch(function(err) {
                        winston.error(FILE_NAME + ' - Fail to add new bid in database');
                        winston.error(FILE_NAME + ' - create bid: ' + err)
                        res.status(500).json({ error: 'creationFailed' });
                    });
                }).catch(function(err) {
                    // Error when trying to get the value of button
                    winston.error(FILE_NAME + ' - Cannot find the button with this token');
                    res.status(500).json({ error: err });
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