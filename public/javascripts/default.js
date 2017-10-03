$(document).ready(function() {

    // Hide every error message
    $('.error-message').hide();

    // Start clock
    startTime();

    $('body').css('min-height', $(window).height() + 30 + "px");

    var stripeToken = 0;

    /******************* Submit form *******************/
    $("#new-form").submit(function(e) {
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
                    console.log("ok")
                        // Active paypal button
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
        e.preventDefault();
    });

    /******************* Bid time *******************/
    var richestTime = $('#richest-time').val();

    function startTime() {
        var oneDay = 24 * 60 * 60 * 1000;
        var createdAt = parseInt($('#richest-time').val(), 10);
        var date = new Date();
        var currentTime = date.getTime() - createdAt;
        //alert("created : " + createdAt + " timezoneoff : " + timezoneOffset + " currentTime : " + currentTime)
        var timer = new Date(currentTime);
        var d = Math.trunc(currentTime / oneDay)

        // RETIRER LE -1 LORSQU'ON CHANGE DE FUSEAU HORAIRE
        var h = timer.getHours() - 1;
        var m = timer.getMinutes();
        var s = timer.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        d = checkDay(d);
        $('.clock').html(d + h + "h " + m + "m " + s + "s");
        var t = setTimeout(startTime, 500);
    }

    function checkTime(i) {
        // add zero in front of numbers < 10
        if (i < 10) { i = "0" + i };
        return i;
    }

    function checkDay(d) {
        if (d > 0) {
            d = d + "j ";
        } else {
            d = "";
        }
        return d;
    }

    /******************* Socket.io *******************/
    var socket = io.connect(window.location.host);
    socket.on('newBidder', function(data) {

        if (data[1] != null) {
            $('#image').replaceWith(
                '<img src="public/images/fullsize/' + data[1].img_path + '" class="richest-image rounded mx-auto d-block img-thumbnail" alt="image from richest">'
            )
        }
    });

    // Hide/Show new-form and paiement-form
    $('#go-to-paiement').click(function(e) {
        e.preventDefault();

        $('#new-form').hide();
        $('#paiement-form').show();
    });

    /******************* Stripe *********************/
    var stripe = Stripe('pk_test_zbTAfIVJ1gtAwSUl3Wr7PEcR');
    var elements = stripe.elements();

    var card = elements.create('card', {
        style: {
            base: {
                iconColor: '#666EE8',
                color: '#31325F',
                lineHeight: '40px',
                fontWeight: 300,
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: '15px',

                '::placeholder': {
                    color: '#CFD7E0',
                },
            },
        }
    });
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
            $('#new-form').submit();
        } else if (result.error) {
            errorElement.textContent = result.error.message;
            errorElement.classList.add('visible');
        }
    }

    card.on('change', function(event) {
        setOutcome(event);
    });

    $('#paiement-form').submit(function(e) {
        e.preventDefault();
        var form = $('#paiement-form');
        var extraDetails = {
            name: form.find('input[name="cardholder-name"]').val(),
        };
        stripe.createToken(card, extraDetails).then(setOutcome);
    });
});