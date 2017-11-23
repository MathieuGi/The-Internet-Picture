var winston = require('winston');
const FILE_NAME = "services/shared.js";
var path = require('path');
var fs = require('fs');
var jimp = require('jimp');
var bidService = require('./bids');
var models = require('../models');
var connectionsService = models.connections;
var ejs = require('ejs');
var sizeOf = require('image-size');
var sequelize = require('sequelize');

module.exports = {
    // Resolve multiple promises and return their results in an array
    doPromises: function (array) {
        return array.reduce((previousPromise, promise) => {
            return previousPromise.then(resultsArray => {
                return promise.then(res => {

                    // Add result to array of results
                    winston.info(FILE_NAME + ' - Query success')
                    resultsArray.push(res);
                    return resultsArray;

                }).catch(err => {

                    // Add null to array of results (Then their are as much results as input given)
                    winston.warn(FILE_NAME + ' - Nothing retrieve from database')
                    resultsArray.push(null);
                    return resultsArray;

                });
            }).catch(err => {
                winston.error(FILE_NAME + ' - doPromises: ' + err);
                throw err;
            });
        }, Promise.resolve([]));
    },

    transformImage: function (filePath, name, quality) {
        var _this = this;
        var weight = 120000; // Weight max of the final picture wanted
        var minWidth = 1000;
        var minHeight = 800;
        var miniatureWidth = 200;
        var miniatureHeight = 160;
        var thumbsPath = 'public/images/thumbs/' + name + '.jpg'; // Path of the thumbs picture
        var modelePath = 'public/images/fullsize/' + name + 'modele.jpg'; // Path of the modele picture (700-400 with quality 100)
        var fullPath = 'public/images/fullsize/' + name + '.jpg'; // Path of the fullSize picture
        var toDeletePath = 'public/images/fullsize/' + name; // first file to delete at the end

        return jimp.read(filePath).then(img => {

            // First call to this function
            if (quality === 100) {

                // Check if we need to resize
                var dimensions = sizeOf(filePath);
                if (dimensions.width > minWidth || dimensions.height > minHeight) {

                    // Resize image
                    winston.info(FILE_NAME + ' - transformImage: Resizing image in 700x400')
                    img.background(0xFAFAFAFF).scaleToFit(minWidth, minHeight);
                }

                // Save model image
                img.background(0xFAFAFAFF).write(modelePath, function () {
                    // check image weight 
                    var stats = fs.statSync(modelePath);
                    winston.info(FILE_NAME + ' - get stats for image: ' + modelePath);
                    var fileSizeInBytes = stats.size;

                    if (fileSizeInBytes > weight) {
                        winston.info(FILE_NAME + ' - Image too big with quality = ' + quality + ': ' + modelePath);

                        // If weight too big, lower quality
                        quality = quality - 10;
                        _this.transformImage(modelePath, name, quality);
                        return;
                    } else {
                        /* If weight is good, make the thumbs picture and create the final of the picture (fullPath), 
                        delete the modele picture and delete the picture without an extension */
                        winston.info(FILE_NAME + ' - Image created with quality = ' + quality + ': ' + modelePath);
                        img.write(fullPath);
                        img.scaleToFit(miniatureWidth, miniatureHeight).quality(60).write(thumbsPath);
                        fs.unlink(modelePath);
                        fs.unlink(toDeletePath);
                        return;
                    }
                });
            } else {
                // Recursive call to this function 
                img.quality(quality).write(fullPath, function () {

                    // check if the weight is better now
                    var stats = fs.statSync(fullPath);
                    var fileSizeInBytes = stats.size;
                    if (fileSizeInBytes > weight) {

                        winston.info(FILE_NAME + ' - Image too big with quality = ' + quality + ': ' + modelePath);

                        // If the weight is again too big, lower the quality
                        quality = quality - 10;
                        _this.transformImage(modelePath, name, quality);
                        return;
                    } else {

                        // Create the thumbs picture, delete the modele picture and the 'without extension' picture
                        winston.info(FILE_NAME + ' - Image created with quality : ' + quality + ': ' + modelePath);
                        img.scaleToFit(miniatureWidth, miniatureHeight).quality(60).write(thumbsPath);
                        fs.unlink(modelePath);
                        fs.unlink(toDeletePath);
                        return;
                    }
                })
            }
        }).catch(err => {
            winston.error(FILE_NAME + ' function saveImage - Fail to read image: ' + err);
        });
    },

    saveImage: function (file, name) {
        var _this = this;
        var fullPath = 'public/images/fullsize/' + name + '.jpg'; // Path of the fullSize picture

        // Throw an error if image is too big
        if (file.size > 4000000) {
            winston.error(FILE_NAME + ' - The file it too big');
            throw 'sizeError'
        }

        winston.info(FILE_NAME + ' - Image will be resized : ' + fullPath);

        return _this.transformImage(file.path, name, 100).then(function () {
            return;
        }).catch(function () {
            winston.error(FILE_NAME + ' - Fail to transform image');
        });
    },

    // Function use to send a socket message with every new information on bestBid and buttons
    emitNewBidder: function (io) {

        // Get new bestBid
        return bidService.getAll(3, 0).then(bidders => {
            var newHomepage = ejs.render(fs.readFileSync('views/homepage.ejs', 'utf8'), { bidders: bidders });
            var newTableRow = ejs.render(fs.readFileSync('views/rankTableRow.ejs', 'utf8'), { bidder: bidders[0], index: 0 });

            io.sockets.emit('newBidder', {
                newHomepage: newHomepage,
                bestBid: bidders[0],
                newTableRow: newTableRow
            });
        }).catch(err => winston.error(FILE_NAME + ' - emitNewBidder: ' + err));
    },

    // Function use to send a socket message with the bid id to remove from rank table
    emitOldId: function (io, id) {
        io.sockets.emit('removeOldBid', {
            oldId: id,
        });
    },

    // Count number of connections
    addConnection: function (ip) {
        connectionsService.create({ ip: ip }).then(res => {
            winston.info(FILE_NAME + " - New connection");
        })
    }
}