$(document).ready(function() {

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
    $("#trump").click(function(e){
        
        if ($("#paiement").is(":visible")){
            $(".paiement").hide();
        }
        else {
            if(validateForm()){
                $(".paiement").show();               
            }

        }
        e.preventDefault();
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
        e.preventDefault();
        if (! validateForm()) {
            $('.invalid-feedback').show();
            e.preventDefault();
            e.stopPropagation();
        } else {
            $('.invalid-feedback').hide();
            $('#paiement-form .confirm-button').hide();
            $('#paiement-form .loading').show();
            stripe.createToken(card).then(setOutcome);
        }
    });

    // Timer
    startTime();

    // Others timer 
    hideTimePart('.others-area.order-1');
    hideTimePart('.others-area.order-3');

    // Richest adapte img position
    replaceImg();
    $(window).resize(function(){
        replaceImg();
    });    

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

            $('#paiement-form .loading').hide();
            $('#paiement-form .confirm-button').show();
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
        $('.picture-area').fadeTo(400, 0, function(){
            $('.picture-area').html(data[0])
            setTimeout(function(){

                // Others timer 
                hideTimePart('.others-area.order-1');
                hideTimePart('.others-area.order-3');

                // Richest adapte img position
                replaceImg();
            }, 100);
            setTimeout(function(){
                $('.picture-area').fadeTo(300, 1);
            }, 200);
            
        });

 
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

        addToTimer('days', d);
        addToTimer('hours', h);
        addToTimer('minutes', m);
        addToTimer('seconds', s);

        if(d == 0 && h == 0){
            $('.richest-area .hours').hide();
            $('.richest-area table').css('width', '100px');
            if(m == 0){
                $('.richest-area .minutes').hide();
                $('.richest-area table').css('width', '50px');
            }
        }

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
        $('.richest-area td.' + type).html(value);
        if (!$('.richest-area .' + type).is(':visible')) {
            $('.richest-area .' + type).show();
        }
    
        if (type == 'days' && value == 0) {
            $('.richest-area .' + type).hide();
            $('.richest-area table').css('width', '150px');
        }
    }

    function hideTimePart(element){
        
        if($(element + ' .days').html() > 0 || $(element + ' .hours').html() > 0) {
            $(element + ' .seconds').hide();
            if($(element + ' .days').html() > 0){
                $(element + ' table').css('width', '100px');
            } else {
                $(element + ' table').css('width', '70px');
            }
            
        }   

        if ($(element + ' .days').html() === '0') {
            $(element + ' .days').hide();
            $(element + ' table').css('width', '100px');
            
            if($(element + ' .hours').html() === '0'){
                $(element + ' .hours').hide();
                $(element + ' table').css('width', '70px');
                
                if($(element + ' .minutes').html() === '0'){
                    $(element + ' .minutes').hide();
                    $(element + ' table').css('width', '40px');
                }
            }
        }
    }

    // Replace the principal image depending on the presence of richest-text or not
    function replaceImg(){
        if($('.richest-area .block-image img').height() <= 350){
            if(!$.trim($('.richest-area .richest-text span').html())){
                $('.richest-area .block-image img').css('top', ($('.richest-area .block-image .img').height() - $('.richest-area .block-image img').height())  / 2)
            } else {
                $('.richest-area .block-image img').css('top', ($('.richest-area .block-image .img').height() - $('.richest-area .block-image img').height() - 60)  / 2)
            }
        }
    }

    // Send all information to create and paye a new bid
    var sendForm = function(stripeToken) {
        $('.error-message').hide();

        // If their is an image in form and a token created by stripe
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
                    location.reload();
                },
                error: function(err) {

                    // On error show button and hide loading
                    $('#paiement-form .loading').hide(); 
                    $('#paiement-form .confirm-button').show();

                    // Add paiementFailed
                    if (err.responseJSON.error == "wrongType") {
                        $('#wrongImageType').show();
                    } else if (err.responseJSON.error == "missingField") {
                        $('#mandatoryFields').show();
                    } else if(err.responseJSON.error == "wrongFieldsType") {
                        $('#paiement-form .invalid-feedback').show();
                    } else if(err.responseJSON.error == "noImage") {
                        $('#paiement-form #noImage').show();
                    } else {
                        $('#submitFailed').show();
                    }
                }
            });
        }
    }

    // Validate form
    var validateForm = function(){
        console.log($('#form-price').val())
        $('.error-message').hide();
        if($('#form-name').val() == ""){
            $('#mandatoryFields').show();
            window.location = '#form-name';
            return false;
        } else if($('#form-image').val() == ""){
            $('#noImage').show();
            window.location = '#form-image';
            return false;
        } else if($('#form-image')[0].files[0].size > 2000000){
            $('#imageToBig').show();
            window.location = '#form-image';
            return false;
        } else if ($('#form-price').val() == ""){
            $('#missing-price').show();
            window.location = '#form-price';
            return false;
        } else if ($('#form-price').val() % 1 != 0){
            $('#must-be-integer').show();
            window.location = '#form-price';
            return false;
        }  else if (parseInt($('#form-price').val(), 10) <= parseInt($('.min-price').val(), 10)){
            $('#price-too-low').show();
            window.location = '#form-price';
            return false;
        } else {
            return true;
        }
    }
});