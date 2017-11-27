$(document).ready(function () {

  // popover
  $(function () {
    $('[data-toggle="popover"]').popover();
  });

  // Navigation menu
  var footer = $('.footer');

  $('.menu-item').click(function (e) {
    var menu = $(this).attr('id');

    $('.menu-item').removeClass('active');
    $(this).addClass('active');
    $('.main-area').hide();
    $('.' + menu).show();

    // show social icons only on homepage
    footer.css('margin-top', 0);
    if (menu !== "picture-area") {
      $('.social-div').hide();
    } else {
      $('.social-div').show();
    }

    // Unselect the page after changing page
    var selection = window.getSelection();
    selection.removeAllRanges();
    e.stopPropagation();
  });

  // Richest-text placement
  $(document).ajaxComplete(function () {
    replaceText('#bid-summary');
  });

  // replaceText('.picture-area')

  // Increase bid
  $('.increase-bid').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    var id = $(this).data('id');
    getBidInfo(id);
  });

  // Back from increase bid page
  $('.back-button').click(function () {
    isNewBid = true;
    $('#increase-bid-area').html("");
    $('.form-price-label').html('Montant');
    $('#menu').show();
    $('.main-area').hide();
    $('.rank-table-area').show();
    $('.back-button').hide();
    $('.name-group, .image-group, .link-group, .text-group').show();
  });

  // Load more in rank table
  $('.rank-table').on('click', '.see-more', function () {
    var offset = $(this).data('offset');
    $('.rank-table .see-more').hide();
    $('.rank-table .loading').show();

    $.ajax({
      type: 'GET',
      url: '/getBidsList',
      data: { offset: offset },
      success: function (res) {
        $('#load-more').replaceWith(res);
        $('.rank-table .see-more').data('offset', offset + 10);
      },
      error: function (err) {
        console.log('error');
      }
    });
  });

  // Show the picture in full size when clicking on the thumbs one 
  $('.rank-table').on('click', '.thumbs', function (event) {
    event.preventDefault();
    var img = $('<img />', {
      id: 'ranked-image-fullSize',
      src: 'images/fullsize/' + $(this).data('img'),
      alt: "Image plein écran"
    });
    var cross = $('<span>', {
      class: 'close',
      html: 'X'
    });
    $('.black-container').html(img);
    $('.black-container').prepend(cross);
    $('.black-container').show();
    $('.black-container').css('display', 'flex');
    event.stopPropagation();
  });

  // When click on the black-container, hide him and the picture
  $('.black-container').on('click', function () {
    $('.black-container').hide();
  });

  $('.black-container').on('click', '#ranked-image-fullSize', function (event) {
    event.stopPropagation();
  });

  $('.rank-table').on('click', '.line-ranked-table', function () {
    var url = $(this).data('url');

    if (url !== "") {
      window.open(url, '_blank');
    }
  });

  // Display only 2 decimals in price
  $('#paiement-form .form-price').keyup(function () {
    var price = $('#paiement-form .form-price');
    var priceArray = $('#paiement-form .form-price').val().split(".");
    var priceDecimals = "";
    if (priceArray.length === 2) {
      priceDecimals = priceArray[1].slice(0, 2);
      price.val(priceArray[0] + '.' + priceDecimals);
    }
  });

  var isNewBid = true;

  // On clicking on trump button, show payement form
  $('#trump').click(function (e) {
    $(':focus').blur();
    if ($('#paiement').is(':visible')) {
      $('.paiement').hide();
    } else {
      if (validateForm(1)) {
        $('.paiement').show();
        $(window).scrollTop($('#card-element').offset().top - 40);
        $('#card-element').focus();
      }
    }
    e.preventDefault();
  });

  // Form validation
  var form = $('#paiement-form');

  form.submit(function (e) {
    e.preventDefault();
    $(':focus').blur();
    if (!validateForm(2)) {
      e.preventDefault();
      e.stopPropagation();
    } else {
      e.preventDefault();
      e.stopPropagation();
      $('.invalid-feedback').hide();
      $('#paiement-form .confirm-button').hide();
      $('#paiement-form .loading').show();
      var extraDetails = {
        name: $('#form-card-name').val()
      };
      stripe.createToken(card, extraDetails).then(setOutcome);
    }
  });

  // Form: Update name when change file
  $('#form-image').change(function () {
    var filename = this.value.replace(/C:\\fakepath\\/i, '');
    $('#form-image-text').html(filename);
  });

  // Footer -> twitter and facebook buttons
  (function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = 'https://connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v2.11';
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  window.twttr = (function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
      t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);

    t._e = [];
    t.ready = function (f) {
      t._e.push(f);
    };

    return t;
  }(document, "script", "twitter-wjs"));

  /******************* Stripe *********************/

  card.mount('#card-element');
  var stripeToken = '';
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

      if (isNewBid) {
        sendForm(stripeToken);
      } else {
        SendIncreaseForm(stripeToken);
      }

    } else if (result.error) {
      $('#paiement-form .loading').hide();
      $('#paiement-form .confirm-button').show();
      errorElement.textContent = result.error.message;
      errorElement.classList.add('visible');
    }
  }

  card.on('change', function (event) {
    setOutcome(event);
  });

  /******************* Paiement confirmation ****************/
  $('#bid-summary-container').on('click', '.reload-image', function (e) {
    $('#bid-summary .img img').replaceWith($('#bid-summary .img div').html());
  });

  $('#bid-summary-container').on('click', '#bid-summary .confirm .paye', function (e) {
    e.preventDefault();
    $(':focus').blur();
    $('#bid-summary .confirm .paye').hide();
    $('#bid-summary .confirm .loading').css('display', 'inline-flex');
    var url = '/confirmBid';
    var id = $('#bid-summary').data('id');
    var email = $('#form-email').val();
    var oldId = typeof $('.bid-to-increase').data('id') !== 'undefined' ? $('.bid-to-increase').data('id') : "";
    $.ajax({
      type: 'POST',
      url: url,
      data: { id: id, token: stripeToken, email: email, oldId: oldId },
      success: function (res) {
        location.reload();
      },
      error: function (err) {
        if (err.responseJSON.error === 'PriceTooLow') {
          alert('Un nouvel encherisseur vous a pris de vitesse !');
          $('#menu').show();
          $('.bid-more').show();
          $('#bid-summary-container').hide();
        } else {
          alert("Une erreur est survenue lors du paiement. Votre carte n'a pas été débitée.");
          location.reload();
        }
      }
    });
  });

  $('#bid-summary-container').on('click', '#bid-summary .confirm .modify', function (e) {
    e.preventDefault();
    $(':focus').blur();
    $('#menu').show();
    $('#bid-summary-container').hide();
    $('.bid-more').show();
  });

  /******************* Socket.io *******************/

  function updateDomAfterNewBid(data) {
    if ($('.picture-area').is(':visible')) {
      $('.picture-area').fadeTo(400, 0, function () {
        $('.picture-area').html(data.newHomepage);
        setTimeout(function () {
          $('.picture-area').fadeTo(300, 1);
        }, 200);
      });
    } else {
      $('.picture-area').html(data.newHomepage);
    }

    $('.line-ranked-table .index').each(function (index) {
      $(this).html(index + 2 + ".");
    });

    $('.rank-table .table tbody').prepend(data.newTableRow);

    $('.bid-value').html(data.bestBid.price / 100);
    $('#paiement-form .min-bid-value').html((data.bestBid.price + 1) / 100);
    $('.min-price').val((data.bestBid.price + 1) / 100);
    $('.paiement-success').show().delay(2500).fadeOut(2000);
  }

  function removeOldBid(data) {
    $('.rank-table tr[data-id="' + data.oldId + '"]').remove();
    $('.rank-table .index').each(function (index) {
      if (index !== 0) {
        this.value = index + 1;
      }
    });
  }

  var socket = io.connect(window.location.host);
  socket.on('newBidder', function (data) {
    updateDomAfterNewBid(data);
  });

  socket.on('removeOldBid', function (data) {
    removeOldBid(data);
  });

  /*********************** Functions **********************/

  // Get info for increase bid
  var getBidInfo = function (id) {
    url = "/getBidInfo";
    $.ajax({
      type: 'GET',
      url: url,
      data: { id: id },
      success: function (res) {
        isNewBid = false;
        $('#increase-bid-area').html(res);
        $('.form-price-label').html('Montant de la relance');
        $('#menu').hide();
        $('.main-area').hide();
        $('.bid-more').show();
        $('.back-button').show();
        $('.name-group, .image-group, .link-group, .text-group').hide();
      },
      error: function () {
        alert('Une erreur est survenue');
      }
    });
  };

  // Send all information to create and paye a new bid
  var sendForm = function (stripeToken) {
    $('.error-message').hide();

    // If their is an image in form and a token created by stripe
    if ($('#form-image').length && stripeToken != 0) {
      var url = '/createBid';

      // Prepare 
      var data = new FormData();
      data.append('image', $('#form-image')[0].files[0]);
      data.append('name', $('#form-name').val());
      data.append('url', $('#form-url').val());
      data.append('text', $('#form-text').val());
      data.append('price', $('#form-price').val());
      data.append('oldId', '');
      data.append('token', stripeToken);
      $.ajax({
        type: 'POST',
        url: url,
        data: data,
        cache: false,
        contentType: false,
        processData: false,
        success: function (res) {
          $('#paiement-form .loading').hide();
          $('#paiement-form .confirm-button').show();
          $('#bid-summary-container').html(res);
          $('#menu').hide();
          $('.bid-more').hide();
          $('#bid-summary-container').show();
          $(window).scrollTop(0);
        },
        error: function (err) {

          // On error show button and hide loading
          $('#paiement-form .loading').hide();
          $('#paiement-form .confirm-button').show();

          // Add paiementFailed
          if (err.responseJSON.error == 'wrongType') {
            $('#wrongImageType').show();
          } else if (err.responseJSON.error == 'missingField') {
            $('#mandatoryFields').show();
          } else if (err.responseJSON.error == 'wrongFieldsType') {
            $('#paiement-form .invalid-feedback').show();
          } else if (err.responseJSON.error == 'noImage') {
            $('#paiement-form #noImage').show();
          } else {
            $('#submitFailed').show();
          }
        }
      });
    }
  };

  var imageIsLoaded = function () {
    $("<img/>")
      .on('load', function () {
        setTimeout(function () {
          replaceText('#bid-summary');
        }, 500);

      })
      .on('error', function () {

        setTimeout(function () {
          $('#bid-summary .img img').replaceWith($('#bid-summary .img div').html());
        }, 500);

        imageIsLoaded();
      })
      .attr("src", $('#bid-summary .img img').attr("src"))
      ;
  }

  var replaceText = function (area) {
    var newWidth = 0;
    $(area + ' .richest-text').each(function (index) {
      // if their is a link add one more .children
      if ($(this).siblings().is("a")) {
        newWidth = $(this).siblings().children().children().width();
      } else {
        newWidth = $(this).siblings().children().width();
      }
      if (newWidth !== 0) {
        $(this).css('width', newWidth);
        $(this).css('margin-top', - $(this).outerHeight());
      }
    });
  }

  // Increase bid sending form
  var SendIncreaseForm = function (stripeToken) {
    $('.error-message').hide();

    // If their is a token created by stripe
    if (stripeToken != 0) {
      var url = '/increaseBid';

      $.ajax({
        type: 'POST',
        url: url,
        data: {
          id: $('.bid-to-increase').data('id'),
          price: $('#form-price').val(),
          token: stripeToken
        },
        success: function (res) {
          $('#paiement-form .loading').hide();
          $('#paiement-form .confirm-button').show();
          $('#bid-summary-container').html(res);
          $('.increase-value').replaceWith(
            `<tr>
              <th><strong>Montant</strong> de la <strong>relance</strong> : </th>
              <td class="increase-value"> ` + $('#form-price').val() + ` €</td>
            </tr>`
          );
          $('.total-bid-value').html('Nouveau <strong>montant</strong> de l\'<strong>enchère</strong> : ');
          $('.bid-more').hide();
          $('#bid-summary-container').show();
          $(window).scrollTop(0);
        },
        error: function (err) {

          // On error show button and hide loading
          $('#paiement-form .loading').hide();
          $('#paiement-form .confirm-button').show();

          // Add paiementFailed
          if (err.responseJSON.error == 'wrongType') {
            $('#wrongImageType').show();
          } else if (err.responseJSON.error == 'missingField') {
            $('#mandatoryFields').show();
          } else if (err.responseJSON.error == 'wrongFieldsType') {
            $('#paiement-form .invalid-feedback').show();
          } else if (err.responseJSON.error == 'noImage') {
            $('#paiement-form #noImage').show();
          } else {
            $('#submitFailed').show();
          }
        }
      });
    }
  };

  // Validate form
  var validateForm = function (validationNumber) {
    $('.error-message').hide();

    if (isNewBid) {
      if ($('#form-name').val() == '') {
        $('#mandatoryFields').show();
        $(window).scrollTop($('#form-name').offset().top - 40);
        return false;
      }

      else if ($('#form-image').val() == '') {
        $('#noImage').show();
        $(window).scrollTop($('#form-image').offset().top - 40);
        return false;
      }

      else if ($('#form-image')[0].files[0].size > 4000000) {
        $('#imageToBig').show();
        $(window).scrollTop($('#form-image').offset().top - 40);
        return false;
      }

      else if (Number($('#form-price').val(), 10) < Number($('.min-price').val(), 10)) {

        if (confirm('Attention votre enchère étant inférieure à l\'enchère actuelle la plus élevé vous ne prendrez donc pas la première place ! Votre enchère pourra toujours remonter plus tard dans le classement si une relance est effectuée par vous ou une autre personne.')) {
          return true;
        } else {
          return false;
        }

      }
    }

    if ($('#form-price').val() == '') {
      $('#missing-price').show();
      $(window).scrollTop($('#form-price').offset().top - 40);
      return false;
    }

    else if ((!$('#form-terms').prop('checked'))) {
      $('#missing-terms').show();
      $(window).scrollTop($('#missing-terms').offset().top - 40);
      return false;
    }

    else if ($('#form-card-name').val() === '' && validationNumber === 2) {
      $('#missing-card-name').show();
      $(window).scrollTop($('#missing-card-name').offset().top - 40);
      return false;
    }

    else if ($('#form-email').val() !== '' && validationNumber === 2) {
      if (!isValidEmailAddress($('#form-email').val())) {
        $('#wrong-email').show();
        $(window).scrollTop($('#wrong-email').offset().top - 40);
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  };

  function isValidEmailAddress(emailAddress) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
  };
});