var express = require('express');
var router = express.Router();
var bidService = require('../services/bids');
var buttonBuyService = require('../services/buttonBuys');
var winston = require('winston');
//var ipn_verification = require('../paypal/ipn_verification');
var sharedService = require('../services/shared')
const FILE_NAME = "routes/index.js";
var multer = require('multer');
var fileExt = require('file-extension');
var checkType = require('check-types');

/* GET home page. */
router.get('/', function(req, response, next) {
    winston.info(FILE_NAME + ' - Prepare to answer to / request');
    var promisesArray = [
        bidService.getBest(),
        bidService.getAll(),
        buttonBuyService.getCurrentButton(),
    ];

    sharedService.doPromises(promisesArray).then(res => {
        var promisesArray2 = [buttonBuyService.getNoTimeButton(res[2].value)];
        sharedService.doPromises(promisesArray2).then(res2 => {
            res.push(res2[0]);
            winston.info(FILE_NAME + ' - Send respond to client');
            response.render('index', { res: res });
        })
    })

});

// router.post('/paypal', function(req, response, next) {
//     winston.info(FILE_NAME + ' - Prepare to answer to /paypal request');


// });

var upload = multer({ dest: '../public/images/' });

router.post('/createBid', upload.single('image'), function(req, res, next) {

    // Variables
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

    if (acceptedFiles.indexOf(fileExt(extension)) == -1) {
        winston.error(FILE_NAME + ' - Trying to create bid with wrong file extension. Request canceled')
        res.status(500).json({ error: "wrongType" });
    } else {
        try {
            sharedService.saveImage(req.file, newName);

            buttonBuyService.getByToken(body.token).then(button => {
                bidService.create(body.name, newName, body.url, body.text, button.value);
                res.status(200).json({ result: 'success' });
            }).catch(function(err) {
                winston.error(FILE_NAME + ' - Cannot find the button with this token');
                res.status(500).json({ error: err });
            });
        } catch (err) {
            console.log(err)
            res.status(500).json({ error: err });
        }
    }
});

module.exports = router;