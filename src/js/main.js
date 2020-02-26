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

  let desToMobBp = window.matchMedia('(min-width: 1280px)');

  function swiperResponsive(options) {
    let breakpoint = window.matchMedia(options.mediaQ);
    let mySwiper;

    function breakpointChecker() {
      if (breakpoint.matches === true) {
        if (mySwiper !== undefined) {
          mySwiper.destroy(true, true);
        }
        if (options.desctopOptions) {
          mySwiper = new Swiper(options.swiperContainer, options.desctopOptions);
        }
      } else {
        if (mySwiper !== undefined) {
          mySwiper.destroy(true, true);
        }
        if (options.mobileOptions) {
          mySwiper = new Swiper(options.swiperContainer, options.mobileOptions);
        }
      }
    }

    breakpoint.addListener(breakpointChecker);
    breakpointChecker();

    return mySwiper;
  }

  /*
  Продуктовый слайдер десктоп
   */
  $('.sec-food-menu__desctop-menu .swiper-container').each((index, item) => {
    swiperResponsive({
      mediaQ: '(min-width: 1280px)',
      swiperContainer: item,
      desctopOptions : {
        speed: 600,
        slidesPerView: 'auto',
        centeredSlides: true,
        loopedSlides: 10,
        loop: true,
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        autoplay: {
          delay: 3000,
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          type: 'bullets',
        },
      },
      mobileOptions: false
    });
  });
  /*
   Продуктовый слайдер мобилка
   */
  function prodSliderMobile() {
    if (desToMobBp.matches === false) {
      let mobMenuNavLine = $('.sec-food-menu__mobile-menu-line');
      let mobMenuNav = swiperResponsive({
        mediaQ: '(min-width: 1280px)',
        swiperContainer: '.sec-food-menu__mobile-menu-nav',
        desctopOptions : false,
        mobileOptions: {
          slidesPerView: 'auto',
          centeredSlides: true,
          spaceBetween: 20,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          on: {
            init: function () {
              mobMenuNavLine.width(this.slides[0].offsetWidth);
            },
            slideChange: function () {
              mobMenuNavLine.width(this.slides[this.activeIndex].offsetWidth);
            },
            tap: function () {
              if (this.clickedIndex !== undefined) {
                this.slideTo(this.clickedIndex);
              }
            },
          }
        }
      });

      let mobMenuSlider = swiperResponsive({
        mediaQ: '(min-width: 1280px)',
        swiperContainer: '.sec-food-menu__mobile-menu-slider',
        desctopOptions : false,
        mobileOptions: {
          slidesPerView: 'auto',
        }
      });

      let menuSections = [];
      let menuSectionsIndexes = [];
      $('.sec-food-menu__mobile-menu-nav > .swiper-wrapper > .swiper-slide').each((index, item) => {
        menuSections.push($(item).attr('data-menuSection'));
      });
      for (let j = 0; j < menuSections.length; j++) {
        for (let i = 0; i < mobMenuSlider.slides.length; i++) {
          if ($(mobMenuSlider.slides[i]).find('.sec-food-menu__menu-item--' + menuSections[j]).length !== 0) {
            menuSectionsIndexes.push(i);
            break;
          }
        }
      }

      let crt = true;
      mobMenuNav.on('slideChange', function () {
        if (crt) {
          mobMenuSlider.slideTo(menuSectionsIndexes[this.activeIndex]);
        } else {
          crt = true;
        }
      });

      mobMenuSlider.on('slideChange', function () {
        let numOfSec = menuSectionsIndexes.length;
        for (let i = 0; i < numOfSec; i++) {
          if (menuSectionsIndexes[i] > this.activeIndex) {
            if (mobMenuNav.activeIndex !== i - 1) {
              crt = false;
              mobMenuNav.slideTo(i - 1);
            }
            return;
          }
        }
        if (menuSectionsIndexes[numOfSec - 1] <= this.activeIndex && mobMenuNav.activeIndex !== numOfSec - 1) {
          mobMenuNav.slideTo(numOfSec - 1);
          return;
        }
      });
    }
  }
  prodSliderMobile();
  desToMobBp.addListener(prodSliderMobile);

  let bannerSlider = swiperResponsive({
    mediaQ: '(min-width: 1280px)',
    swiperContainer: '.sec-food-menu__banners',
    desctopOptions : {
      speed: 600,
      slidesPerView: 'auto',
      centeredSlides: true,
      loopedSlides: 10,
      loop: true,
      effect: 'fade',
      fadeEffect: {
        crossFade: true
      },
      autoplay: {
        delay: 3000,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        type: 'bullets',
      },
    },
    mobileOptions: {
      slidesPerView: 'auto',
      centeredSlides: true,
      loopedSlides: 10,
      loop: true,
    }
  });

  let secMenu = $('.sec-food-menu');
  let secNews = $('.sec-news');
  let secWrapper = $('.sec-news__wrapper');
  let scrollSpy = debounce(function() {
    let scrolled = jqWindow.scrollTop();
    let secMenuPos = secMenu.offset().top - jqWindow.height();
    if (scrolled > secMenu.offset().top && scrolled < secMenuPos + secMenu.height()) {
      secWrapper.scrollTop((secNews.height() - secMenu.height()) / (secNews.height() - jqWindow.height()) * (scrolled - secMenuPos - jqWindow.height()));
    } else if (scrolled < secMenu.offset().top) {
      secWrapper.scrollTop(0);
    } else if (scrolled > secMenuPos + secMenu.height()) {
      secWrapper.scrollTop(secNews.height() - secMenu.height());
    }
  },
  100,
  {
    maxWait: 100,
  });
  function initAscycScroll() {
    if (desToMobBp.matches === true) {
      setTimeout(function () {
        if (secNews.height() < secMenu.height()) {
          return;
        }
        jqWindow.on('scroll', scrollSpy);
        secWrapper.height(secMenu.height());
      }, 2000);
    } else {
      secWrapper.scrollTop(0);
      secWrapper.height('');
      jqWindow.off('scroll', scrollSpy);
    }
  }
  initAscycScroll();
  desToMobBp.addListener(initAscycScroll);

  let partnersSlider = new Swiper('.sec-partners__partners-slider', {
    slidesPerView: 'auto',
    freeMode: true,
    loopedSlides: 10,
    loop: true,
    longSwipes: false,
    slidesPerGroup: 7,
  });
  let suppliersSlider = new Swiper('.sec-partners__suppliers-slider', {
    slidesPerView: 'auto',
    freeMode: true,
    loopedSlides: 10,
    loop: true,
    longSwipes: false,
    slidesPerGroup: 7,
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