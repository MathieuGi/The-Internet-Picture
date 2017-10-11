var winston = require('winston');
const FILE_NAME = "services/shared.js";
var path = require('path');
var fs = require('fs');
var jimp = require('jimp');
var bidService = require('./bids');
var buttonBuyService = require('./buttonBuys');
var ejs = require('ejs');
var sizeOf = require('image-size');

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

    reSizeImage: function(filePath,name,quality) {

        var _this = this;
        var weight = 120000; // Weight max of the final picture wanted
        var thumbsPath = 'public/images/thumbs/' + name + '.jpg'; // Path of the thumbs picture
        var modelePath = 'public/images/fullsize/' + name + 'modele.jpg'; // Path of the modele picture (700-400 with quality 100)
        var fullPath = 'public/images/fullsize/' + name + '.jpg'; // Path of the fullSize picture
        var toDeletePath = 'public/images/fullsize/' + name; // Path of the picture without an extension (wich has to be deleted)

        jimp.read(filePath).then(function(img) {
            
            if(quality == 100){
                // Resize picture in 700*400 keeping 100% quality 
                img.contain(700, 400).quality(100).background(0xFFFFFFFF).write(modelePath,function(){

                    // check weight (called size in the function)
                    var stats = fs.statSync(modelePath);
                    var fileSizeInBytes = stats.size;
                    if(fileSizeInBytes>weight){
                        winston.info(FILE_NAME + ' - Image too big with quality = '+ quality + ' : ' +modelePath);
                        // If weight too big, lower quality
                        quality = quality - 10;
                       _this.reSizeImage(modelePath,name,quality);
                    }else{
                        /* If weight is good, make the thumbs picture and create the final of the picture (fullPath), 
                        delete the modele picture and delete the picture without an extension */
                        winston.info(FILE_NAME + ' - Image created with quality = '+ quality + ' : ' +modelePath);
                        img.write(fullPath); 
                        img.contain(50, 50).quality(60).background(0xFFFFFFFF).write(thumbsPath);
                        fs.unlink(modelePath);
                        fs.unlink(toDeletePath);
                    }
                });
            }else{
                // The resizing has been done (700*400) but weight is too big, so we lower quality
                img.quality(quality).write(fullPath,function(){
                    
                    // check if the weight is better now
                    var stats = fs.statSync(fullPath);
                    var fileSizeInBytes = stats.size;
                    if(fileSizeInBytes>weight){
                        winston.info(FILE_NAME + ' - Image too big with quality = '+ quality + ' : ' +modelePath);
                        // If the weight is again too big, lower the quality
                        quality = quality - 10;
                        _this.reSizeImage(modelePath,name,quality);
                    }
                    else{
                        // Create the thumbs picture, delete the modele picture and the 'without extension' picture

                        winston.info(FILE_NAME + ' - Image created with quality : '+ quality + ' : ' +modelePath);
                        img.contain(50, 50).quality(60).background(0xFFFFFFFF).write(thumbsPath);
                        fs.unlink(modelePath); 
                        fs.unlink(toDeletePath);
                    }
                });
            }      
        }).catch(function(err){
            winston.error(FILE_NAME + ' function saveImage - Fail to read image: ' + err);
            throw 'readFileFailed';
        });
    },
    
    saveImage: function(file, name) {
        var _this = this;
        var fullPath = 'public/images/fullsize/' + name + '.jpg'; // Path of the fullSize picture

        // Throw an error if image is too big
        if (file.size > 4000000) {
            winston.error(FILE_NAME + ' - The file it too big');
            throw 'sizeError'
        }
        
        winston.info(FILE_NAME + ' - Image will be resized : ' + fullPath);
        // var dimensions = sizeOf(file.path);
        // if( (dimension.width < 700) && (dimension.height < 400)){
           _this.changeImageQuality(file.path,name,100);
    //     }
    //     else{
         //    _this.reSizeImage(file.path,name,100);
    //    }
    },

    // Function use to send a socket message with every new information on bestBid and buttons
    emitNewBidder: function(io) {

        // Get new bestBid
        var homepage = bidService.getAll(3, 0).then(bidders => {
            var newHtml = ejs.render(fs.readFileSync('views/homepage.ejs', 'utf8'), {bidders: bidders});
            var json = {newHtml: newHtml, bestBid: bidders[0]};
            return json;
        }).catch(err => winston.error(FILE_NAME + ' - emitNewBidder: ' + err));

        // Execute promises and send the result via socket.io
        var promisesArray = [homepage];
        this.doPromises(promisesArray).then(res => {
            io.sockets.emit('newBidder', {homepage: res[0].newHtml, bestBid: res[0].bestBid});
        }).catch(err => {
            winston.error(FILE_NAME + ' - emitNewBidder: ' + err);
            throw err;
        })
    },
}