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
  getMetadata,
  buildBlock,
  fetchPlaceholders,
  toClassName,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

const LANGUAGES = new Set(['en', 'ms']);
export const CATEGORY_STORIES = 'story';
export const CATEGORY_PRODUCT = 'product';
export const CATEGORY_RECIPES = 'recipe';
// eslint-disable-next-line max-len
export const BASE_URL = window.location.origin !== 'null' ? window.location.origin : window.parent.location.origin;

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
    let url;
    if (img.startsWith('/')) {
      url = new URL(`${BASE_URL}${img}`);
    } else {
      url = new URL(`${img}`);
    }
    const params = url.searchParams;

    if (params.has('width')) {
      params.set('width', newSize);
    } else {
      params.append('width', newSize);
    }

    url.search = params.toString();
    return url.toString();
  }
  return img;
}

/**
 * Remove image properties
 * @param {url}
 */
export function removeImageProps(url) {
  return url ? url.split('?')[0] : '';
}

/**
 * @param {Element} main
 */
function buildCarouselBlock(main) {
  const category = getMetadata('category');
  if (category === 'recipe' || category === 'product') {
    const section = document.createElement('div');
    section.append(buildBlock('carousel', { elems: [category] }));
    main.append(section);
  }
}

export function formPictureTag(pictureClass, mobileImgUrl, desktopImgUrl) {
  const picture = document.createElement('picture');
  picture.className = pictureClass;

  const sourceDesktop = document.createElement('source');
  sourceDesktop.media = '(min-width: 600px)';
  sourceDesktop.srcset = desktopImgUrl;
  sourceDesktop.type = 'image/webp';
  picture.appendChild(sourceDesktop);

  const img = document.createElement('img');
  img.src = mobileImgUrl;
  img.alt = '';
  img.width = '360';
  img.height = '264';
  picture.appendChild(img);
  return picture;
}

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
/**
 *
 * @returns {Promise<void>}
 */
export async function load404() {
  const placeholders = await fetchPlaceholders(`/${getLanguage()}`);

  const createBannerWrapper = () => `  
      <h1 id="title">${placeholders.error404BannerTitle}</h1>  
      <p>${placeholders.error404BannerDescription}</p>  
      <p class="button-container">  
        <a href="${placeholders.error404BannerButtonLink}" title="${placeholders.error404BannerButtonText}" class="button primary">${placeholders.error404BannerButtonText}</a>  
      </p>`;

  const createSectionWrapper = () => `  
      <h2>${placeholders.error404SectionTitle}</h2>  
      <p>${placeholders.error404SectionDescription}</p>  
      <p class="button-container">  
        <a href="${placeholders.error404SectionButtonLink}" title="${placeholders.error404SectionButtonText}" class="button primary">${placeholders.error404SectionButtonText}</a>  
      </p>`;

  const bannerWrapper = document.querySelector('main > div:nth-child(1) > div');
  const sectionWrapper = document.querySelector('main > div:nth-child(2) > div');

  if (bannerWrapper && placeholders) {
    bannerWrapper.innerHTML = createBannerWrapper();
  }
  if (sectionWrapper && placeholders) {
    sectionWrapper.innerHTML = createSectionWrapper();
  }
}

export function ProcessStoriesBgImage() {
  this.updateStoriesBgImage = async (params) => {
    const placeholder = await fetchPlaceholders();
    const storyContainer = document.querySelector('main');

    const createAndAppendPicture = (bgClass, bgConstant) => {
      if (document.querySelector(`.${bgClass}`)) document.querySelector(`.${bgClass}`).remove();
      return formPictureTag(bgClass, placeholder[`${bgConstant}Mobile`], placeholder[`${bgConstant}Desktop`]);
    };

    const topPicture = createAndAppendPicture(params.BG_TOP_CLASS, params.BG_TOP);
    storyContainer.insertBefore(topPicture, storyContainer.firstChild);

    const bottomPicture = createAndAppendPicture(params.BG_BOTTOM_CLASS, params.BG_BOTTOM);
    storyContainer.appendChild(bottomPicture);
  };
  this.init = () => {
    if (document.querySelector('body.story-tips')) {
      const bgConfigParams = {
        BG_TOP: 'storyTipsBgTop',
        BG_BOTTOM: 'storyTipsBgBottom',
        BG_TOP_CLASS: 'story-page-bg-top',
        BG_BOTTOM_CLASS: 'story-page-bg-bottom',
      };
      const boundAction = this.updateStoriesBgImage.bind(this, bgConfigParams);
      boundAction();
    }
  };
}
export function ProcessBottomBgImage() {
  this.updateBgImage = async (params) => {
    const placeholder = await fetchPlaceholders();
    const container = document.querySelector('main');
    if (container && placeholder[`${params.bgKey}Mobile`] && placeholder[`${params.bgKey}Desktop`]) {
      const pictureTag = formPictureTag(params.bgClass, placeholder[`${params.bgKey}Mobile`], placeholder[`${params.bgKey}Desktop`]);
      container.appendChild(pictureTag);
    }
  };
  this.init = () => {
    if (document.querySelector('main .product-category')) {
      const bgConfigParams = {
        bgKey: 'categoryBgBottom',
        bgClass: 'bottom-bg',
      };
      const boundAction = this.updateBgImage.bind(this, bgConfigParams);
      boundAction();
    }
  };
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
 * Push custom events to Google Tag manager
 * @param {*} data
 */
export async function pushToGTM(data) {
  // submit to datalayer
  const dataLayer = window.dataLayer || [];
  dataLayer.push(data);
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    decorateLinkedPictures(main);

    new ProcessStoriesBgImage().init();
    new ProcessBottomBgImage().init();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  buildAutoBlocks(main);
  buildCarouselBlock(main);
  decorateSections(main);
  decorateBlocks(main);
  (new GenerateBackGroundImages()).init();
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = getLanguage();
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

  const context = {
    getMetadata,
    toClassName,
  };
  // eslint-disable-next-line import/no-relative-packages
  const { initConversionTracking } = await import('../plugins/rum-conversion/src/index.js');
  await initConversionTracking.call(context, document);
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
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(func, delay);
  };
}

loadPage();
