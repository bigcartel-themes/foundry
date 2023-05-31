API.onError = function(errors) {
  var $errorList = $('<ul>', { class: 'errors'} )
    , $cartError = $('.cart_form')
    , $productError = $('.product-form');
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
      if (!$('.mini_cart').hasClass('visible')) {
        $('.mini_cart').addClass('visible')
      }
    }
  });
}

$(function() {
  if ($('.page-home').length) {
    var home_items = $('.page-home').children().length;
    if (home_items == 0) {
      $('.page-home').addClass('home-empty')
    }
  }
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
            $('.welcome_text').addClass('fade_out');
          }
          else {
            $('.welcome_text').removeClass('fade_out');
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

  $('body').on('keydown','.qty_holder input', function(e) {
    if (e.keyCode == 13) {
      item_id = $(this).parent().data("cart-id");
      new_val = $(this).val();
      input = $(this);
      Cart.updateItem(item_id, new_val, function(cart) {
        processUpdate(input, item_id, new_val, cart);
      });
      e.preventDefault();
      return false;
    }
  })

  $('.open_search_btn').click(function(e) {
    $('body').addClass('overlay_open');
    $('.overlay').addClass('open search');
    $('#search').focus();
  });

  $('.open_menu_btn').click(function(e) {
    $('body').addClass('overlay_open');
    $('.overlay').addClass('open navigation');
  });

  $('.open_cart_btn').click(function(e) {
    e.preventDefault();
    $('.mini_cart').toggleClass('visible');
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
});
$(document).on('keyup',function(e) {
  if (e.keyCode == 27) {
    $('body').removeClass('overlay_open');
    $('.overlay').removeClass('open').removeClass('navigation search');
    if ($(".mini_cart").hasClass('visible')) {
      $('.mini_cart').removeClass('visible')
    }
  }
});
$(document).click(function(e) {
  var container = $(".mini_cart");
  if (container.hasClass('visible')) {
    if (!$('.add-to-cart-button').is(e.target) && !$('.status_text').is(e.target) && !$('.open_cart_btn').is(e.target) && !container.is(e.target) && container.has(e.target).length === 0) {
      $('.mini_cart').removeClass('visible')
    }
  }
});

$(document).ready(function() {
  $('body').removeClass('loading');
});
$(window).on("load resize", function() {
  $('body').css('margin-bottom', $('.footer').outerHeight());
});
var isGreaterThanZero = function(currentValue) {
  return currentValue > 0;
}

function arrayContainsArray(superset, subset) {
  if (0 === subset.length) {
    return false;
  }
  return subset.every(function (value) {
    return (superset.indexOf(value) >= 0);
  });
}

function unique(item, index, array) {
  return array.indexOf(item) == index;
}

function cartesianProduct(a) {
  var i, j, l, m, a1, o = [];
  if (!a || a.length == 0) return a;
  a1 = a.splice(0, 1)[0];
  a = cartesianProduct(a);
  for (i = 0, l = a1.length; i < l; i++) {
    if (a && a.length) for (j = 0, m = a.length; j < m; j++)
      o.push([a1[i]].concat(a[j]));
    else
      o.push([a1[i]]);
  }
  return o;
}

Array.prototype.equals = function (array) {
  if (!array)
    return false;
  if (this.length != array.length)
    return false;
  for (var i = 0, l=this.length; i < l; i++) {
    if (this[i] instanceof Array && array[i] instanceof Array) {
      if (!this[i].equals(array[i]))
        return false;
    }
    else if (this[i] != array[i]) {
      return false;
    }
  }
  return true;
}

// From https://github.com/kevlatus/polyfill-array-includes/blob/master/array-includes.js
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function (searchElement, fromIndex) {
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }
      var o = Object(this);
      var len = o.length >>> 0;
      if (len === 0) {
        return false;
      }
      var n = fromIndex | 0;
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      function sameValueZero(x, y) {
        return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
      }
      while (k < len) {
        if (sameValueZero(o[k], searchElement)) {
          return true;
        }
        k++;
      }
      return false;
    }
  });
}

Array.prototype.count = function(filterMethod) {
  return this.reduce((count, item) => filterMethod(item)? count + 1 : count, 0);
}

$('.product_option_select').on('change',function() {
  var option_price = $(this).find("option:selected").attr("data-price");
  enableAddButton(option_price);
});
function enableAddButton(updated_price) {
  var addButton = $('.add-to-cart-button');
  var addButtonTextElement = addButton.find('.status_text');
  var addButtonTitle = addButton.attr('data-add-title');
  addButton.attr("disabled",false);
  if (updated_price) {
    priceTitle = ' - ' + Format.money(updated_price, true, true);
  }
  else {
    priceTitle = '';
  }
  addButtonTextElement.html(addButtonTitle + priceTitle);
}

function disableAddButton(type) {
  var addButton = $('.add-to-cart-button');
  var addButtonTextElement = addButton.find('.status_text');
  var addButtonTitle = addButton.attr('data-add-title');
  if (type == "sold-out") {
    var addButtonTitle = addButton.attr('data-sold-title');
  }
  if (!addButton.is(":disabled")) {
    addButton.attr("disabled","disabled");
  }
  addButtonTextElement.html(addButtonTitle);
}

function enableSelectOption(select_option) {
  select_option.removeAttr("disabled");
  select_option.text(select_option.attr("data-name"));
  select_option.removeAttr("disabled-type");
  if ((select_option.parent().is('span'))) {
    select_option.unwrap();
  }
}
function disableSelectOption(select_option, type) {
  if (type === "sold-out") {
    disabled_text = select_option.parent().attr("data-sold-text");
    disabled_type = "sold-out";
    if (show_sold_out_product_options === 'false') {
      hide_option = true;
    }
    else {
      hide_option = false;
    }
  }
  if (type === "unavailable") {
    disabled_text = select_option.parent().attr("data-unavailable-text");
    disabled_type = "unavailable";
    hide_option = true;
  }
  if (select_option.val() > 0) {
    var name = select_option.attr("data-name");
    select_option.attr("disabled",true);
    select_option.text(name + ' ' + disabled_text);
    select_option.attr("disabled-type",disabled_type);
    if (hide_option === true) {
      if (!(select_option.parent().is('span'))) {
        select_option.wrap('<span>');
      }
    }
  }
}
