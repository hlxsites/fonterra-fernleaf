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
    const picture = document.createElement('picture');
    // webp
    breakpoints.forEach((br, i) => {
      const url = new URL(src[i], window.location.href);
      const { pathname } = url;
      const source = document.createElement('source');
      if (br.media) source.setAttribute('media', br.media);
      source.setAttribute('type', 'image/webp');
      source.setAttribute('srcset', `${pathname}?width=${br.width}&format=webply&optimize=medium`);
      picture.appendChild(source);
    });
    // fallback
    breakpoints.forEach((br, i) => {
      const url = new URL(src[i], window.location.href);
      const { pathname } = url;
      const ext = pathname.substring(pathname.lastIndexOf('.') + 1);
      if (i < breakpoints.length - 1) {
        const source = document.createElement('source');
        if (br.media) source.setAttribute('media', br.media);
        source.setAttribute('srcset', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
        picture.appendChild(source);
      } else {
        const img = document.createElement('img');
        img.setAttribute('loading', eager ? 'eager' : 'lazy');
        img.setAttribute('alt', alt);
        img.setAttribute('width', br.width);
        img.setAttribute('height', '100%');
        picture.appendChild(img);
        img.setAttribute('src', `${pathname}?width=${br.width}&format=${ext}&optimize=medium`);
      }
    });

    return picture;
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
