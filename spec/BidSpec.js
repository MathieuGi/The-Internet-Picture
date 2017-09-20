var sequelizeModel = require('../node_modules/sequelize/lib/model');
var service = require('../services/bids.js');

describe('BidService', function() {
    fit('Get best but nothing return from database', function(done) {

        spyOn(sequelizeModel, 'findOne').and.callFake(function() {
            return new Promise(function(resolve, reject) {
                resolve(null);
            });
        });

        service.getBest().catch((error) => {
            expect(error).toBe('Query failure: No result from database');
            done();
        });

    });

    fit('Get best but error from database request', function(done) {

        spyOn(sequelizeModel, 'findOne').and.callFake(function() {
            return new Promise(function(resolve, reject) {
                reject('test');
            });
        });

        service.getBest().catch((error) => {
            expect(error).toBe('Query failure: test');
            done();
        })
    });

    fit('Get all but nothing return from database', function(done) {

        spyOn(sequelizeModel, 'findAll').and.callFake(function() {
            return new Promise(function(resolve, reject) {
                resolve(null);
            });
        });

        service.getAll().catch((error) => {
            expect(error).toBe('Query failure: No result from database');
            done();
        });

    });

    fit('Get all but error from database request', function(done) {

        spyOn(sequelizeModel, 'findAll').and.callFake(function() {
            return new Promise(function(resolve, reject) {
                reject('test');
            });
        });

        service.getAll().catch((error) => {
            expect(error).toBe('Query failure: test');
            done();
        })
    })
});