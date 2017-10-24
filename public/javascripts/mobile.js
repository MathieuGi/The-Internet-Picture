/******************* Stripe *********************/

var stripe = Stripe('pk_test_zbTAfIVJ1gtAwSUl3Wr7PEcR');
var elements = stripe.elements();

var style = {
  base: {
    fontSize: '40px'
  },
  invalid: {
    color: '#fa755a',
    iconColor: '#fa755a'
  }
};

var card = elements.create('card', {hidePostalCode: true, style: style});

$(document).ready(function() {

  $('.group-span-filestyle > label').css('padding','2.5rem')
  $('.group-span-filestyle > label > .buttonText').css('font-size','2rem');

});