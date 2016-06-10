API.onError = function(errors) {
  var $errorList = $('<ul>', { class: 'errors'} )
    , $cartErrorsLocation = $('#cart_form .header')
    , $productErrorsLocation = $('#product_form');

  $.each(errors, function(index, error) {
    $errorList.append($('<li>').html(error));
  });

  if ($cartErrorsLocation.length > 0) {
    $cartErrorsLocation.find('.errors').hide();
    $cartErrorsLocation.prepend($errorList);
    $('.cart-wrapper').scrollTop(0);
  } else if ($productErrorsLocation.length > 0) {
    $productErrorsLocation.find('.errors').hide();
    $productErrorsLocation.prepend($errorList);
  }
}

var updateCart = function(cart) {
  var item_count = cart.item_count;
  $('.value').html(item_count);
  var $container = $('.cart_holder');
  var window_width = $(window).width();
  $container.load("/cart?" + $.now() + " .min_cart", function() {
    if (window_width > 800) { 
      $('.mini_cart').fadeIn('fast');
    }
  });
}

$(function() {
  $('.cart_info').Stickyfill();
  $('.qty').click(function() {
    var $t = $(this)
    , input = $(this).parent().find('input')
    , val = parseInt(input.val())
    , valMax = 99
    , valMin = 1
    , item_id = $(this).data("cart-id");
    if(isNaN(val) || val < valMin) {
      input.val(valMin);
      return false;
    }
    else if (val > valMax) {
      input.val(valMax);
      return false;
    }
    if ($t.data('func') == 'plus') {
      if (val < valMax) {
        input.val(val + 1);
      }
    }
    else {
      if (val > valMin) {
        input.val(val - 1);
      }
    }
    Cart.updateItem(item_id, val, function(cart) {
      var sub_total = Format.money(cart.subtotal, true, true);
      var item_count = cart.item_count;
      $('.cart_info h3 > span').html(sub_total);
      $('.value').html(item_count);
    });
  });
  if ($('.welcome_text').length) {
    var waypoint = new Waypoint({
      element: $('.welcome_text'),
      handler: function(direction) {
        var screenWidth = Waypoint.viewportWidth();
        if (screenWidth > 800) {
          if (direction === 'down') {
            $('.welcome_text').animate({ opacity: 0 });
          }
          else {
            $('.welcome_text').animate({ opacity: 1 });
          }
        }
      },
      offset: 120 
    });
  }

  $('.open_menu a, .open_search a').click(function(e) {
    e.preventDefault();
    $('.overlay').fadeIn('fast');
    return false;
  });
  
  $('.open_search a').click(function() { 
    $('.overlay').addClass('search');
    $('#search').focus();
  });
  
  $('.open_menu a').click(function() { 
    $('.overlay').addClass('navigation');
  });
  
  $('.open_cart a').click(function(e) { 
    e.preventDefault();
    $('.mini_cart').fadeToggle();
    return false;
  });
  
  $('.close_overlay').click(function(e) { 
    e.preventDefault();
    $('.overlay').fadeOut('fast').removeClass('navigation search');
  });
  
  $('.product_form').submit(function(e) {
    e.preventDefault();
    var quantity = $(this).find("#quantity").val()
    , itemID = $(this).find("#option").val()
    , addButton = $(this).find('.add-to-cart')
    , addText = $(this).find('.status_text')
    , addTextValue = addText.html()
    , addedText = addButton.data('added-text')
    , addingText = addButton.data('adding-text');
    addText.html(addingText);
    Cart.addItem(itemID, quantity, function(cart) { 
      addText.html(addedText);
      if ($('.product_form .errors').length) { 
        $('.product_form .errors').hide();
      }
      setTimeout(function() {
        addText.html(addTextValue);
      }, 1100);
      $('.cart_holder').html('');
      updateCart(cart);
    });
    addButton.blur();
  });
});
$(document).keyup(function (e) {
  if (e.keyCode == 27) {
    $('.overlay').fadeOut('fast').removeClass('navigation search');
  }
});
$(document).click(function(e) {
  var container = $(".mini_cart");
  if (!container.is(e.target) && container.has(e.target).length === 0) {
    if (container.is(':visible')) {
      container.fadeOut();
    }
  }
});