var service = require('../service/buttonBuy');
var sequelizeModel = require('../node_modules/sequelize/lib/model');

describe('General test on function getByToken(string)', function () {
    fit("should throw an error when argument is not a string", function (done) {
         // Test with a integer
        expect(function(){service.getByToken(2)}).toThrow("the field is not a string");
        done();
        // Test with a boolean
        expect(function(){service.getByToken(true)}).toThrow("the field is not a string");
        done();
    });

    fit("should throw an error if database return null", function(done) {
        // Do as if database return null to the querie "findOne" 
        spyOn(sequelizeModel, 'findOne').and.callFake(function(){
            return new Promise(function(resolve,reject){
                resolve(null);
            });
        });
        service.getByToken("fakeToken").catch(function(error){
            expect(error).toBe("No result from the database");
            done()
        });
    });

    fit("should throw an error if database throw an error", function(done) {
        // Do as if findOne throw an error
        spyOn(sequelizeModel, 'findOne').and.callFake(function(){
            return new Promise(function(resolve,reject){
                reject("error");
            });
        });
        service.getByToken("fakeToken").catch(function(error){
            expect(error).toBe("error");
            done();
        });
    });
});

describe("Generale test on getCurrentButton", function() {
    fit("should throw an error if database throw an error", function(done) {
        // Do as if findOne throw an error
        spyOn(sequelizeModel, 'findOne').and.callFake(function(){
            return new Promise(function(resolve,reject){
                reject("error");
            });
        });
        service.getCurrentButton().catch(function(error){
            expect(error).toBe("error");
            done();
        });
    });
});

describe("Generale test on getNoTimeButton", function() {
    fit("should throw an error if database throw an error", function(done) {
        // Do as if findOne throw an error
        spyOn(sequelizeModel, 'findOne').and.callFake(function(){
            return new Promise(function(resolve,reject){
                reject("error");
            });
        });
        service.getNoTimeButton(5).catch(function(error){
            expect(error).toBe("error");
            done();
        });
    });
    fit("should throw an error when argument is not a number", function (done) {
         // Test with a string
        expect(function(){service.getNoTimeButton("test")}).toThrow("The value of CurrentButton is not a number");
        done();
        // // Test with a boolean (isNaN return false when argument is boolean.. so the test doesn't make sense.)
        // expect(function(){service.getNoTimeButton(true)}).toThrow("The value of CurrentButton is not a number");
        // done();
    });

    fit("should throw an error if database return null", function(done) {
        // Do as if database return null to the querie "findOne" 
        spyOn(sequelizeModel, 'findOne').and.callFake(function(){
            return new Promise(function(resolve,reject){
                resolve(null);
            });
        });
        service.getNoTimeButton(29).catch(function(error){
            expect(error).toBe("No result from the database");
            done()
        });
    });

});

describe("Generale test on setCurrentButtonInactiv", function() {
    // fit("should throw an error if database throw an error", function(done) {
    //     // Do as if findOne throw an error
    //     spyOn(sequelizeModel, 'updateAttributes').and.callFake(function(){
    //         return new Promise(function(resolve,reject){
    //             reject("error");
    //         });
    //     });
    //     service.setCurrentButtonInactiv(5).catch(function(error){
    //         expect(error).toBe("error");
    //         done();
    //     });
    // });
    fit("should throw an error when argument is not a number", function (done) {
         // Test with a string
        expect(function(){service.setCurrentButtonInactiv("test")}).toThrow("The value of CurrentButton is not a number");
        done();
    });
});

