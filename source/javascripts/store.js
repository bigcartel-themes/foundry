API.onError = function(errors) {
  var $errorList = $('<ul>', { class: 'errors'} )
    , $cartError = $('.cart_form')
    , $productError = $('.product_form');

  $.each(errors, function(index, error) {
    $errorList.append($('<li>').html(error));
  });

  if ($cartError.length > 0) {
    $cartError.find('.errors').remove();
    $cartError.prepend($errorList);
    $("html, body").animate({ scrollTop: 0 }, "fast");
  } else if ($productError.length > 0) {
    $productError.find('.errors').hide();
    $productError.prepend($errorList);
  }
}
var processUpdate = function(input, item_id, new_val, cart) {
  var sub_total = Format.money(cart.total, true, true);
  var item_count = cart.item_count;
  if (item_count == 0) { 
    $('.cart_form').slideUp('fast',function() { 
      $('.cart_empty_message').fadeIn('fast');
      $('h1').html('Your bag is empty');
      $('.cart_value').fadeOut('fast');
      $('.cart_value').html('0');
      $("html, body").animate({ scrollTop: 0 }, "fast");
    });
  }
  else {
    $('.errors').hide(); 
    if ($('.cart_shipping_amount').length) { 
      if (cart.shipping.pending) {
        if (cart.country) { 
          var shipping_amount = 'Shipping: <span class="small_message">Select another country</span>';
        }
        else { 
          var shipping_amount = 'Shipping: <span class="small_message">Select country</span>';
        }
      }
      else { 
        var shipping_amount = 'Shipping: <span>'+Format.money(cart.shipping && cart.shipping.amount ? cart.shipping.amount : 0, true, true)+'</span>';
      }
      $('.cart_shipping_amount').html(shipping_amount);
    }
    $('.cart_info h3 > span').html(sub_total);
    $('.cart_value').fadeIn('fast');
    $('.cart_value').html(item_count);
    input.val(new_val);
  }
  if (new_val > 0) { 
    
  }
  else { 
    $('.cart_item[data-cart-id="'+item_id+'"]').slideUp('fast');
  }
  return false;
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
  $('[name="cart[shipping_country_id]"]').on('change',function() {
    $('.cart_form').submit();
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
    }
    else if (val > valMax) {
      var new_val = valMax;
    }
    if ($t.data('func') == 'plus') {
      if (val < valMax) {
        var new_val = val + 1;
      }
    }
    else {
      if (val > valMin) {
        var new_val = val - 1;
      }
    }
    
    if (new_val > 0) { 
      Cart.updateItem(item_id, new_val, function(cart) {
        processUpdate(input, item_id, new_val, cart);
      });
    }
    else { 
      Cart.removeItem(item_id, function(cart) {
        processUpdate(input, item_id, 0, cart);
      });
    }
  });
  
  if ($('.welcome_text').length) {
    var waypoint = new Waypoint({
      element: $('.welcome_text'),
      handler: function(direction) {
        var screenWidth = Waypoint.viewportWidth();
        if (screenWidth > 765) {
          if (direction === 'down') {
            $('.welcome_text').fadeOut('fast');
          }
          else {
            $('.welcome_text').fadeIn('fast');
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
        if ($('.welcome_image').length && screenWidth > 765) {
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
    var input = $(this);
    Cart.updateItem(item_id, new_val, function(cart) {
      processUpdate(input, item_id, new_val, cart);
    });
  });
  
  

  $('.open_menu a, .open_search a').click(function(e) {
    $('body').addClass('overlay_open');
    $('.overlay').addClass('open');
    return false;
  });
  
  $('.open_search a').click(function(e) {
    $('body').addClass('overlay_open'); 
    $('.overlay').addClass('search');
    $('#search').focus();
    return false;
  });
  
  $('.open_menu a').click(function(e) {
    $('body').addClass('overlay_open'); 
    $('.overlay').addClass('navigation');
    return false;
  });
  
  $('.open_cart a').click(function(e) { 
    $('.mini_cart').fadeToggle();
    return false;
  });
  
  $('.close_overlay').click(function(e) {
    $('.overlay').removeClass('open navigation search');
    $('body').removeClass('overlay_open');
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
      if ($('.errors').length) { 
        $('.errors').hide();
      }
      updateCart(cart);
    });
    setTimeout(function() {
      addText.clone().appendTo(addButton).html(addTextValue).hide();
      addButton.find('span').first().remove();
      addButton.find('span').first().fadeIn(400);
      addButton.blur();
    }, 900);
  });
  
  $('.social_facebook').click(function() { 
    $('.facebook_popup_holder').fadeToggle('fast');
    return false;
  });
  
  var num_cats = $('.featured_categories > li').length;
  if (num_cats > 0) {
    if (num_cats == 1) { $('.featured_categories').remove(); }
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
    $('body').removeClass('overlay_open');
    $('.overlay').removeClass('open').removeClass('navigation search');
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
  if (!$(event.target).closest('.social_facebook').length) {
    $('.facebook_popup_holder').fadeOut('fast');
  }
});
var inPreview = (/\/admin\/design/.test(top.location.pathname));
if (inPreview) { 
  var timeout_start = 1000;
} 
else { 
  timeout_start = 1;
}
var update_featured_categories = function() { 
  $('.featured_categories li').each(function() {
    var container = $(this).find('a');
    var image = $(this).find('img');
    var img = new Image();
    img.src = image.attr('src');
    img.onload = function() {
      container.css('height',container.width()+'px')
      image.centerImage();
    };
  }); 
}
$(document).ready(function() { 
  setTimeout(function() { 
    update_featured_categories(); 
  }, timeout_start);
});
$(window).on("load resize", function() {
  update_featured_categories();
  $('body').css('margin-bottom', $('footer').outerHeight());
});