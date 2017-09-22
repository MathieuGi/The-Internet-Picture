// var ipn = require('paypal-ipn');
// var params = req.body;

// ipn.verify(params, function callback(err, msg) {
//   if (err) {
//     console.error(err);
//   } else {
//     // Do stuff with original params here
//     console.log("---------------ERROR IPN -----------------------");
//     if (params.payment_status == 'Completed') {
//     // Payment has been confirmed as completed
//         console.log("---------------PAYEMENT CONFIRME -----------------------");
//     }
//   }
// });

//You can also pass a settings object to the verify function:
//ipn.verify(params, {'allow_sandbox': true}, function callback(err, mes) {
  //The library will attempt to verify test payments instead of blocking them
//});