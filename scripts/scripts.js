import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

const LANGUAGES = new Set(['en', 'ms']);
export const CATEGORY_STORIES = 'story';
export const CATEGORY_PRODUCT = 'product';
export const CATEGORY_RECIPES = 'recipe';

let language;

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

function GenerateBackGroundImages() {
  this.addImageSource = (src, alt = '', eager = false, breakpoints = [{ media: '(min-width: 600px)', width: '1920' }, { width: '1023' }]) => {
    if (breakpoints.length && src.length) {
      const picture = document.createElement('picture');
      const sourceElements = breakpoints.map((mediaPoints, index) => {
        const { pathname } = new URL(src[index], window.location.href);
        return `<source type='image/webp' ${mediaPoints.media ? `media='${mediaPoints.media}'` : ''} srcset='${pathname}?width=${mediaPoints.width}&format=webply&optimize=medium'>`;
      });

      const defaultIndex = 0;
      const srcUrl = new URL(src[defaultIndex], window.location.href);
      const sourcePathname = srcUrl?.pathname;
      const ext = sourcePathname.substring(sourcePathname.lastIndexOf('.') + 1);
      const fallbackSource = `<source ${breakpoints[defaultIndex].media ? `media='${breakpoints[defaultIndex].media}'` : ''} 
                                      srcset='${sourcePathname}?width=${breakpoints[defaultIndex].width}&format=${ext}&optimize=medium'>`;
      sourceElements.push(fallbackSource);

      const defaultSrcIndex = breakpoints.length - 1;
      const source = src[defaultSrcIndex] ? src[defaultSrcIndex] : src[0];
      const imgUrl = new URL(source, window.location.href);
      const imgPathname = imgUrl?.pathname;
      const imgSrc = `<img src='${imgPathname}?width=${breakpoints[defaultSrcIndex].width}&format=${ext}&optimize=medium'
                      alt='${alt}'
                      width='${breakpoints[defaultSrcIndex].width}'
                      height='100%'
                      loading='${eager ? 'eager' : 'lazy'}'>
                    `;
      sourceElements.push(imgSrc);

      const combinedElements = sourceElements.join('');
      picture.innerHTML = combinedElements;
      return picture;
    }
    return false;
  };

  this.render = (banner) => {
    banner.forEach((elem) => {
      const desktopBg = elem.dataset.backgroundDesktop;
      const mobileBg = elem.dataset.backgroundMobile;
      if (desktopBg && mobileBg) {
        const responsiveImages = this.addImageSource([desktopBg, mobileBg], '', true, [{ media: '(min-width: 600px)', width: '1920' }, { width: '700' }]);
        elem.append(responsiveImages);
      } else {
        elem.style.background = desktopBg || mobileBg;
      }
    });
  };

  this.init = () => {
    const main = document.querySelector('main');
    const banner = main.querySelectorAll('.full-width-banner');
    if (banner) {
      this.render(banner);
    }
  };
}

/**
 * Fetch filtered search results
 * @param {*} cat The category filter
 *   CATEGORY_STORIES, CATEGORY_PRODUCT, CATEGORY_RECIPES
 * @returns List of search results
 */
export async function fetchSearch(category = '') {
  window.searchData = window.searchData || {};
  if (Object.keys(window.searchData).length === 0) {
    const path = '/query-index.json?limit=500&offset=0';

    const resp = await fetch(path);
    window.searchData = JSON.parse(await resp.text()).data;

    window.searchData = window.searchData.filter((el) => el.language === getLanguage());
  }

  if (category !== '') {
    return window.searchData.filter((el) => el.category === category);
  }

  return window.searchData;
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
  // buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);

  (new GenerateBackGroundImages()).init();
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

export function debounce(func, delay) {
  let timeoutId;
  return function() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(func, delay);
  };
}

loadPage();
