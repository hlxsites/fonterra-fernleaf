import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

function wrapCardwithLink(row, li) {
  // extract anchor link from the card and insert it as a child of the li
  const a = row.querySelector('a');
  a.parentElement.innerHTML = a.innerHTML;
  a.innerHTML = '';
  a.remove();
  li.append(a);
  // wrap the card with the anchor link
  const cardLink = li.querySelector('a');
  cardLink.append(row);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    // wrap the card with the anchor link
    wrapCardwithLink(row, li);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  ul.querySelectorAll('img').forEach((img) => {
    img.width = '750';
    img.height = '750';
  });
  block.textContent = '';
  block.append(ul);
}
