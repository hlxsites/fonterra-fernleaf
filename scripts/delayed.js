// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

// eslint-disable-next-line import/prefer-default-export
export async function isMobile() {
  const mql = window.matchMedia('(max-width: 600px)');

  return mql.matches;
}

// add serves and duration to recipe details page content
const addServesAndDuration = {
  content: (serves, duration) => {
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
  },
  render: () => {
    const servesMeta = document.querySelector("meta[name='serves']");
    const serves = servesMeta ? servesMeta.getAttribute('content') : '';
    const durationMeta = document.querySelector("meta[name='duration']");
    const duration = durationMeta ? durationMeta.getAttribute('content') : '';
    if (servesMeta || durationMeta) {
      const recipeTitle = document.querySelector('h1');
      recipeTitle.insertAdjacentHTML(
        'afterend',
        this.content(serves, duration),
      );
    }
  },
  init: () => {
    const isRecipePage = document
      .querySelector('body')
      .classList.contains('recipe');
    if (isRecipePage) {
      this.render();
    }
  },
};
addServesAndDuration.init();
