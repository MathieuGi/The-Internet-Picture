$(document).ready(function() {

    // Hide every error message
    $('.error-message').hide();

    // Navigation menu
    $('.menu-item').click(function() {
        var menu = $(this).attr("id");
        $('.menu-item').removeClass('active');
        $(this).addClass('active');
        $('.main-area').fadeOut(700).delay(700);
        $('.' + menu).fadeIn(800);
    });

    // Open page effect
	$('.main-title, #menu, .rich1 .richest-text, .rich1 .header, .rich2, .rich3').fadeTo(3500, 1);

    // Display text at bottom of image
    var textHeight = $('.main-article .richest-text').outerHeight();
    $('.main-article .richest-text').css('bottom', textHeight);
    $('.main-article .img-text').css('height', $('.main-article .img-text').height() - textHeight)

    if ($('.img-text img').height() < ($('.img-text .img').height())) {
        $('.img-text img').css('margin-bottom', textHeight);
    }

    // Form validation
    var form = $('#paiement-form');

    form.submit(function(e) {
        if (form[0].checkValidity() == false) {
            $('.invalid-feedback').show();
            e.preventDefault();
            e.stopPropagation();
        }

        e.preventDefault();
        stripe.createToken(card).then(setOutcome);
    });

    // Put the two image (second and third richest) into the right position
    var positionImageRichest = $(".img-text").position().top;
    var heightOfRich2 = $(".rich2").height();
    var heightOfRich3 = $(".rich3").height();
    var heightImageRichest = $(".img-text").height();

    $(".rich2").css({ "position": "relative", "top": positionImageRichest - heightOfRich2 + heightImageRichest });
    $(".rich3").css({ "position": "relative", "top": positionImageRichest - heightOfRich3 + heightImageRichest });


    /******************* Stripe *********************/

    var stripe = Stripe('pk_test_zbTAfIVJ1gtAwSUl3Wr7PEcR');
    var elements = stripe.elements();

    var card = elements.create('card');
    card.mount('#card-element');

    function setOutcome(result) {
        var successElement = document.querySelector('.success');
        var errorElement = document.querySelector('.error');
        successElement.classList.remove('visible');
        errorElement.classList.remove('visible');

        if (result.token) {
            // Use the token to create a charge or a customer
            // https://stripe.com/docs/charges
            stripeToken = result.token.id;
            successElement.querySelector('.token').textContent = result.token.id;
            successElement.classList.add('visible');
            sendForm();
        } else if (result.error) {
            errorElement.textContent = result.error.message;
            errorElement.classList.add('visible');
        }
    }

    card.on('change', function(event) {
        setOutcome(event);
    });


    /******************* Socket.io *******************/

    var socket = io.connect(window.location.host);
    socket.on('newBidder', function(data) {

        if (data[1] != null) {
            // A revoir !!
            $('#image').replaceWith(
                '<img src="public/images/fullsize/' + data[1].img_path + '" class="richest-image rounded mx-auto d-block img-thumbnail" alt="image from richest">'
            )
        }
    });



    /*********************** Functions **********************/

    var sendForm = function() {
        alert('test')
        $('.error-message').hide();
        if ($('#form-image').length && stripeToken != 0) {
            var url = "/createBid";

            // Prepare 
            var data = new FormData();
            data.append("image", $('#form-image')[0].files[0]);
            data.append("name", $('#form-name').val());
            data.append("url", $('#form-url').val());
            data.append("text", $('#form-text').val());
            data.append("price", $('#form-price').val());
            data.append("token", stripeToken);
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                success: function(res) {
                    // Refresh page
                },
                error: function(err) {
                    // Add paiementFailed
                    if (err.responseJSON.error == "wrongType") {
                        $('#wrongImageType').show();
                    } else if (err.responseJSON.error == "missingField") {
                        $('#mandatoryFields').show();
                    } else {
                        $('#submitFailed').show();
                    }
                }
            });
        }
    }
});