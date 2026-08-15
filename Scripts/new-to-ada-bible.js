// Interactivity for the New to Ada Bible page preview blocks:
// - DropdownInfoBlock FAQ accordion, re-created from AdaBiblePayload:
//   src/blocks/DropdownInfoBlock/Client.tsx (single-open `openIndex` state,
//   swaps the +/- icon per item).
// - ImageSliderBlock prev/next controls, re-created from:
//   src/blocks/ImageSliderBlock/Client.tsx (handlePrev/handleNext +
//   scrollIntoView, and the gradientPattern highlight following the
//   "active" slide).
// - ImageSliderBlock horizontal scrollbar, re-created from:
//   src/utilities/useHorizontalScrollbar.ts (thumb width/position tracks
//   real overflow of the slide list against the rail; drag-to-scroll and
//   click-track-to-jump use the same math as the source hook).

(function () {
  // ---- DropdownInfoBlock FAQ accordion ----
  document.querySelectorAll('.dropdownInfoBlock').forEach(function (block) {
    var items = block.querySelectorAll('.dropdownItem');

    items.forEach(function (item) {
      var button = item.querySelector('.dropdownLabel');
      var panel = item.querySelector('.dropdownPanel');
      if (!button || !panel) return;

      button.addEventListener('click', function () {
        var isOpen = item.classList.contains('open');

        items.forEach(function (otherItem) {
          if (otherItem === item) return;
          otherItem.classList.remove('open');
          var otherPanel = otherItem.querySelector('.dropdownPanel');
          var otherButton = otherItem.querySelector('.dropdownLabel');
          if (otherPanel) otherPanel.hidden = true;
          if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
        });

        item.classList.toggle('open', !isOpen);
        panel.hidden = isOpen;
        button.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  });

  // ---- ImageSliderBlock prev/next controls ----
  document.querySelectorAll('.imageSlider').forEach(function (slider) {
    var list = slider.querySelector('.imageArray');
    var prevBtn = slider.querySelector('[data-slider-prev]');
    var nextBtn = slider.querySelector('[data-slider-next]');
    if (!list) return;

    var slides = Array.prototype.slice.call(list.children);
    var activeIndex = 0;

    function setActive(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        var wrap = slide.querySelector('.slideWrap');
        var existingPattern = wrap ? wrap.querySelector('.gradientPattern') : null;

        if (i === activeIndex) {
          if (wrap && !existingPattern) {
            var pattern = document.createElement('div');
            pattern.className = 'gradientPattern left';
            pattern.style.width = '100%';
            pattern.style.height = '100%';
            pattern.style.overflow = 'hidden';
            pattern.style.opacity = '70%';
            pattern.innerHTML =
              '<div class="blackBg"></div><div class="stripePattern" style="mix-blend-mode:hard-light"></div>';
            wrap.insertBefore(pattern, wrap.firstChild);
          }
        } else if (existingPattern) {
          existingPattern.remove();
        }
      });
    }

    slides.forEach(function (slide, i) {
      slide.addEventListener('mouseenter', function () {
        setActive(i);
      });
      slide.addEventListener('focuscapture', function () {
        setActive(i);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        setActive(activeIndex - 1);
        slides[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        setActive(activeIndex + 1);
        slides[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      });
    }

    // ---- ImageSliderBlock horizontal scrollbar ----
    var rail = slider.querySelector('[data-slider-rail]');
    var track = slider.querySelector('[data-slider-track]');
    var thumb = slider.querySelector('[data-slider-thumb]');
    if (!rail || !track || !thumb) return;

    var MIN_THUMB_WIDTH = 60;
    var maxScrollLeft = 0;
    var maxThumbLeft = 0;
    var thumbWidth = 0;
    var dragState = null;

    function syncScrollbar() {
      var viewportWidth = list.clientWidth;
      var contentWidth = list.scrollWidth;
      var railWidth = rail.clientWidth;

      maxScrollLeft = Math.max(contentWidth - viewportWidth, 0);
      thumbWidth =
        contentWidth > 0 && railWidth > 0
          ? Math.min(Math.max((viewportWidth / contentWidth) * railWidth, MIN_THUMB_WIDTH), railWidth)
          : 0;
      maxThumbLeft = Math.max(railWidth - thumbWidth, 0);
      var shouldShow = maxScrollLeft > 0 && thumbWidth > 0 && railWidth > 0;

      rail.style.display = shouldShow ? '' : 'none';
      if (!shouldShow) return;

      var thumbLeft = maxScrollLeft > 0 ? (list.scrollLeft / maxScrollLeft) * maxThumbLeft : 0;
      thumb.style.width = thumbWidth + 'px';
      thumb.style.transform = 'translateX(' + thumbLeft + 'px)';
    }

    list.addEventListener('scroll', syncScrollbar, { passive: true });
    window.addEventListener('resize', syncScrollbar);
    syncScrollbar();

    track.addEventListener('pointerdown', function (event) {
      if (event.target === thumb) return;
      if (maxScrollLeft <= 0 || maxThumbLeft <= 0) return;

      var rect = track.getBoundingClientRect();
      var clickX = event.clientX - rect.left;
      var nextThumbLeft = Math.min(Math.max(clickX - thumbWidth / 2, 0), maxThumbLeft);
      list.scrollLeft = (nextThumbLeft / maxThumbLeft) * maxScrollLeft;
    });

    thumb.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      event.stopPropagation();
      dragState = { startX: event.clientX, startScrollLeft: list.scrollLeft };
      thumb.classList.add('scrollbarThumbDragging');
    });

    window.addEventListener('pointermove', function (event) {
      if (!dragState || maxScrollLeft <= 0 || maxThumbLeft <= 0) return;
      var deltaX = event.clientX - dragState.startX;
      var scrollPerPixel = maxScrollLeft / maxThumbLeft;
      list.scrollLeft = dragState.startScrollLeft + deltaX * scrollPerPixel;
    });

    function endDrag() {
      dragState = null;
      thumb.classList.remove('scrollbarThumbDragging');
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  });
})();
