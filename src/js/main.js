'use strict';

import Swiper from 'swiper';
import debounce from 'lodash/debounce';

$(document).ready(() => {
  let header = $('.header');
  let jqWindow = $(window);

  jqWindow.scroll(debounce(function() {
    let scrolled = jqWindow.scrollTop();
    if ( scrolled > 0 ) {
      header.addClass('header--active');
    } else {
      header.removeClass('header--active');
    }
  },
  300,
  {
    maxWait: 300,
  }));

  $('a[href^="#"]').click(function (e) {
    e.preventDefault();
    let id = $(this).attr('href');
    if (id !== '#') {
      let top = $(id).offset().top;
      $('html, body').animate({
        scrollTop: top
      }, 300);
    }
  });

  let partnersSlider = new Swiper('.sec-partners__partners-slider', {
    slidesPerView: 'auto',
    freeMode: true,
    loopedSlides: 10,
    loop: true,
  });
  let suppliersSlider = new Swiper('.sec-partners__suppliers-slider', {
    slidesPerView: 'auto',
    freeMode: true,
    loopedSlides: 10,
    loop: true,
  });
  let slidersWrapper = new Swiper('.sec-partners__sliders-wrapper', {
    slidesPerView: 1,
    allowTouchMove: false,
  });
  let curSlider = partnersSlider;
  let partnersBtn = $('.sec-partners__partners-btn');
  let suppliersBtn = $('.sec-partners__suppliers-btn');
  partnersBtn.click(() => {
    if (curSlider !== partnersSlider) {
      suppliersBtn.addClass('button--border--none');
      partnersBtn.removeClass('button--border--none');
      curSlider = partnersSlider;
      slidersWrapper.slideTo(0);
    }
  });
  suppliersBtn.click(() => {
    if (curSlider !== suppliersSlider) {
      partnersBtn.addClass('button--border--none');
      suppliersBtn.removeClass('button--border--none');
      curSlider = suppliersSlider;
      slidersWrapper.slideTo(1);
    }
  });
  $('.sec-partners__sliders .swiper-button-prev').click(() => {
    curSlider.slidePrev();
  });
  $('.sec-partners__sliders .swiper-button-next').click(() => {
    curSlider.slideNext();
  });

  $('.custom-select').each((index, item) => {
    let selectContainer = $(item);
    let curIndex = 0;
    let nativeOptions = selectContainer.find('select > option');
    let customOptions = selectContainer.find('.custom-select__options > .custom-select__option');
    let customSelected = selectContainer.find('.custom-select__selected');

    customSelected.click(() => {
      selectContainer.toggleClass('custom-select--active');
    });

    customOptions.each((index, item) => {
      $(item).click(() => {
        customOptions.eq(curIndex).removeClass('custom-select__option--selected');
        nativeOptions.eq(curIndex).removeAttr('selected');
        curIndex = index;
        customSelected.text(item.textContent);
        $(item).addClass('custom-select__option--selected');
        nativeOptions.eq(curIndex).attr('selected', '');
        selectContainer.removeClass('custom-select--active');
      });
    });
  });
});