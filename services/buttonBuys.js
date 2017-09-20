var models = require('../models');
var check = require('check-types');
var math = require('math');

var buttonBuy = models.buttonBuys;

module.exports = {
    getByToken: function(token){
        
        if (check.string(token)){
            
            return buttonBuy.findOne({
                where:{
                    token: token
                }
            }).then(function(res) {
                if(res == null){
                    throw "No result from the database";
                }
                return res;
            }).catch(function(err){
                throw (err);
            }) 
        }
        else {
            throw "the field is not a string";
        }
    },
    getCurrentButton :function(){

        return buttonBuy.findOne({
                where: {
                    is_active: true,
                },
                order: [
                    ['value', 'ASC'],
                ]
        }).then(function(res){
            return res;
        }).catch(function(err){
            throw (err);
        })
    },
    getNoTimeButton: function(valueOfCurrentButton){

        if(isNaN(valueOfCurrentButton)){
            throw "The value of CurrentButton is not a number";
        }
        else{
            valueOfNoTimeButton = math.trunc(((valueOfCurrentButton + 50) / 100) + 1) * 100;
            return buttonBuy.findOne({
                where: {
                    value: valueOfNoTimeButton
                }
            }).then(function(res){
                if(res==null){
                    throw "No result from the database";
                }
                return res;
            }).catch(function(err){
                throw err;
            });
        }
    },
    setCurrentButtonInactiv: function(IdOfCurrentButton) {

        if(isNaN(IdOfCurrentButton)){
            throw "The value of CurrentButton is not a number";
        }
        else{
            return buttonBuy.updateAttributes({
                is_active: false
            },
            {
                where : {
                    id: IdOfCurrentButton
                }
            }).then(function(res){
                return res;
            }).catch(function(err){
                throw err;
            })
        }
    }
}

