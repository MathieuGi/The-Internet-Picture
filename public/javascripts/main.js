$(document).ready(function() {

    // Hide every error message
    $('.error-message').hide();

    // Redirection to the image menu when clicking on "Qui est le plus riche"
    $('h1').click(function() {
        $('.rank-table-area').hide();
        $('#rank-table-area').removeClass('active');

        $('.picture-area').show();
        $('#picture-area').addClass('active');

        $('.bid-more').hide();
        $('#bid-more').removeClass('active');
    })

    // Navigation menu
    $('.menu-item').click(function() {
        var menu = $(this).attr("id");
        $('.menu-item').removeClass('active');
        $(this).addClass('active');
        $('.main-area').hide();
        $('.' + menu).show();
    });

    // Open page effect
    $('.main-title, #menu, .rich1 .header, .rich2, .rich3').fadeTo(3500, 1);
    $('.rich1 .richest-text').fadeTo(3500, 0.9)

    // Display text at bottom of image
    var textHeight = $('.main-article .richest-text').outerHeight();

    $('.main-article .richest-text').css('width', $('.main-article .img-text').width());
    $(window).resize(function() {
        $('.main-article .richest-text').css('width', $('.main-article .img-text').width());
    })

    if ($('.img-text img').height() < ($('.img-text .img').height() + 20)) {
        $('.img-text img').css('margin-bottom', textHeight);
    }

    // Load more in rank table
    $('.rank-table .see-more').click(function() {
        var offset = $(this).data('offset');
        $('.rank-table .see-more').hide();
        $('.rank-table .loading').show();

        $.ajax({
            type: "GET",
            url: "/getBidsList",
            data: { offset: offset },
            success: function(res) {
                setTimeout(function() {
                    addNextBidders(res.bidders, offset);
                    $('.rank-table .loading').hide();
                    $('.rank-table .see-more').show();
                }, 800);
            },
            error: function(err) {
                console.log('error')
            }
        });


    });

    // On clicking on trump button, show payement form
    $("#trump").click(function(){
        //e.preventDefault();
        if ($("#paiement").is(":visible")){
            $(".paiement").hide();
        }
        else {
            $(".paiement").show(); 
        }

    });

    // Add next bidders in rank-table
    var addNextBidders = function(bidders, offset) {
        var html = "";
        $.each(bidders, function(index, bid) {
            html += rankTableRow(bid);
        });

        $('#load-more').before(html);

        if (bidders.length < 10) {
            $('#load-more').html('<td class="align-middle text-center" colspan="4">Plus d\'enchérisseur</td>')
        } else {
            $('.rank-table .see-more').data('offset', offset + 10);
        }

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

    // Timer
    startTime();

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
            var stripeToken = result.token.id;
            successElement.querySelector('.token').textContent = result.token.id;
            successElement.classList.add('visible');
            sendForm(stripeToken);
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
        if (data[0] != null) {
            var html = rankTableRow(data[0]);

            $('.rank-table .table tbody').prepend(html);
            // A revoir !!
            $('.imageOfRichest').html(
                '<img class="img-fluid" src="public/images/fullsize/' + data[0].img_path + '" alt="image from richest">'
            );

        }
    });



    /*********************** Functions **********************/

    // Generate the html corresponding to a row in rank-table
    var rankTableRow = function(bid) {
        var html = "";
        return html += '<tr>' +
            '<td class="align-middle"><img class="thumbs" src="images/thumbs/' + bid.img_path + '" alt="image miniature"></td>' +
            '<td class="align-middle text-truncate">' + bid.name + '</td>' +
            '<td class="align-middle">' + bid.price + ' €</td>' +
            '<td class="align-middle">' + 'time' + '</td>' +
            '</tr>';
    }

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
        // d = checkDay(d);
        // $('.clock').html(d + h + "h " + m + "m " + s + "s");
        addToTimer('days', d);
        addToTimer('hours', h);
        addToTimer('minutes', m);
        addToTimer('seconds', s);
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

    // Change the value in timer, or hide if value = 0 (Type can be days, hours, ...)
    function addToTimer(type, value) {
        if (value > 0) {
            $('.' + type + ' .clock').html(value);
            if(!$('.' + type).is(':visible')){
                $('.' + type).show();
            }
        } else {
            if (type != 'seconds') {
                $('.' + type).hide();
            }
        }
    }

    // Send all information to create and paye a new bid
    var sendForm = function(stripeToken) {
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
                    $('#menu #picture-area').trigger('click');
                    $('.paiement-success').show().delay(3000).fadeOut(500);
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