
$(document).ready(() => {
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