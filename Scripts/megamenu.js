// Mega menu open/close + hover/accordion behavior.
// Re-created from AdaBiblePayload: src/components/MegaMenu/index.tsx
// (the `useMegaMenu`/`activeMenu` state and the onMouseEnter/onMouseLeave
// and mobile accordion click handlers), since that original is React state
// driven and has no build step here.
//
// This is the only nav/mega-menu script the theme loads. The old
// Scripts/AdaBible.js has been unlinked from Site.Master — it only ever
// targeted the legacy `.navbar-adabible` header markup (which is now
// commented out in Site.Master and never rendered), plus a dead
// `.MenuIcon--link` click handler for a button that no longer exists.
// None of it applied to the current `#menuButton`/`#megaMenu` markup, so
// there was nothing live left to carry forward into this file.
//
// Also toggles `.menuOpen` on `.header` itself (source: `.header.menuOpen`
// in Component.client.tsx/index.module.scss) — Styles/scss/header.scss
// gates the mobile-only `.mobileHeaderLinksRow` primary-nav-links row on
// this class, since the source only mounts that row when the mega menu is
// open on mobile and this static markup has no conditional mount to match.

(function () {
  var menuButton = document.getElementById('menuButton');
  var megaMenu = document.getElementById('megaMenu');
  var header = document.querySelector('.header');
  if (!menuButton || !megaMenu) return;

  var largeWrap = megaMenu.querySelector('[data-megamenu-largewrap]');
  // Every .parentItem in .largeWrap — not just the ones with children (i.e.
  // with a data-megamenu-parent group key), like Digital Bulletin — needs to
  // dim when a group is active, matching the source's `isInactive`/
  // `isInactiveMobileItem` (applied to every menu item regardless of type).
  var parentItems = megaMenu.querySelectorAll('[data-megamenu-largewrap] .parentItem');
  var defaultPanel = megaMenu.querySelector('[data-megamenu-default-panel]');
  var subNavWrap = megaMenu.querySelector('[data-megamenu-subnav-wrap]');
  var subNavPanels = megaMenu.querySelectorAll('[data-megamenu-subnav-panel]');

  var mobileParentButtons = megaMenu.querySelectorAll('[data-megamenu-mobile-toggle]');
  // Same as parentItems above, but for the mobile accordion: `.mobileParentItem`
  // (unlike `[data-megamenu-mobile-item]`) is on every mobile item, plain
  // links included, so Digital Bulletin collapses away too when a group opens.
  var mobileParentItems = megaMenu.querySelectorAll('.mobileParentItem');
  var mobileSubPanels = megaMenu.querySelectorAll('[data-megamenu-mobile-subpanel]');

  var isOpen = false;
  var activeMobileGroup = null;

  function setDesktopGroup(groupKey) {
    parentItems.forEach(function (item) {
      var key = item.getAttribute('data-megamenu-parent');
      var hasGroup = key !== null && key !== '';
      // Source: swaps this item's chevron for the mirrored icon while its
      // group is open (`isActiveGroup ? caretLeftSrc : caretRightSrc`);
      // megamenu.scss flips `.parentArrowIcon` with this class instead.
      item.classList.toggle('parentLinkActive', hasGroup && key === groupKey);
      if (groupKey === null) {
        item.classList.remove('parentLinkInactive');
        return;
      }
      if (!hasGroup) {
        item.classList.add('parentLinkInactive');
        return;
      }
      item.classList.toggle('parentLinkInactive', key !== groupKey);
    });

    if (defaultPanel) defaultPanel.classList.toggle('defaultPanelHidden', groupKey !== null);
    if (subNavWrap) subNavWrap.classList.toggle('subNavPanelWrapVisible', groupKey !== null);

    subNavPanels.forEach(function (panel) {
      var key = panel.getAttribute('data-megamenu-subnav-panel');
      panel.classList.toggle('subNavPanelActive', key === groupKey);
    });
  }

  function setMobileGroup(groupKey) {
    activeMobileGroup = groupKey;

    mobileParentItems.forEach(function (item) {
      var key = item.getAttribute('data-megamenu-mobile-item');
      var hasGroup = key !== null && key !== '';
      if (groupKey === null) {
        item.classList.remove('mobileParentItemInactive');
        return;
      }
      if (!hasGroup) {
        item.classList.add('mobileParentItemInactive');
        return;
      }
      item.classList.toggle('mobileParentItemInactive', key !== groupKey);
    });

    mobileParentButtons.forEach(function (button) {
      var key = button.getAttribute('data-megamenu-mobile-toggle');
      button.classList.toggle('mobileParentGroupButtonActive', key === groupKey);
      var arrow = button.querySelector('[data-megamenu-mobile-arrow]');
      if (arrow) arrow.classList.toggle('mobileParentLeftArrowVisible', key === groupKey);
    });

    mobileSubPanels.forEach(function (panel) {
      var key = panel.getAttribute('data-megamenu-mobile-subpanel');
      panel.classList.toggle('mobileSubNavPanelVisible', key === groupKey);
    });
  }

  function openMegaMenu() {
    isOpen = true;
    megaMenu.classList.add('open');
    megaMenu.setAttribute('aria-hidden', 'false');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.classList.add('menuOpen');
    if (header) header.classList.add('menuOpen');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closeMegaMenu() {
    isOpen = false;
    megaMenu.classList.remove('open');
    megaMenu.setAttribute('aria-hidden', 'true');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.classList.remove('menuOpen');
    if (header) header.classList.remove('menuOpen');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    setDesktopGroup(null);
    setMobileGroup(null);
  }

  menuButton.addEventListener('click', function () {
    if (isOpen) {
      closeMegaMenu();
    } else {
      openMegaMenu();
    }
  });

  // Desktop: hover a parent link to reveal its children; leaving the whole
  // two-column area resets back to the default right-hand panel.
  parentItems.forEach(function (item) {
    var key = item.getAttribute('data-megamenu-parent');
    if (!key) return;
    item.addEventListener('mouseenter', function () {
      setDesktopGroup(key);
    });
  });

  if (largeWrap) {
    largeWrap.addEventListener('mouseleave', function () {
      setDesktopGroup(null);
    });
  }

  // Mobile: tapping a parent group expands its children inline; tapping the
  // same one again (or its back arrow) collapses back to the full list.
  mobileParentButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.getAttribute('data-megamenu-mobile-toggle');
      setMobileGroup(activeMobileGroup === key ? null : key);
    });
  });
})();
