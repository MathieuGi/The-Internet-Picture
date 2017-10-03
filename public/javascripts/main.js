$(document).ready(function(){
	$('.menu-item').click(function(){
		var menu = $(this).attr("id");
		$('.menu-item').removeClass('active');
		$(this).addClass('active');
		$('.main-area').hide();
		$('.' + menu).show();
	});
});