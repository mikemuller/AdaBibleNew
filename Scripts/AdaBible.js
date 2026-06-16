var originalPos;
$(function () {
  $(document).on("scroll", function (e) {
    if ($(document).scrollTop() <= originalPos) {
      $(".navbar-adabible").addClass("show-fixed-header");
      $(".navbar-adabible").removeClass("remove-fixed-header");
    } else if ($(document).scrollTop() >= ($(".navbar-adabible").offset().top - $(".navbar-adabible").height())) {
      $(".navbar-adabible").removeClass("show-fixed-header");
      $(".navbar-adabible").addClass("remove-fixed-header");
    }


    originalPos = $(document).scrollTop();
  });

  $(".menu-toggle").on("click", function (e) { $('body').toggleClass("nav-shown"); });
  $('.mobile-menu .menu-item-has-children .sub-menu').collapse({ toggle: false }).addClass('collapse');
  $(".mobile-menu .menu-item-has-children > a").on("click", function (e) {
    //if ($(this).hasClass('active') == false) {
    e.preventDefault(); e.stopPropagation();
    //}
    $(this).parent().siblings('.active').children('.sub-menu').collapse('hide');
    $(this).parent().siblings('.active').toggleClass('active');
    $(this).parent().toggleClass('active');
    $(this).siblings('.sub-menu').collapse('toggle');
  });

  $('.navbar-adabible').affix({ offset: { top: $('#template_bgImage').height() } });
  $(".search input").keypress(function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      window.location.replace('https://adabible.org/?s=' + $(this).val());
    };
  });

  document.addEventListener('click', function (e) {
    var button = e.target.closest('.MenuIcon--link');
    if (!button) {
      return;
    }

    e.preventDefault();
    var menu = document.querySelector('.MegaMenu_megaMenu__QzrhR');
    if (menu) {
      menu.classList.toggle('MegaMenu_open');
    }
  });

});