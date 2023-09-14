import { getMetadata, fetchPlaceholders } from '../../scripts/lib-franklin.js';
import { getLanguage, decorateLinkedPictures, debounce } from '../../scripts/scripts.js';
import createModal from '../../scripts/modals/modal.js';
import Search from './search.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');
const currentUrl = new URL(window.location.href);
const searchParamName = 'search';

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections > ul > li').forEach((section) => {
    const subNav = section.querySelector('.sub-nav-list');
    if (subNav) {
      subNav.classList.remove('active');
      document.body.classList.remove('disable-page-scroll');
    }
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.setAttribute('aria-expanded', false);
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * To disable the page scroll
 */
function disablePageScroll() {
  document.body.classList.toggle('disable-page-scroll');
}

/**
 * Create a skip to main link
 */
function addSkipToMain() {
  const headerWrapper = document.querySelector('.header-wrapper');
  // create and insert skip link before header
  const skipLink = document.createElement('a');
  skipLink.href = '#main';
  skipLink.className = 'skip-link';
  skipLink.innerText = 'Skip to main content';
  document.body.insertBefore(skipLink, headerWrapper);
  // add id to main element to support skip link
  const main = document.querySelector('main');
  main.id = 'main';
}

/**
 * Create the Search Dialog
 * @param {nav}
 */

function createSearchDialog(nav, placeholders, searchValue) {
  const dialogId = 'search-dialog';
  const searchDialog = new Search();
  const searchDialogElement = createModal(
    dialogId,
    () => searchDialog.createSearchModal(nav, placeholders),
    () => {
      const dialogElem = document.querySelector(`#${dialogId}`);
      searchDialog.initSearchModal(dialogElem);
      const searchInput = dialogElem.querySelector('.search-input-field input');
      const debounceDelay = 500;
      const debouncedSearch = debounce(() => {
        const query = searchInput.value;
        if (query && query.length > 2) {
          searchDialog.performSearch(query);
        } else {
          searchDialog.clearSearchResults();
        }
      }, debounceDelay);

      searchInput.addEventListener('input', debouncedSearch);

      if (searchValue) {
        searchInput.value = searchValue;
        debouncedSearch();
      }

      dialogElem.querySelector('.close').addEventListener('click', () => {
        if (searchDialogElement.open) {
          currentUrl.searchParams.delete(searchParamName);
          /* eslint-disable no-restricted-globals */
          history.pushState(null, null, currentUrl.toString());
          searchInput.value = '';
          searchDialogElement.close();
          disablePageScroll();
          searchDialog.clearSearchResults();
        }
      });
    },
  );
  searchDialogElement.showModal();
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // fetch nav content
  const navMeta = getMetadata('nav');
  let navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  if (!navMeta) {
    navPath = getLanguage() === 'en' ? '/nav' : `/${getLanguage()}/nav`;
  }

  const resp = await fetch(`${navPath}.plain.html`);

  if (resp.ok) {
    const html = await resp.text();

    // decorate nav DOM
    const nav = document.createElement('nav');
    nav.id = 'nav';
    nav.innerHTML = html;

    // Handle links
    decorateLinkedPictures(nav);

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navSections = nav.querySelector('.nav-sections');

    if (navSections) {
      const currentPageURL = new URL(window.location.href);
      const pageCategory = currentPageURL.pathname.split('/')[2];

      navSections.querySelectorAll(':scope > ul > li').forEach((navSection) => {
        const sectionLink = navSection.querySelector('a');
        if (!sectionLink) return;

        const sectionURL = new URL(sectionLink.href);
        const linkCategory = sectionURL.pathname.split('/')[2];

        if (sectionURL.href === currentPageURL.href || pageCategory === linkCategory) {
          navSection.classList.add('active');
        }

        const subNav = navSection.querySelector('ul');
        if (subNav) {
          const backLink = document.createElement('li');
          backLink.classList.add('back-link');
          backLink.textContent = 'Back To Main Menu';
          subNav.prepend(backLink);
          subNav.outerHTML = `<div class="sub-nav-arrow"><span class="icon icon-arrow-right"></span></div><div class="sub-nav-list">${subNav.outerHTML}</div>`;
          navSection.classList.add('nav-drop');
        }

        const arrow = navSection.querySelector('.sub-nav-arrow');
        const subNavList = navSection.querySelector('.sub-nav-list');
        const backLink = navSection.querySelector('.back-link');

        if (arrow) {
          arrow.addEventListener('click', () => {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', !expanded ? 'true' : 'false');
            if (subNavList) {
              subNavList.classList.add('active');
              document.body.classList.add('disable-page-scroll');
            }
          });
        }

        if (backLink) {
          backLink.addEventListener('click', () => {
            if (subNavList) {
              subNavList.classList.remove('active');
              toggleAllNavSections(navSections);
            }
          });
        }

        const handleMouseAndFocus = () => {
          if (isDesktop.matches) {
            const expanded = navSection.getAttribute('aria-expanded') === 'true';
            toggleAllNavSections(navSections);
            navSection.setAttribute('aria-expanded', !expanded ? 'true' : 'false');
            if (subNavList) {
              subNavList.classList.add('active');
              document.body.classList.add('disable-page-scroll');
            }
          }
        };

        navSection.addEventListener('mouseover', handleMouseAndFocus);
        navSection.addEventListener('focus', handleMouseAndFocus);
      });
    }

    // hamburger for mobile
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
    nav.prepend(hamburger);
    nav.setAttribute('aria-expanded', 'false');
    // prevent mobile nav behavior on window resize
    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper';
    navWrapper.append(nav);
    block.append(navWrapper);

    // Search Implementation
    const navTools = nav.querySelector('.nav-tools');
    if (navTools) {
      const placeholders = await fetchPlaceholders(`/${getLanguage()}`);
      const searchParamValue = currentUrl.searchParams.get(searchParamName);
      if (searchParamValue) {
        disablePageScroll();
        createSearchDialog(nav, placeholders, searchParamValue);
      }

      const searchIcon = navTools.querySelector('.icon-search');
      const searchLabel = 'Search';
      searchIcon.outerHTML = `<a class="search-action" href="#" aria-label=${searchLabel}>${searchIcon.outerHTML}</a>`;
      navTools.querySelector('.search-action').addEventListener('click', (e) => {
        e.preventDefault();
        disablePageScroll();
        createSearchDialog(nav, placeholders);
      });
    }

    // cleanup empty markup
    navWrapper.previousElementSibling.remove();
  }

  // Add skip link
  addSkipToMain();
}
