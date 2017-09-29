$(document).ready(function() {

    // Hide every error message
    $('.error-message').hide();

    // Start clock
    startTime();

    $('body').css('min-height', $(window).height() + 30 + "px")

    var token = 0;

    // Display right button for buy
    $(".buy-button").click(function(e) {

        token = $(this).data('token');
        // if ($(this)[0].id == 'bid-more') {
        //     $('#no-time-button').hide();
        //     $('#buy-button').show();
        // } else {
        //     $('#buy-button').hide();
        //     $('#no-time-button').show();
        // }
    });

    //Submit form
    $("#new-form").submit(function(e) {
        $('.error-message').hide();
        if ($('#form-image').length) {
            var url = "/createBid";

            // Prepare 
            var data = new FormData();
            data.append("image", $('#form-image')[0].files[0]);
            data.append("name", $('#form-name').val());
            data.append("url", $('#form-url').val());
            data.append("text", $('#form-text').val());
            data.append("token", token);
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                success: function(res) {
                    // Active paypal button
                },
                error: function(err) {
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

    // Socket.io
    var socket = io.connect(window.location.host);
    socket.on('newBidder', function(data) {
        console.log(data)
        if (data[0].button != null) {
            $('#bid-more').replaceWith('<button data-token="' + data[0].button.token + '" type="button" id="bid-more" class=" buy-button btn btn-primary" data-toggle="modal" data-target="#modal-form">' +
                'Surenchérir' +
                '</button>')
        }

        if (data[0].noTimeButton != null) {
            $('#not-time').replaceWith(
                '<button data-token="' +
                data[0].noTimeButton.token +
                '" type="button" id="bid-more" class=" buy-button btn btn-primary" data-toggle="modal" data-target="#modal-form">' +
                'J\'ai pas le temps' +
                '</button>'
            );
        }

        if (data[1] != null) {
            $('#image').replaceWith(
                '<img src="public/images/fullsize/' + data[1].img_path + '" class="richest-image rounded mx-auto d-block img-thumbnail" alt="image from richest">'
            )
        }
    });

    // Stripe
    var stripe = Stripe('pk_test_zbTAfIVJ1gtAwSUl3Wr7PEcR');
    var elements = stripe.elements();
});