/******************* Stripe *********************/

var stripe = Stripe('pk_live_43dsseaXvLZKULQhHcLRlXKe');
var elements = stripe.elements();

var card = elements.create('card', { hidePostalCode: true, });

$(document).ready(function () {

});