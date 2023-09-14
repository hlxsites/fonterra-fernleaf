import {
  changeImageAttribute,
  fetchSearch,
  CATEGORY_RECIPES,
  ProcessBottomBgImage,
} from '../../scripts/scripts.js';

const getListHTML = (row) => `<div>
            <a class="recipe-card" href="${row.path}" title="${row.shorttitle}">
                <img alt="${row.shorttitle}" loading="lazy" src="${row.image}" width="500" height="318">
                <div class="recipe-content">
                    <div class="recipe-title">${row.shorttitle}</div>
                    <div class="recipe-desc">${row.shortdesc}</div>
                    <div class="recipe-info">
                        <div class="recipe-card-icon icon-icon-time">${row.duration}</div>
                        <div class="recipe-card-icon icon-icon-user">${row.serves}</div>
                    </div>
                </div>
            </a></div>`;
const bgConfigParams = {
  bgKey: 'recipesBgBottom',
  bgClass: 'bottom-bg',
};

async function printList(list) {
  const ul = document.createElement('ul');
  list.forEach((row) => {
    if (row.shorttitle !== '0') {
      row.image = changeImageAttribute(row.image, 'width', 500);
      const li = document.createElement('li');
      li.innerHTML = getListHTML(row);
      if (row.shortdesc === '0') {
        li.querySelectorAll('.recipe-desc')[0].classList.add('hide');
      }
      ul.append(li);
    }
  });
  return ul;
}

export default async function decorate(block) {
  const list = await fetchSearch(CATEGORY_RECIPES);

  block.textContent = '';
  if (list.length > 0) {
    const objects = await printList(list);
    block.append(objects);
    const boundFunction = new ProcessBottomBgImage().updateBgImage.bind(this, bgConfigParams);
    boundFunction();
  } else {
    block.append('no result found');
  }
}
