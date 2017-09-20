var sequelizeModel = require('../node_modules/sequelize/lib/model');
var service = require('../services/bids.js');

describe('BidService', function() {
    fit('Should throw exception when nothing is find in database for getBest', function(done) {

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

    fit('Should throw exception when trying to getBest but database request failed', function(done) {

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

    fit('Should throw exception when nothing is find in database for getAll', function(done) {

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

    fit('Should throw exception when trying to getAll but database request failed', function(done) {

        spyOn(sequelizeModel, 'findAll').and.callFake(function() {
            return new Promise(function(resolve, reject) {
                reject('test');
            });
        });

        service.getAll().catch((error) => {
            expect(error).toBe('Query failure: test');
            done();
        })
    });

    fit('Should throw exception when trying to create new bid with wrong arguments', function() {

        expect(function() {
            service.create(1, "test", "test", "test", 1)
        }).toThrow('Name must be a string not empty');

        expect(function() {
            service.create(null, "test", "test", "test", 1)
        }).toThrow('Name must be a string not empty');

        expect(function() {
            service.create("", "test", "test", "test", 1)
        }).toThrow('Name must be a string not empty');

        expect(function() {
            service.create("test", "", "test", "test", 1)
        }).toThrow('Image path must be a non empty string');

        expect(function() {
            service.create("test", 1, "test", "test", 1)
        }).toThrow('Image path must be a non empty string');

        expect(function() {
            service.create("test", "test", "test", "test", "1")
        }).toThrow('Price must be an integer greater than 0');

        expect(function() {
            service.create("test", "test", "test", "test", null)
        }).toThrow('Price must be an integer greater than 0');

        expect(function() {
            service.create("test", "test", "test", "test", -3)
        }).toThrow('Price must be an integer greater than 0');

        expect(function() {
            service.create("test", "test", "test", "test", [1, 3])
        }).toThrow('Price must be an integer greater than 0');
    });
});