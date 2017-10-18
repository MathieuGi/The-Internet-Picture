$(document).ready(function() {

    //popover
    $(function () {
      $('[data-toggle="popover"]').popover()
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
    $('.rank-table').on("click", ".see-more", function() {
        var offset = $(this).data('offset');
        $('.rank-table .see-more').hide();
        $('.rank-table .loading').show();

        $.ajax({
            type: "GET",
            url: "/getBidsList",
            data: { offset: offset },
            success: function(res) {
                setTimeout(function() {
                    $('#load-more').replaceWith(res);
                    $('.rank-table .see-more').data('offset', offset + 10);
                }, 800);
            },
            error: function(err) {
                console.log('error')
            }
        });


    });

    // Show the picture in full size when clicking on the thumbs one 
    $(".rank-table").on('click', '.thumbs', function(event){
        event.preventDefault();
        var img = $('<img />', { 
        id: 'ranked-image-fullSize',
        src:  "images/fullsize/"+$(this).data('img'),
        alt:  $(this).data('url')
        });
        var cross = $('<span>', {
            class: "close",
            html: "X"
        });
        $('.black-container').html(img);
        $('.black-container').prepend(cross);
        $('.black-container').show();
        $('.black-container').css('display', 'flex');
        event.stopPropagation();
    });

    // When click on the black-container, hide him and the picture
    $('.black-container').on("click", function(){
        $('.black-container').hide();
         
    });

    $('.black-container').on('click', '#ranked-image-fullSize', function(event){
        event.stopPropagation();
    });
      
   $('.rank-table').on('click','.line-ranked-table',function(){
       var url = $(this).data('url')  ? 'www.lol.fr': $(this).data('url');
       window.open($(this).data('url'),'_blank');

        // if(($(this).attr("class"))==='noNewWindow'){return true;}
        // console.log($('.line-ranked-table').data('url'));
        // console.log('ok');
        // window.open( $('.line-ranked-table').data('url') );
        // return false;
    });
    
    // On clicking on trump button, show payement form
    $("#trump").click(function(e){
        
        $(':focus').blur();
        if ($("#paiement").is(":visible")){
            $(".paiement").hide();
        }
        else {
            if(validateForm(1)){
                $(".paiement").show();
                $(window).scrollTop($("#card-element").offset().top - 40);   
                $('#card-element').focus()        
            }

        }
        e.preventDefault();
    });

    // Form validation
    var form = $('#paiement-form');

    form.submit(function(e) {
        e.preventDefault();
        $(':focus').blur();
        if (! validateForm(2)) {
            e.preventDefault();
            e.stopPropagation();
        } else {
            e.preventDefault();
            e.stopPropagation();
            $('.invalid-feedback').hide();
            $('#paiement-form .confirm-button').hide();
            $('#paiement-form .loading').show();
            stripe.createToken(card).then(setOutcome);
        }
    });

    // Timer
    startTime();

    /******************* Stripe *********************/

    card.mount('#card-element');
    var stripeToken = ""
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

    /******************* Paiement confirmation ****************/
    $('#bid-summary-container').on('click', '.reload-image', function(e){
        $('#bid-summary .img img').replaceWith($('#bid-summary .img div').html());
    });

    $('#bid-summary-container').on('click', '#bid-summary .confirm .paye', function(e){
        e.preventDefault();
        $(':focus').blur();
        $('#bid-summary .confirm .paye').hide();
        $('#bid-summary .confirm .loading').show();
        var url = '/confirmBid';
        var id = $('#bid-summary').data('id');
        $.ajax({
            type: "POST",
            url: url,
            data: {id: id, token: stripeToken},
            success: function(res) {
               location.reload();
            },
            error: function(err) {
                if(err.responseJSON.error === "PriceTooLow"){
                    alert('Un nouvel encherisseur vous a pris de vitesse !');
                    $('#menu').show();
                    $('.bid-more').show();
                    $('#bid-summary-container').hide();
                } else {
                    alert('Une erreur est survenue lors du paiement. Votre carte n\'a pas été débitée.');
                    location.reload();
                }
            }
        });
    });

    $('#bid-summary-container').on('click', '#bid-summary .confirm .modify', function(e){
        e.preventDefault();
        $(':focus').blur();
        $('#menu').show();
        $('#bid-summary-container').hide();
        $('.bid-more').show();
    });

    /******************* Socket.io *******************/
    
    function updateDomAfterNewBid(data){
        if($('.picture-area').is(':visible')){
            $('.picture-area').fadeTo(400, 0, function(){
                $('.picture-area').html(data.newHomepage);
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
        } else {
            $('.picture-area').html(data.newHomepage);
        }
        $('.rank-table .table tbody tr').first().remove();
        $('.rank-table .table tbody').prepend(data.changeTableRow);
        $('.rank-table .table tbody').prepend(data.newTableRow);

        $('.bid-value').html(data.bestBid.price);
        $('#paiement-form .min-bid-value').html(data.bestBid.price + 1);
        $('.min-price').val(data.bestBid.price + 1);
        $('.paiement-success').show().delay(2500).fadeOut(2000);
    }

    var socket = io.connect(window.location.host);
    socket.on('newBidder', function(data) {
    });


    /*********************** Functions **********************/

    function startTime() {
        var oneDay = 24 * 60 * 60 * 1000;
        var createdAt = parseInt($('#richest-time').val(), 10);
        var date = new Date();
        var currentTime = Math.abs(date.getTime() + (2 * 60 * 60 * 1000) - createdAt);
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

        if(d !== 0){
            $('.richest-area .days').show();
        }
        if(h !== 0){
            $('.richest-area .hours').show();
        }
        if(m !== 0){
            $('.richest-area .minutes').show();
        }

        if(d == 0 && h == 0){
            $('.richest-area table').css('width', '100px');
            if(m == 0){
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
                    $('#paiement-form .loading').hide(); 
                    $('#paiement-form .confirm-button').show();
                    $('#bid-summary-container').html(res);
                    $('#menu').hide();
                    $('.bid-more').hide();
                    $('#bid-summary-container').show();
                    $(window).scrollTop(0);
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
    var validateForm = function(validationNumber){

        $('.error-message').hide();

        if($('#form-name').val() == ""){
            $('#mandatoryFields').show();
            $(window).scrollTop($("#form-name").offset().top - 40);
            return false;
        } 

        else if($('#form-image').val() == ""){
            $('#noImage').show();
            $(window).scrollTop($("#form-image").offset().top - 40);
            return false;
        } 

        else if($('#form-image')[0].files[0].size > 4000000){
            $('#imageToBig').show();
            $(window).scrollTop($("#form-image").offset().top - 40);
            return false;
        } 

        else if ($('#form-price').val() == ""){
            $('#missing-price').show();
            $(window).scrollTop($("#form-price").offset().top - 40);
            return false;
        } 

        else if ($('#form-price').val() % 1 != 0){
            $('#must-be-integer').show();
            $(window).scrollTop($("#form-price").offset().top - 40);
            return false;
        }  

        else if (parseInt($('#form-price').val(), 10) < parseInt($('.min-price').val(), 10)){
            $('#price-too-low').show();
            $(window).scrollTop($("#form-price").offset().top - 40);
            return false;
        } 

        else if ( (!$('#form-terms').prop('checked')) ){
            $('#missing-terms').show();
            $(window).scrollTop($("#form-terms").offset().top - 40);
            return false;
        }

        else {
            return true;
        }
    }
});

    // JS for the footer

    // When clicking on the "twitter"
    $('.btn-twitter').on('click', function(){
        alert("ok");
    })