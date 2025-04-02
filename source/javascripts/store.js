"use strict";

document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.remove("preloader");
  let contactFields = document.querySelectorAll(".contact-form input, .contact-form textarea");
  contactFields.forEach(function (contactField) {
    contactField.removeAttribute("tabindex");
  });
  const numShades = 5;

  let cssProperties = [];

  for (const themeColor in themeColors) {
    const hexValue = themeColors[themeColor];
    var hsl = tinycolor(hexValue).toHsl();
    for (var i = numShades - 1; i >= 0; i -= 1) {
      hsl.l = (i + 0.5) / numShades;
      cssProperties.push(`--${camelCaseToDash(themeColor)}-${((i * 100) / 1000) * 200}: ${tinycolor(hsl).toRgbString()};`);
    }
    numColor = tinycolor(hexValue).toRgb();
    cssProperties.push(`--${camelCaseToDash(themeColor)}-rgb: ${numColor["r"]}, ${numColor["g"]}, ${numColor["b"]};`);
  }

  const headTag = document.getElementsByTagName("head")[0];
  const styleTag = document.createElement("style");

  styleTag.innerHTML = `
    :root {
      ${cssProperties.join("\n")}
    }
  `;
  headTag.appendChild(styleTag);
});

window.addEventListener("load", () => {
  document.body.classList.remove("transition-preloader");
  setDocHeight();
  setHeaderPosition();
  resizeHomeWelcome();
  animateHomeElements();
  $(".welcome-image-bg").css("opacity", "1");
});

window.addEventListener("resize", () => {
  setDocHeight();
  resizeHomeWelcome();
});

window.addEventListener("scroll", () => {
  animateHomeElements();
  setHeaderPosition();
});

function setHeaderPosition() {
  let header_nav_height = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
  let annMessageHeight = $(".announcement-message.visible").outerHeight() > 0 ? $(".announcement-message.visible").outerHeight() : 0;
  if ($(window).scrollTop() >= annMessageHeight) {
    $("header").addClass("fixed");
    $("body").css("padding-top", header_nav_height);
  } else {
    $("header").removeClass("fixed");
    $("body").css("padding-top", 0);
  }
}

function resizeHomeWelcome() {
  let announceDiv = document.querySelector(".announcement-message");
  let welcomeContainer = document.querySelector(".welcome-image");
  if (announceDiv && welcomeContainer) {
    $(".welcome-image").css("height", "calc(100svh - " + announceDiv.offsetHeight + "px)");
  }
}

function setDocHeight() {
  win_height = window.innerHeight;
  document.documentElement.style.setProperty("--vh", win_height / 100 + "px");
}

function animateHomeElements() {
  const featured = document.querySelector(".welcome-text");
  const content_container = document.querySelector("#main");
  const contentRec = content_container.getBoundingClientRect();
  if (featured) {
    const featuredRect = featured.getBoundingClientRect();
    if (featuredRect.top <= 90) {
      featured.classList.add("fade_out")
    } else {
      featured.classList.remove("fade_out")
    }
  }
  if (contentRec.top <= 90) {
    $("header").addClass("is-scrolled");
  } else {
    $("header").removeClass("is-scrolled");
  }
}

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

document.addEventListener("DOMContentLoaded", function () {
  const isHomePage = document.body.getAttribute('data-bc-page-type') === 'home';
  if (isHomePage) {
    const welcomeButton = document.querySelector(".welcome-button");
    if (welcomeButton) {
      welcomeButton.addEventListener("click", function (event) {
        if (themeOptions.welcomeButtonBehavior === "scroll") {
          event.preventDefault();
          const targetElement = document.querySelector("#main");
          if (targetElement) {
            smoothScroll(targetElement, 1000);
          }
        }
      });
    }

    const featuredCategoriesContainerSelector = '.category-list';
    const featuredCategoriesContainer = document.querySelector(featuredCategoriesContainerSelector);
    const categoryCollagesEnabled = featuredCategoriesContainer?.dataset.categoryCollagesEnabled === 'true';

    if (categoryCollagesEnabled) {
      setupCategoryCollages({ 
        collage: { 
          width: 720, 
          height: 720 
        } 
      });
    }
  }
});