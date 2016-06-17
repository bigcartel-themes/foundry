API.onError = function(errors) {
  var $errorList = $('<ul>', { class: 'errors'} )
    , $cartErrorsLocation = $('.cart_items')
    , $productErrorsLocation = $('.product_form');

  $.each(errors, function(index, error) {
    $errorList.append($('<li>').html(error));
  });

  if ($cartErrorsLocation.length > 0) {
    $cartErrorsLocation.find('.errors').hide();
    $(window).scrollTop()
    $cartErrorsLocation.prepend($errorList);
  } else if ($productErrorsLocation.length > 0) {
    $productErrorsLocation.find('.errors').hide();
    $productErrorsLocation.prepend($errorList).slideDown('fast');
  }
}

var updateCart = function(cart) {
  var item_count = cart.item_count;
  $('.cart_value').fadeIn('fast');
  $('.cart_value').html(item_count);
  $('.mini_cart').removeClass('empty');
  var $container = $('.cart_holder');
  var window_width = $(window).width();
  $container.load("/cart?" + $.now() + " .cart_holder > *", function() {
    if (window_width > 800) {
      if (!$('.mini_cart').is(':visible')) { 
        $('.mini_cart').fadeIn('fast');
      }
    }
  });
}

$(function() {
  $('.cart_info').Stickyfill();
  $('[name="cart[discount_code]"]').on('change',function() { 
    $(this).closest('.checkout_btn').attr('name','update');
    $('.cart_form').submit();
  });
  $('[name*="cart[update]"], [name="cart[shipping_country_id]"]').on('change',function() {
    $(this).closest('form').submit();
  });
  $('[name="cart[discount_code]"]').on('keyup',function(e) { 
    if (e.keyCode == 13) {
      e.preventDefault(); 
      $(this).closest('.checkout_btn').attr('name','update');
      $('.cart_form').submit();
    }
  });
  $('.cancel_discount').click(function(e) {
    e.preventDefault(); 
    $('.cart_form').append('<input name="cart[discount_code]" type="hidden" value="">');
    $('.cart_form').submit();
  });
  $('.category_select').change(function() { 
    document.location.href = $(this).val();
  })
  $('.qty').click(function() {
    var $t = $(this)
    , input = $(this).parent().find('input')
    , val = parseInt(input.val())
    , valMax = 99
    , valMin = 1
    , item_id = $(this).parent().data("cart-id");
    if(isNaN(val) || val < valMin) {
      var new_val = valMin;
      input.val(new_val);
      return false;
    }
    else if (val > valMax) {
      var new_val = valMax;
      input.val(new_val);
      return false;
    }
    if ($t.data('func') == 'plus') {
      if (val < valMax) {
        var new_val = val + 1;
        input.val(new_val);
      }
    }
    else {
      if (val > valMin) {
        var new_val = val - 1;
        input.val(new_val);
      }
    }
    Cart.updateItem(item_id, new_val, function(cart) {
      var sub_total = Format.money(cart.price, true, true);
      var item_count = cart.item_count;
      $('.cart_info h3 > span').html(sub_total);
      
      if (item_count == 0) { 
        document.location.href = '/cart';
      }
      $('.cart_value').fadeIn('fast');
      $('.cart_value').html(item_count);
    });
    if (new_val > 0) { 
      
    }
    else { 
      $('.cart_item[data-cart-id="'+item_id+'"]').slideUp('fast');
    }
    
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
  if ($('.content').length) { 
    var waypoint = new Waypoint({
      element: $('.content'),
      handler: function(direction) {
        var screenWidth = Waypoint.viewportWidth();
        if ($('.welcome_image').length && screenWidth > 800) {
          if (direction === 'down') {
            $('header').addClass('background_overlay');
          }
          else {
            $('header').removeClass('background_overlay');
          }
        }
      },
      offset: 88
    });
  }
  
  $('.qty_holder input').blur(function(e) {
    var item_id = $(this).parent().data("cart-id");
    var new_val = $(this).val();
    Cart.updateItem(item_id, new_val, function(cart) {
      var sub_total = Format.money(cart.subtotal, true, true);
      var item_count = cart.item_count;
      $('.cart_info h3 > span').html(sub_total);
      if (item_count == 0) { 
        document.location.href = '/cart';
      }
      else { 
        $('.cart_value').fadeIn('fast');
        $('.cart_value').html(item_count);
      }
    });
    if (new_val > 0) { 
      
    }
    else { 
      $('.cart_item[data-cart-id="'+item_id+'"]').hide();
    }
  });
  
  

  $('.open_menu a, .open_search a').click(function(e) {
    $('.overlay').fadeIn('fast');
    return false;
  });
  
  $('.open_search a').click(function(e) { 
    $('.overlay').addClass('search');
    $('#search').focus();
    return false;
  });
  
  $('.open_menu a').click(function(e) { 
    $('.overlay').addClass('navigation');
    return false;
  });
  
  $('.open_cart a').click(function(e) { 
    $('.mini_cart').fadeToggle();
    return false;
  });
  
  $('.close_overlay').click(function(e) {
    $('.overlay').fadeOut('fast').removeClass('navigation search');
  });
  
  $('.product_thumbnails li a').click(function(e) {
    e.preventDefault();
    $('.primary_image').attr('src',$(this).attr('href'));
    $('.product_thumbnails li').removeClass('active');
    $(this).parent().addClass('active'); 
    return false;
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
      }, 900);
      updateCart(cart);
    });
    addButton.blur();
  });

  var num_cats = $('.featured_categories > li').length;
  if (num_cats > 0) { 
    if (num_cats == 2) { $('.featured_categories').addClass('two_categories'); }
    if (num_cats == 3) { $('.featured_categories').addClass('three_categories'); }
    if (num_cats == 4) { $('.featured_categories').addClass('four_categories'); }
    if (num_cats == 5) { $('.featured_categories').addClass('five_categories'); }
    if (num_cats == 6) { $('.featured_categories').addClass('six_categories'); }
    if (num_cats == 7) { $('.featured_categories').addClass('seven_categories'); }
    if (num_cats == 8) { $('.featured_categories').addClass('eight_categories'); }
    if (num_cats == 9) { $('.featured_categories').addClass('nine_categories'); }
    if (num_cats == 10) { $('.featured_categories').addClass('ten_categories'); }
  }
});
$(document).on('keyup',function(e) {
  if (e.keyCode == 27) {
    $('.overlay').fadeOut('fast').removeClass('navigation search');
    if ($(".mini_cart").is(':visible')) { 
      $('.mini_cart').fadeOut();
    }
  }
});
$(document).click(function(e) {
  var container = $(".mini_cart");
  if (!$('.add-to-cart').is(e.target) && !$('.status_text').is(e.target) && !container.is(e.target) && container.has(e.target).length === 0) {
    if (container.is(':visible')) {
      container.fadeOut();
    }
  }
});