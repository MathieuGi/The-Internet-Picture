$(document).ready(function(){
	
    // Hide every error message
    $('.error-message').hide();

	$('.menu-item').click(function(){
		var menu = $(this).attr("id");
		$('.menu-item').removeClass('active');
		$(this).addClass('active');
		$('.main-area').fadeOut(700).delay(700);
		$('.' + menu).fadeIn(800);
	});

	// $('.main-title').fadeTo(1500, 1, function(){
	// 	$('.img-text .img').fadeTo(1500, 1, function(){
	// 		$('#menu, .main-article header, .richest-text').fadeTo(2000, 1);
	// 	});
	// });


	$('.main-article .richest-text').css('bottom', $('.main-article .richest-text').outerHeight());

	if($('.img-text img').height() < ($('.img-text .img').height() - 20)){
		$('.img-text img').css('margin-bottom', $('.main-article .richest-text').outerHeight());
	}

	// Form validation
	var form = $('#paiement-form');

	form.submit(function(e){
		if(form[0].checkValidity() == false){
			$('.invalid-feedback').show();
			e.preventDefault();
			e.stopPropagation();
		}

		form.addClass("was-validated");
	});

	// REMOVE THIS PART AFTER FUNCTIONNAL INTEGRATION
	var stripe = Stripe('pk_test_zbTAfIVJ1gtAwSUl3Wr7PEcR');
	var elements = stripe.elements();


	// Create an instance of the card Element
	var card = elements.create('card');

	// Add an instance of the card Element into the `card-element` <div>
	card.mount('#card-element');

	// Put the two image (second and third richest) into the right position
	var positionImageRichest = $(".rich1").position().top;
	var heightOfRich2 = $(".rich2").height();
	var heightOfRich3 = $(".rich3").height();
	var heightImageRichest = $(".imageOfRichest").height();

	$(".rich2").css({"position": "relative", "top": positionImageRichest-heightOfRich2+heightImageRichest});
	$(".rich3").css({"position": "relative", "top": positionImageRichest-heightOfRich3+heightImageRichest});
});