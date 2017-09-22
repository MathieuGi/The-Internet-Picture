var winston = require('winston');
const FILE_NAME = "services/shared.js";
var path = require('path');
var fs = require('fs');
var jimp = require('jimp');

module.exports = {
    // Resolve multiple promises and return their results in an array
    doPromises: function(array) {
        return array.reduce((previousPromise, promise) => {
            return previousPromise.then(resultsArray => {
                return promise.then(res => {
                    winston.info(FILE_NAME + ' - Query success')
                    resultsArray.push(res);
                    return resultsArray;
                }).catch(err => {
                    winston.warn(FILE_NAME + ' - Nothing retrieve from database')
                    resultsArray.push(null);
                    return resultsArray;
                });
            })
        }, Promise.resolve([]));
    },

    saveImage: function(file, name) {
        // Create file paths where images will be saved on server
        var fullPath = 'public/images/fullsize/' + name;
        var thumbsPath = 'public/images/thumbs/' + name;
        if (file.size > 2000000) {
            winston.error(FILE_NAME + ' - The file it too big');
            throw 'sizeError'
        }
        fs.rename(file.path, fullPath, function(err) {

            if (err) {
                winston.error(FILE_NAME + ' - Fail to rename and save image: ' + err);
                throw 'renameFailed'
            } else {
                jimp.read(fullPath, function(err, img) {
                    if (err) {
                        winston.error(FILE_NAME + ' - Fail to read image: ' + err);
                        throw 'resizeFailed'
                    }
                    img.contain(50, 50).quality(60).background(0xFFFFFFFF).write(thumbsPath);
                    winston.info(FILE_NAME + ' - Image saved and resized ');
                });
            }
        });
    }
}