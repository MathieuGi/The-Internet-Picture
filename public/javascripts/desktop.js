/******************* Stripe *********************/

var stripe = Stripe('pk_test_zbTAfIVJ1gtAwSUl3Wr7PEcR');
var elements = stripe.elements();

var card = elements.create('card');
    
$(document).ready(function() {

});