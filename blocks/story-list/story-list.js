import {
  getLanguage, adjustImageSize, fetchSearch, CATEGORY_STORIES,
} from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';
import {
  isMobile,
  mobileViewportChange,
} from '../../scripts/delayed.js';

const BG_TOP = 'storyListBgTop';
const BG_BOTTOM = 'storyListBgBottom';
const BG_TOP_CLASS = 'story-list-bg-top';
const BG_BOTTOM_CLASS = 'story-list-bg-bottom';

async function printList(list) {
  const placeholders = await fetchPlaceholders(`/${getLanguage()}`);
  const getListHTML = (row) => `<div class="story-image"><img alt="${row.shorttitle}" src="${row.image}" width="300" height="218"></div>
            <div class="story-content">
                <div class="story-title"><a href="${row.path}" title="${row.shorttitle}" aria-label="${row.shorttitle}">${row.shorttitle}</a></div>
                <p class="story-desc">${row.description}</p>
                <a href="${row.path}" title="${row.shorttitle}" aria-label="${row.shorttitle}" class="button primary">${placeholders.readmore}</a>
            </div>`;

  const ul = document.createElement('ul');
  list.forEach((row) => {
    row.image = adjustImageSize(row.image, 300);
    const li = document.createElement('li');
    li.classList.add('story');
    li.innerHTML = getListHTML(row);

    ul.append(li);
  });
  return ul;
}

async function processBgImage() {
  const placeholder = await fetchPlaceholders();
  const device = (await isMobile()) ? 'Mobile' : 'Desktop';
  const storyContainer = document.querySelector('main');

  const createAndAppendPicture = (bgClass, bgConstant) => {
    if (document.querySelector(`.${bgClass}`)) document.querySelector(`.${bgClass}`).remove();
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.alt = '';
    img.src = placeholder[`${bgConstant}${device}`];
    picture.className = bgClass;
    picture.appendChild(img);
    return picture;
  };

  if (placeholder[`${BG_TOP}${device}`]) {
    const topPicture = createAndAppendPicture(BG_TOP_CLASS, BG_TOP);
    storyContainer.insertBefore(topPicture, storyContainer.firstChild);
  }

  if (placeholder[`${BG_BOTTOM}${device}`]) {
    const bottomPicture = createAndAppendPicture(BG_BOTTOM_CLASS, BG_BOTTOM);
    storyContainer.appendChild(bottomPicture);
  }
}
export default async function decorate(block) {
  const list = await fetchSearch(CATEGORY_STORIES);
  block.textContent = '';
  if (list.length > 0) {
    const objects = await printList(list);
    block.append(objects);
  } else {
    block.append('no result found');
  }
  processBgImage();
  mobileViewportChange(processBgImage);
}
