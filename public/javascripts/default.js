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
        if ($(this)[0].id == 'bid-more') {
            $('#no-time-button').hide();
            $('#buy-button').show();
        } else {
            $('#buy-button').hide();
            $('#no-time-button').show();
        }
    });

    //Submit form
    $("#new-form").submit(function(e) {
        $('.error-message').hide();
        if ($('#form-image').length) {
            var url = "/createBid";
            var data = new FormData();
            data.append("image", $('#form-image')[0].files[0]);
            data.append("name", $('#form-name').val());
            data.append("url", $('#form-url').val());
            data.append("text", $('#form-text').val());
            data.append("token", "jfhgdvr");
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                success: function(res) {

                },
                error: function(err) {
                    if (err.responseJSON.error == "wrongType") {
                        wrongImageType();
                    } else if (err.responseJSON.error == "missingFields") {
                        mandatoryFields();
                    } else if (err.responseJSON.error == "Request failed") {
                        alert("Merci de renseigner correctement les champs");
                    } else {

                    }
                }
            });
        }
        e.preventDefault();
    });

    var wrongImageType = function() {
        $('#wrongImageType').show();
    }

    var mandatoryFields = function() {
        $('#mandatoryFields').show();
    }

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
        if (i < 10) { i = "0" + i }; // add zero in front of numbers < 10
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

});