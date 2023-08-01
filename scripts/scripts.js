import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

import createModal from './modal.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

const LANGUAGES = new Set(['en', 'ms']);

let language;

export function isMobile() {
  const width = (window.innerWidth > 0) ? window.innerWidth : window.screen.width;
  if (width < 600) {
    return true;
  }

  return false;
}

export function getLanguageFromPath(pathname, resetCache = false) {
  if (resetCache) {
    language = undefined;
  }

  if (language !== undefined) return language;

  const segs = pathname.split('/');
  if (segs.length > 1) {
    const l = segs[1];
    if (LANGUAGES.has(l)) {
      language = l;
    }
  }

  if (language === undefined) {
    language = 'en'; // default to English
  }

  return language;
}

export function getLanguage(curPath = window.location.pathname, resetCache = false) {
  return getLanguageFromPath(curPath, resetCache);
}

/**
 * Reducing image size to custom Reduced size
 * @param {*} row
 */
export function adjustImageSize(img, newSize) {
  if (img) {
    const url = new URL(`${window.location.origin}${img}`);
    const params = url.searchParams;
    params.set('width', newSize);

    url.search = params.toString();
    return url.toString();
  }
  return img;
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
function buildAutoBlocks(main) {
  try {
    //buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}
*/
export function decorateLinkedPictures(container) {
  [...container.querySelectorAll('picture + br + a')]
    .filter((a) => {
      try {
        // ignore domain in comparison
        return new URL(a.href).pathname;
      } catch (e) {
        return false;
      }
    })
    .forEach((a) => {
      const picture = a.previousElementSibling.previousElementSibling;
      picture.remove();
      const br = a.previousElementSibling;
      br.remove();
      const txt = a.innerHTML;
      a.innerHTML = picture.outerHTML;
      a.setAttribute('aria-label', txt);
      a.setAttribute('title', txt);
    });
}

/* function selectLanguage() {
  const selected = document.querySelector('input[name="language"]:checked');
  const paths = window.location.pathname.split('/');
  paths[1] = selected.value.substring(1);
  window.location.pathname = paths.join('/');
  return false;
} */

function createModalContent(languages) {
  return `
    <div class="container">
      <h3 class="title-inline-large title-popup">
      Choose a &nbsp;
      <span>language</span>
    </h3>
    </div>
    <div class="country-wrapper">
      <div class="country-list">
        <p class="region"></p>
        <div class="country-item">
          ${[...languages].map((lang) => `
          <a href="/${lang}" target="_blank" title="Malaysia (${lang})">
            <img class="flag-icon" src="" alt="Malaysia (${lang})">
            <span class="flag-name">Malaysia (${lang})</span>
          </a>            
        `).join('')}
        </div>
      </div>
    </div>
    <div class="bottom-popup">
      <button class="back-to-country" data-close-popup="">
        <img class="flag-icon" src="" alt="Malaysia (${language})" data-flag="">
        <span class="btn-back-to">Back to&nbsp;</span>
        <span class="flag-name" data-title-country="">Malaysia (${language})</span>
      </button>
    </div>
  `;
}

// eslint-disable-next-line import/prefer-default-export
export async function showLanguageSelector() {
  // const languagesPromise = await fetch('/languages.json')
  // .then((resp) => resp.json()).then((resp) => resp.data);
  // const placeholdersPromise = await fetchPlaceholders(`/${getLanguage()}`);

  // const placeholders = await Promise.all(placeholdersPromise);

  const dialogElement = createModal(
    'my-button-class',
    () => createModalContent(LANGUAGES),
    () => {
      /* document.querySelectorAll('#language-form input').forEach((input) => {
        input.addEventListener('click', () => {
          // open a new tab with selected language
        });
      }); */

      /* document.querySelector('#language-form').addEventListener('click', (e) => {
        e.preventDefault();
        // open a new tab with selected language

        // return selectLanguage();
      }); */

      /* document.querySelector('#language-form').addEventListener('submit', (e) => {
        e.preventDefault();
        return selectLanguage();
      }); */

      document.querySelector('.back-to-country').addEventListener('click', () => {
        dialogElement.close();
      });
    },
  );

  decorateIcons(dialogElement);

  dialogElement.showModal();
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateLinkedPictures(main);
  decorateButtons(main);
  decorateIcons(main);
  // buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
