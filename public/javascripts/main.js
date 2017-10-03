$(document).ready(function(){
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
	
});