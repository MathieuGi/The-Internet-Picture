var winston = require('winston');
const FILE_NAME = "services/shared.js";
var path = require('path');
var fs = require('fs');
var jimp = require('jimp');
var bidService = require('./bids');
var buttonBuyService = require('./buttonBuys');
var ejs = require('ejs');

module.exports = {
    // Resolve multiple promises and return their results in an array
    doPromises: function(array) {
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

    saveImage: function(file, name) {

        // Create file paths where images will be saved on server
        var fullPath = 'public/images/fullsize/' + name;
        var thumbsPath = 'public/images/thumbs/' + name;

        // Throw an error if image is too big
        if (file.size > 2000000) {
            winston.error(FILE_NAME + ' - The file it too big');
            throw 'sizeError'
        }

        // Rename the image and store it on server
        fs.rename(file.path, fullPath, function(err) {

            if (err) {
                winston.error(FILE_NAME + ' - Fail to rename and save image: ' + err);
                throw 'renameFailed'
            } else {

                // Resize image and store it on server
                jimp.read(fullPath, function(err, img) {
                    if (err) {
                        winston.error(FILE_NAME + ' - Fail to read image: ' + err);
                        throw 'readFileFailed'
                    }
                    img.contain(50, 50).quality(60).background(0xFFFFFFFF).write(thumbsPath);
                    winston.info(FILE_NAME + ' - Image saved and resized ');
                });
            }
        });
    },

    // Function use to send a socket message with every new information on bestBid and buttons
    emitNewBidder: function(io) {

        // Get new bestBid
        var bestBid = bidService.getAll(3, 0).then(bidders => {
            return ejs.render(fs.readFileSync('views/homepage.ejs', 'utf8'), {bidders: bidders});
        }).catch(err => winston.error(FILE_NAME + ' - emitNewBidder: ' + err));

        // Execute promises and send the result via socket.io
        var promisesArray = [bestBid];
        this.doPromises(promisesArray).then(res => {
            io.sockets.emit('newBidder', res);
        }).catch(err => {
            winston.error(FILE_NAME + ' - emitNewBidder: ' + err);
            throw err;
        })
    },
}