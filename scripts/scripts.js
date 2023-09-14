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
const SECTION_BG_MOBILE = 'bg-mobile';
const SECTION_BG_DESKTOP = 'bg-desktop';
const PRODUCT_IMG_MOBILE = 'product-mobile';
const PRODUCT_IMG_DESKTOP = 'product-desktop';

export function createPicture(props) {
  const desktopImgUrl = props[SECTION_BG_DESKTOP] || props[PRODUCT_IMG_DESKTOP];
  const mobileImgUrl = props[SECTION_BG_MOBILE] || props[PRODUCT_IMG_MOBILE];
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  const picture = document.createElement('picture');
  if (desktopImgUrl) {
    const sourceDesktop = document.createElement('source');
    const { pathname } = new URL(desktopImgUrl, window.location.href);
    sourceDesktop.type = 'image/webp';
    sourceDesktop.srcset = `${pathname}?width=1920&format=webply&optimize=medium`;
    sourceDesktop.media = '(min-width: 600px)';
    picture.appendChild(sourceDesktop);
  }

  if (mobileImgUrl) {
    const sourceMobile = document.createElement('source');
    const { pathname } = new URL(mobileImgUrl, window.location.href);
    sourceMobile.type = 'image/webp';
    sourceMobile.srcset = `${pathname}?width=600&format=webply&optimize=medium`;
    picture.appendChild(sourceMobile);
  }

  const img = document.createElement('img');
  const { pathname } = new URL(mobileImgUrl, window.location.href);
  img.src = `${pathname}?width=600&format=webply&optimize=medium`;
  img.alt = props.alt || '';
  img.loading = props.loading || 'lazy';
  img.width = isMobile ? '360' : '600';
  img.height = isMobile ? '298' : '620';

  if (mobileImgUrl && desktopImgUrl) {
    picture.appendChild(img);
  } else {
    return img;
  }
  return picture;
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
 * Changing passed image attribute to passed image attribute value
 * @param {*} row
 */
export function changeImageAttribute(img, imgAttr, imgAttrValue) {
  if (img) {
    let url;
    if (img.startsWith('/')) {
      url = new URL(`${BASE_URL}${img}`);
    } else {
      url = new URL(`${img}`);
    }
    const params = url.searchParams;

    if (params.has(imgAttr)) {
      params.set(imgAttr, imgAttrValue);
    } else {
      params.append(imgAttr, imgAttrValue);
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

// Build picture tag
export function createPictureTag(pictureClass, mobileImgUrl, desktopImgUrl) {
  const picture = document.createElement('picture');
  picture.className = `${pictureClass} bg-img`;

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
  img.style.display = 'none';
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
/**
 * Creating top and bottom background images
 */
export function CreateBgImage() {
  this.updateBgImage = async (params) => {
    const placeholder = await fetchPlaceholders();
    const storyContainer = document.querySelector('main');

    const createAndAppendPicture = (bgClass, bgConstant) => {
      if (document.querySelector(`.${bgClass}`)) document.querySelector(`.${bgClass}`).remove();
      return createPictureTag(bgClass, placeholder[`${bgConstant}Mobile`], placeholder[`${bgConstant}Desktop`]);
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
        BG_BOTTOM_CLASS: 'bottom-bg',
      };
      const boundAction = this.updateBgImage.bind(this, bgConfigParams);
      boundAction();
    }
    if (document.querySelector('body.story-tips-landing')) {
      const bgConfigParams = {
        BG_TOP: 'storyListBgTop',
        BG_BOTTOM: 'storyListBgBottom',
        BG_TOP_CLASS: 'story-page-bg-top',
        BG_BOTTOM_CLASS: 'bottom-bg',
      };
      const boundAction = this.updateBgImage.bind(this, bgConfigParams);
      boundAction();
    }
  };
}

export function CreateBottomBgImage() {
  this.updateBgImage = async (params) => {
    const placeholder = await fetchPlaceholders();
    const container = document.querySelector('main');
    if (container && placeholder[`${params.bgKey}Mobile`] && placeholder[`${params.bgKey}Desktop`]) {
      const pictureTag = createPictureTag(params.bgClass, placeholder[`${params.bgKey}Mobile`], placeholder[`${params.bgKey}Desktop`]);
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

    new CreateBgImage().init();
    new CreateBottomBgImage().init();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/** Create Image Wrapper */
function createImageWrapper(className, imgProps) {
  const imgWrapper = document.createElement('div');
  imgWrapper.className = className;
  imgWrapper.append(createPicture(imgProps));
  return imgWrapper;
}

/**
 * Builds Hero Banner in a container element.
 * @param {Element} main The container element
 */
function decorateHeroBanner(main) {
  const elements = main.querySelectorAll('.hero');
  if (elements && elements?.length) {
    elements.forEach((elem) => {
      const bannerImgProps = {
        alt: '',
        loading: 'eager',
      };

      const productImgProps = {
        alt: '',
        loading: 'eager',
      };

      // Loop through the child div elements
      const childElems = Array.from(elem.children);
      childElems.forEach((divElement) => {
        // Get the text content of the first div element
        const firstDivText = divElement.querySelector('div:first-child').textContent;
        // Check if the first div text matches the desired text (based of document)
        if (firstDivText === SECTION_BG_MOBILE || firstDivText === SECTION_BG_DESKTOP) {
          const imgSrc = divElement.querySelector('img')?.getAttribute('src');
          bannerImgProps[firstDivText] = imgSrc || '';
        }
        if (firstDivText === PRODUCT_IMG_MOBILE || firstDivText === PRODUCT_IMG_DESKTOP) {
          const imgSrc = divElement.querySelector('img')?.getAttribute('src');
          productImgProps[firstDivText] = imgSrc || '';
        }
      });

      // Create Banner Image Wrapper
      const bannerImgWrapper = createImageWrapper('hero-bg', bannerImgProps);
      elem.innerHTML = '';
      elem.appendChild(bannerImgWrapper);

      // Create Product Image Wrapper
      if (productImgProps[PRODUCT_IMG_MOBILE] || productImgProps[PRODUCT_IMG_DESKTOP]) {
        const productImgWrapper = createImageWrapper('hero-product', productImgProps);
        elem.appendChild(productImgWrapper);
      }
    });
  }
}

/**
 * Builds Full width Banner in a container element.
 * @param {Element} main The container element
 */
function decorateFullWidthBanner(main) {
  const elements = main.querySelectorAll('.full-width-banner');
  if (elements && elements?.length) {
    elements.forEach((elem, index) => {
      const pictureProps = {
        alt: '',
        loading: (index === 0) ? 'eager' : 'lazy',
        'bg-mobile': elem.dataset.backgroundMobile,
        'bg-desktop': elem.dataset.backgroundDesktop,
      };
      const picture = createPicture(pictureProps);
      elem.append(picture);
    });
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateHeroBanner(main);
  decorateButtons(main);
  buildAutoBlocks(main);
  buildCarouselBlock(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateFullWidthBanner(main);
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

// Show background image
function showBgImage() {
  const bgImageElement = document.querySelectorAll('.bg-img img');
  if (bgImageElement && bgImageElement.length) {
    bgImageElement.forEach((elem) => {
      elem.removeAttribute('style');
    });
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => {
    import('./delayed.js');
    // Showing bg image after delay
    showBgImage();
  }, 3000);
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
