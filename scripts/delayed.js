// eslint-disable-next-line import/no-cycle
import { sampleRUM, getMetadata } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

// eslint-disable-next-line import/prefer-default-export
export async function isMobile() {
  const mql = window.matchMedia('(max-width: 600px)');

  return mql.matches;
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
                      alt=${alt}
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
        const responsiveImages = this.addImageSource([desktopBg, mobileBg], '', false, [{ media: '(min-width: 600px)', width: '1920' }, { width: '1023' }]);
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

const generateImages = new GenerateBackGroundImages();
generateImages.init();

// add serves and duration to recipe details page content
function AddServesAndDuration() {
  this.content = (serves, duration) => {
    const servesContent = serves
      ? `<div class='serving'>
        <span class='icon icon-icon-user'></span><span class='text'>${serves}</span>
      </div>`
      : '';
    const durationContent = duration
      ? `<div class='pre-time'>
        <span class='icon icon-icon-time'></span>
        <span class='text'>${duration}</span>
      </div>`
      : '';
    return `<div class='recipe-info'>             
              ${servesContent}
              ${durationContent}
              </div>`;
  };
  this.render = () => {
    const servesMeta = getMetadata('serves');
    const durationMeta = getMetadata('duration');
    if (servesMeta || durationMeta) {
      const recipeTitle = document.body.querySelector('h1');
      recipeTitle.insertAdjacentHTML(
        'afterend',
        this.content(servesMeta, durationMeta),
      );
    }
  };
  this.init = () => {
    const isRecipePage = document.body.classList.contains('recipe');
    if (isRecipePage) {
      this.render();
    }
  };
}
new AddServesAndDuration().init();
