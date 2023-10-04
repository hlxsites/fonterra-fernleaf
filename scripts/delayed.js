// eslint-disable-next-line import/no-cycle
import { sampleRUM, getMetadata } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

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

// add print button to story tips page
function AddPrintButton() {
  this.content = () => `<a class="story-tips-action" href="javascript:window.print()">
              <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g class="print-svg" transform="translate(-658.000000, -529.000000)" fill="#A3A3A3" fill-rule="nonzero">
                    <g transform="translate(658.000000, 528.000000)">
                      <g>
                        <g>
                          <path d="M7.5,20.999 C7.224,20.999 7,20.775 7,20.499 C7,20.223 7.224,19.999 7.5,19.999 L16.5,19.999 C16.776,19.999 17,20.223 17,20.499 C17,20.775 16.776,20.999 16.5,20.999 L7.5,20.999 Z" id="Path"></path>
                          <path d="M7.5,17.999 C7.224,17.999 7,17.775 7,17.499 C7,17.223 7.224,16.999 7.5,16.999 L16.5,16.999 C16.776,16.999 17,17.223 17,17.499 C17,17.775 16.776,17.999 16.5,17.999 L7.5,17.999 Z" id="Path"></path>
                          <path d="M6.5,25 C5.673,25 5,24.327 5,23.5 L5,18 L2.5,18 C1.125,17.996 0.004,16.875 0,15.501 L0,9.5 C0.004,8.125 1.125,7.004 2.499,7 L21.5,7 C22.875,7.004 23.996,8.125 24,9.499 L24,15.5 C23.996,16.875 22.875,17.996 21.501,18 L19,18 L19,23.5 C19,24.327 18.327,25 17.5,25 L6.5,25 Z M6,23.5 C6,23.776 6.224,24 6.5,24 L17.5,24 C17.776,24 18,23.776 18,23.5 L18,15 L6,15 L6,23.5 Z M21.5,17 C22.324,16.998 22.998,16.324 23,15.499 L23,9.5 C22.998,8.676 22.324,8.003 21.499,8 L2.5,8 C1.676,8.003 1.003,8.676 1,9.502 L1,15.5 C1.003,16.324 1.676,16.998 2.501,17 L5,17 L5,14.5 C5,14.225 5.224,14 5.5,14 L18.5,14 C18.776,14 19,14.224 19,14.5 L19,17 L21.5,17 Z" id="Shape"></path>
                          <path d="M18.479,5.999 L14.5,5.999 C14.224,5.999 14,5.775 14,5.499 L14,2 L6,2 L6,5.5 C6,5.776 5.776,6 5.5,6 C5.224,6 5,5.776 5,5.5 L5,1.5 C5,1.224 5.224,1 5.5,1 L14.479,1 C14.486,1 14.493,0.999 14.5,0.999 C14.507,0.999 14.514,1 14.521,1 L15.085,1 C15.486,1 15.862,1.156 16.146,1.439 L18.56,3.853 C18.844,4.137 19,4.514 19,4.914 L19,5.5 C19,5.776 18.776,6 18.5,6 C18.493,6 18.486,6 18.479,5.999 Z M18,4.999 L18,4.914 C18,4.781 17.948,4.655 17.854,4.56 L15.44,2.146 C15.345,2.052 15.219,2 15.086,2 L15,2 L15,4.999 L18,4.999 Z" id="Shape"></path>
                          <path d="M3.5,11.999 C2.673,11.999 2,11.326 2,10.499 C2,9.672 2.673,8.999 3.5,8.999 C4.327,8.999 5,9.672 5,10.499 C5,11.326 4.327,11.999 3.5,11.999 Z M3.5,9.999 C3.224,9.999 3,10.223 3,10.499 C3,10.775 3.224,10.999 3.5,10.999 C3.776,10.999 4,10.775 4,10.499 C4,10.223 3.776,9.999 3.5,9.999 Z" id="Shape"></path>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
              <span class="print-btn">Print</span>
            </a>`;

  this.render = async () => {
    const isStoryTipsTitle = document.body.querySelector('h1');
    const printButton = this.content();
    isStoryTipsTitle.insertAdjacentHTML(
      'beforebegin',
      printButton,
    );
  };

  this.init = () => {
    const isStoryTipsPage = document.body.classList.contains('story-tips');
    if (isStoryTipsPage) {
      this.render();
    }
  };
}
new AddPrintButton().init();

// Update External Links to Open in New Tab
function UpdateExternalLinks() {
  this.updateLinks = () => {
    const currentHost = (new URL(window.location.href))?.host;
    const externalLinks = document.body.querySelectorAll('a');
    [...externalLinks].forEach((link) => {
      const linkHost = new URL(link.href).host;
      // open the attribute in a new tab if it's not a javascript link and
      // it's not a link to the current host
      // eslint-disable-next-line no-script-url
      if ((linkHost !== '') && (linkHost !== currentHost)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  };
  this.init = () => {
    this.updateLinks();
  };
}
new UpdateExternalLinks().init();

/**
 * Google Tag Manager implementation
* */
function GoogleTagManager() {
  this.loadGTM = () => {
    const scriptTag = document.createElement('script');
    scriptTag.innerHTML = `
    (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
            'gtm.start':
                new Date().getTime(), event: 'gtm.js'
        });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src =
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-NX6JQZG');
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('set', {
        'cookie_flags': 'SameSite=None;Secure'
    });
    `;

    const gtmIframe = document.createElement('iframe');
    gtmIframe.classList.add('gtm-iframe');
    gtmIframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-NX6JQZG';
    const gtmEl = document.createElement('noscript');
    gtmEl.append(gtmIframe);

    document.head.prepend(scriptTag);
    document.body.prepend(gtmEl);
  };
}

if (!window.location.hostname.includes('localhost') && !document.location.hostname.includes('.hlx.page')) {
  new GoogleTagManager().loadGTM();
}
