// Sticky/hide-on-scroll header behavior, re-created from
// AdaBiblePayload: src/layout/Header/Component.client.tsx
// (the `desktopHeaderState`/`isMobileHeaderHidden` scroll-direction effects,
// the `useScrolled(3)` hook behind `isScrolled`, and the
// `--header-stack-height`/`--mobile-header-height` ResizeObservers).
//
// Desktop (>1024px): header sits absolute over the page at the top, with a
// transparent background. Scrolling down past 4px hides it (slides up);
// scrolling back up pins it as a fixed, solid bar. Below 4px it returns to
// its resting top-of-page transparent state.
// Mobile (<=1024px): header stays sticky at top:0, and only slides off-screen
// while scrolling down; scrolling up (or reaching the top) reveals it again.
// `isScrolled` (scrollY > 3px) is tracked independently of that show/hide
// direction and just controls background solidity.

(function () {
  var header = document.querySelector('.header');
  var headerChrome = document.querySelector('.headerChrome');
  var megaMenu = document.getElementById('megaMenu');
  if (!header || !headerChrome) return;

  var mobileQuery = window.matchMedia('(max-width: 1024px)');
  var lastScrollY = window.scrollY;
  var ticking = false;

  function updateStackHeight() {
    var height = Math.round(headerChrome.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-stack-height', height + 'px');
    header.style.setProperty('--mobile-header-height', height + 'px');
  }

  function setDesktopState(state) {
    header.classList.toggle('desktopHeaderSticky', state === 'sticky');
    header.classList.toggle('desktopHeaderHidden', state === 'hidden');
  }

  function setMobileHidden(hidden) {
    header.classList.toggle('mobileHidden', hidden);
  }

  function setScrolled(scrolled) {
    header.classList.toggle('isScrolled', scrolled);
  }

  function isMegaMenuOpen() {
    return Boolean(megaMenu && megaMenu.classList.contains('open'));
  }

  function updateOnScroll() {
    var currentScrollY = window.scrollY;
    var delta = currentScrollY - lastScrollY;

    setScrolled(currentScrollY > 3);

    if (mobileQuery.matches) {
      if (currentScrollY <= 4) {
        setMobileHidden(false);
      } else if (delta > 6) {
        setMobileHidden(true);
      } else if (delta < -4) {
        setMobileHidden(false);
      }
    } else if (currentScrollY <= 4) {
      setDesktopState('top');
    } else if (delta > 6) {
      setDesktopState('hidden');
    } else if (delta < -4) {
      setDesktopState('sticky');
    }

    lastScrollY = currentScrollY;
  }

  function handleScroll() {
    if (ticking || isMegaMenuOpen()) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateOnScroll();
      ticking = false;
    });
  }

  mobileQuery.addEventListener('change', function () {
    lastScrollY = window.scrollY;
    setDesktopState('top');
    setMobileHidden(false);
    setScrolled(window.scrollY > 3);
  });

  window.addEventListener('resize', updateStackHeight);
  window.addEventListener('scroll', handleScroll, { passive: true });

  updateStackHeight();
  setDesktopState(window.scrollY <= 4 ? 'top' : 'hidden');
  setScrolled(window.scrollY > 3);
})();
