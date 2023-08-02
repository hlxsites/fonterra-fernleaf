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
