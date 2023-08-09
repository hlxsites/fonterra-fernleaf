import { getLanguage } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

let current = 1;
let numItems = 0;

async function loadData(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(path);
    return JSON.parse(await resp.text());
  }
  return null;
}

function next(event) {
  const isRight = event.target.className === 'scrollRight';
  const outerdiv = event.target.parentElement.parentElement.getElementsByClassName('outerdiv')[0];
  if (isRight) {
    outerdiv.classList.add('slide-transition-right');
    outerdiv.style.transform = 'translate3d(-25%, 0px,0px)';
  } else {
    outerdiv.classList.add('slide-transition-left');
    outerdiv.style.transform = 'translate3d(25%, 0px,0px)';
  }
}

function changeOrder(event) {
  const outerdiv = event.target.parentElement.parentElement.getElementsByClassName('outerdiv')[0];
  const isRight = outerdiv.classList.contains('slide-transition-right');

  if (isRight) {
    if (current === numItems) {
      current = 1;
    } else {
      current += 1;
    }
  } else {
    if (current == 1) {
      current = numItems;
    } else {
      current -= 1;
    }
  }

  let order = 1;

  for (let i = current; i <= numItems; i += 1) {
    outerdiv.querySelector('.innerdiv[data-position="' + i +'"]').style.order = order;
    order += 1;
  }

  for (let i = 1; i < current; i += 1) {
    outerdiv.querySelector(".innerdiv[data-position='" + i +"']").style.order = order;
    order += 1;
  }

  /* const e1 = document.querySelector('.bullet-active');
  e1.classList.remove('bullet-active');
  const ele = document.getElementById(''+current);
  ele.classList.add('bullet-active'); */

  outerdiv.classList.remove('slide-transition-right');
  outerdiv.classList.remove('slide-transition-left');
  outerdiv.style.transform = 'translate3d(0px, 0px,0px)';
}

/*
function createBullets() {
  const screenWidth = window.innerWidth;
  console.log(`New Screen Width: ${screenWidth}px`);
} */

/* const itemsInCarousel = screenWidth < 600 ? 2 : 3;
    for (let i = 1; i <= numItems - itemsInCarousel + 1; i += 1) {
      const bullet = document.createElement('span');
      if (i === 1) {
        bullet.classList.add('bullet-active');
      } else {
        bullet.classList.add('bullet');
      }
      bullet.id = i;
      block.append(bullet);
    } */

function createBullets() {
  const screenWidth = window.innerWidth;
  console.log(`Screen Width: ${screenWidth}px`);
  const itemsInCarousel = screenWidth < 600 ? 2 : 3;

  // Clear existing bullets before re-creating them
  const bulletsContainer = document.getElementById('bullets');
  bulletsContainer.innerHTML = '';

  for (let i = 1; i <= numItems - itemsInCarousel + 1; i += 1) {
    const bullet = document.createElement('span');
    if (i === 1) {
      bullet.classList.add('bullet-active');
    } else {
      bullet.classList.add('bullet');
    }
    bullet.id = i;
    bulletsContainer.appendChild(bullet);
  }

  const outerdiv = document.querySelector('.outerdiv');
  outerdiv.append(bulletsContainer);
}

export default async function decorate(block) {
  // const h1 = block.querySelector('categoryUrl');
  const category = block.innerText;
  const path = '/query-index.json?limit=500&offset=0';
  const list = await loadData(path);

  const filteredItems = list.data.filter(
    (c) => c.category === category
      && c.language === getLanguage()
      && c.path !== window.location.pathname
  );

  const placeholder = await fetchPlaceholders();
  let maxItemsInCarousel;
  if (category === 'recipe') {
    maxItemsInCarousel = placeholder.maxitemsinrecipecarousel;
  } else {
    maxItemsInCarousel = placeholder.maxitemsinproductcarousel;
  }

  const randomItems = [];
  const availableItems = [...filteredItems];

  while (randomItems.length < maxItemsInCarousel && availableItems.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const randomItem = availableItems.splice(randomIndex, 1)[0];
    randomItems.push(randomItem);
  }

  block.textContent = '';
  if (randomItems.length > 0) {
    const categoryContainer = document.createElement('div');

    randomItems.forEach((item) => {
      const categoryElement = document.createElement('div');

      categoryElement.innerHTML = `
        <a href="${item.path}" title='${item.title}'>
          <img src='${item.image}&height=900' alt='${item.image}'>
        </a>
        <h3>
          <a href="${item.path}" title='${item.title}'>${item.title}</a>
        </h3>
      `;

      categoryContainer.appendChild(categoryElement);
    });

    // -----------------
    const outerDiv = document.createElement('div');
    outerDiv.classList.add('outerdiv');

    const buttonl = document.createElement('button');
    buttonl.classList.add('scrollLeft');
    buttonl.addEventListener('click', next, this);
    block.append(buttonl);

    const noOfItems = categoryContainer.children.length;
    numItems = noOfItems;

    [...categoryContainer.children].forEach((row) => {
      const innerDiv = document.createElement('div');
      innerDiv.classList.add('innerdiv');
      innerDiv.innerHTML = row.innerHTML;
      innerDiv.style.order = current;
      innerDiv.dataset.position = current;
      current += 1;
      outerDiv.append(innerDiv);
    });
    block.append(outerDiv);
    current = 1;

    /*
    const screenWidth = window.innerWidth;
    console.log(`Screen Width: ${screenWidth}px`);

    const itemsInCarousel = screenWidth < 600 ? 2 : 3;
    for (let i = 1; i <= numItems - itemsInCarousel + 1; i += 1) {
      const bullet = document.createElement('span');
      if (i === 1) {
        bullet.classList.add('bullet-active');
      } else {
        bullet.classList.add('bullet');
      }
      bullet.id = i;
      block.append(bullet);
    }

    window.addEventListener('resize', createBullets); */

    // number of bullets = numItems - itemInCarousel + 1

    /*
    // Initial call to create bullets
    const bulletsContainer = document.createElement('div');
    bulletsContainer.id = 'bullets';
    const outerdiv = document.querySelector('.outerdiv');
    outerdiv.append(bulletsContainer);
    // block.append(bulletsContainer);
    createBullets();

    // Listen for window resize
    window.addEventListener('resize', createBullets); */

    const button = document.createElement('button');
    button.classList.add('scrollRight');
    button.addEventListener('click', next, this);
    block.append(button);

    block.querySelector('.outerdiv').addEventListener('transitionend', (event) => {
      changeOrder(event);
    });
  } else {
    block.append('no result found');
  }
}
