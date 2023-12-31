import { getLanguage, fetchSearch, changeImageAttribute } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

// maintains current state for carousel items
let current = 1;
// total number of items in carousel
let numItems = 0;
let category;
// total number of bullets for carousel
let noOfBullets = 0;
// maintains current state for carousel bullets
let bulletCurrent = 1;
let interval;
// difference between active and clicked bullets in carousel
let bulletDiff = 1;
// stores if block is a product landing page variant or not
let productLandingPageCarousel = false;

/**
 * Handler for button click, initiates transition
 * @param {*} event
 */
function next(event, isRightScroll) {
  // event === undefined for autoscroll
  const isRight = isRightScroll || event === undefined || event.target.className === 'scroll-right';
  const sliderList = document.querySelector('.slider-container');
  if (isRight) {
    sliderList.classList.add('slide-transition-right');
    sliderList.style.transform = 'translate3d(-25%, 0px,0px)';
  } else {
    sliderList.classList.add('slide-transition-left');
    sliderList.style.transform = 'translate3d(25%, 0px,0px)';
  }
}

function fetchItemsInCarousel() {
  const screenWidth = window.innerWidth;
  let itemsInCarousel = 0;
  if (category === 'recipe') {
    itemsInCarousel = screenWidth < 900 ? 2 : 3;
  } else if (screenWidth < 600) {
    itemsInCarousel = productLandingPageCarousel ? 1 : 2;
  } else if (screenWidth < 900) {
    itemsInCarousel = productLandingPageCarousel ? 2 : 3;
  } else {
    itemsInCarousel = productLandingPageCarousel ? 3 : 4;
  }
  return itemsInCarousel;
}

function updateTabIndexForCarouselItems(sliderList, key, tabIndexValue) {
  // accessibility fixes
  sliderList.querySelector(`.${category}-slider-item[data-position='${key}']`).setAttribute('tabindex', `${tabIndexValue}`);
  sliderList.querySelector(`.${category}-slider-item[data-position='${key}'] a`).setAttribute('tabindex', `${tabIndexValue}`);
  sliderList.querySelector(`.${category}-slider-item[data-position='${key}'] h3 a`).setAttribute('tabindex', `${tabIndexValue}`);
}

/**
 * Handler after transition completes
 */
function changeOrder() {
  const sliderList = document.querySelector('.slider-container');
  const isRight = sliderList.classList.contains('slide-transition-right');
  if (isRight) {
    current = (current + bulletDiff > numItems)
      ? current + bulletDiff - numItems : current + bulletDiff;
    bulletCurrent = (bulletCurrent + bulletDiff > noOfBullets)
      ? bulletCurrent + bulletDiff - noOfBullets : bulletCurrent + bulletDiff;
  } else {
    current = (current - bulletDiff < 1)
      ? current - bulletDiff + numItems : current - bulletDiff;
    bulletCurrent = (bulletCurrent - bulletDiff < 1)
      ? bulletCurrent - bulletDiff + noOfBullets : bulletCurrent - bulletDiff;
  }

  let order = 1;
  let tabIndexValue = -1;
  for (let i = current; i <= numItems; i += 1) {
    tabIndexValue = order <= fetchItemsInCarousel() ? '0' : '-1';
    sliderList.querySelector(`.${category}-slider-item[data-position='${i}']`).style.order = order;
    updateTabIndexForCarouselItems(sliderList, i, tabIndexValue);
    order += 1;
  }

  tabIndexValue = -1;
  for (let i = 1; i < current; i += 1) {
    tabIndexValue = order <= fetchItemsInCarousel() ? '0' : '-1';
    sliderList.querySelector(`.${category}-slider-item[data-position='${i}']`).style.order = order;
    updateTabIndexForCarouselItems(sliderList, i, tabIndexValue);
    order += 1;
  }

  const e1 = document.querySelector('.bullet-active');
  e1.classList.remove('bullet-active');
  e1.setAttribute('tabindex', '-1');
  const ele = document.getElementById(bulletCurrent);

  ele.classList.add('bullet-active');
  ele.setAttribute('tabindex', '0');

  sliderList.classList.remove('slide-transition-right');
  sliderList.classList.remove('slide-transition-left');
  sliderList.style.transform = 'translate3d(0px, 0px, 0px)';
  bulletDiff = 1;
}

function fetchNumberOfBullets() {
  return (numItems - fetchItemsInCarousel() + 1);
}

/**
 * Checks if we want to hide carousel buttons, animation and bullets
 */
function showStaticCarousel() {
  if (numItems === fetchItemsInCarousel()) {
    return true;
  }
  return false;
}

/**
 * Handler for carousel bullet click
 */
function handleBulletClick(event) {
  const clickedBullet = event.target.getAttribute('id');

  const activeBulletElement = document.querySelector('.bullet-active');
  const activeBullet = activeBulletElement.getAttribute('id');
  const diff = clickedBullet - activeBullet;
  bulletDiff = Math.abs(diff);
  next(event, diff > 0);
}

function createBullets() {
  const bulletsContainer = document.getElementById('bullets');
  bulletsContainer.innerHTML = '';

  noOfBullets = fetchNumberOfBullets();
  for (let i = 1; i <= noOfBullets; i += 1) {
    const bullet = document.createElement('button');
    if (i === 1) {
      bullet.classList.add('bullet-active');
    }
    bullet.classList.add('bullet');
    bullet.id = i;
    bullet.setAttribute('aria-label', `bullet-item-${i}`);
    bullet.setAttribute('tabindex', i === 1 ? '0' : '-1');
    bulletsContainer.appendChild(bullet);
    bullet.addEventListener('click', handleBulletClick);
  }
  const sliderList = document.getElementById(`id-${category}-slider-list`);
  sliderList.append(bulletsContainer);
}

/**
 * Hides carousel buttons, animation and bullets for static carousel
 */
function showHideCarousel() {
  const bulletsContainer = document.getElementById('bullets');
  const leftButton = document.getElementById('id-scroll-left');
  const rightButton = document.getElementById('id-scroll-right');
  if (showStaticCarousel()) {
    leftButton.style.display = 'none';
    rightButton.style.display = 'none';
    bulletsContainer.style.display = 'none';
  } else {
    leftButton.style.display = '';
    rightButton.style.display = '';
    bulletsContainer.style.display = '';
  }
}

async function addCarouselHeader() {
  const placeholders = await fetchPlaceholders(`/${getLanguage()}`);
  let parentElement = document.querySelector('.carousel-container');
  if (productLandingPageCarousel) {
    parentElement = document.querySelector('.carousel');
  }
  const section = document.createElement('div');
  section.classList.add('carousel-header');
  const headerText = category === 'recipe' ? placeholders.recipecarouselheading : placeholders.productscarouselheading;
  section.innerHTML = `<h3 tabindex='0'>${headerText}</h3>`;
  parentElement.insertBefore(section, parentElement.firstChild);
}

function autoScrollCarousel() {
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  if (!showStaticCarousel() && interval === undefined) {
    interval = setInterval(next, 3000);

    // Stop the interval when the user interacts with the carousel
    carouselWrapper.addEventListener('mouseenter', () => clearInterval(interval));
    carouselWrapper.addEventListener('mouseleave', () => {
      interval = setInterval(next, 3000); // Restart the interval when the user leaves
    });
  } else if (showStaticCarousel()) {
    clearInterval(interval);
    interval = undefined;
  }
}

function isCarouselBlockVariant() {
  const carouselElement = document.querySelector('.carousel');
  if (carouselElement.classList.contains('product-landing-page')) {
    productLandingPageCarousel = true;
  }
}

export default async function decorate(block) {
  isCarouselBlockVariant();
  category = block.innerText.replace(/\s/g, '');
  const filteredItems = (await fetchSearch(category)).filter(
    (c) => c.path !== window.location.pathname,
  );

  const placeholders = await fetchPlaceholders();
  let maxItemsInCarousel;
  if (category === 'recipe') {
    maxItemsInCarousel = placeholders.maxitemsinrecipecarousel;
  } else {
    maxItemsInCarousel = placeholders.maxitemsinproductcarousel;
  }

  const randomItems = [];
  const availableItems = [...filteredItems];

  // fetch random items for carousel
  while (randomItems.length < maxItemsInCarousel && availableItems.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const randomItem = availableItems.splice(randomIndex, 1)[0];
    randomItems.push(randomItem);
  }
  block.textContent = '';
  addCarouselHeader(category);

  if (randomItems.length > 0) {
    const categoryContainer = document.createElement('div');

    let intialCount = 1;
    randomItems.forEach((item) => {
      const categoryElement = document.createElement('div');
      let updatedImageUrl = changeImageAttribute(item.image, 'width', 250);
      updatedImageUrl = changeImageAttribute(updatedImageUrl, 'format', 'webp');
      const tabIndexValue = intialCount <= fetchItemsInCarousel() ? 0 : -1;
      categoryElement.innerHTML = `
        <a href="${item.path}" title='${item.shorttitle}' tabindex='${tabIndexValue}'>
          <img src='${updatedImageUrl}' alt='${item.shorttitle}'>
        </a>
        <h3>
          <a href="${item.path}" title='${item.shorttitle}' tabindex='${tabIndexValue}'>${item.shorttitle}</a>
        </h3>
      `;

      categoryContainer.appendChild(categoryElement);
      intialCount += 1;
    });

    const sliderList = document.createElement('div');
    sliderList.classList.add(`${category}-slider-list`);
    sliderList.id = `id-${category}-slider-list`;

    const noOfItems = categoryContainer.children.length;
    numItems = noOfItems;

    // append left button for carousel to block
    const buttonLeft = document.createElement('button');
    buttonLeft.classList.add('scroll-left');
    buttonLeft.id = 'id-scroll-left';
    buttonLeft.setAttribute('tabindex', '0');
    buttonLeft.setAttribute('aria-label', 'Scroll Left');
    buttonLeft.addEventListener('click', (event) => {
      next(event, false);
    });
    block.append(buttonLeft);

    // append right button for carousel to block
    const buttonRight = document.createElement('button');
    buttonRight.classList.add('scroll-right');
    buttonRight.id = 'id-scroll-right';
    buttonRight.setAttribute('tabindex', '0');
    buttonRight.setAttribute('aria-label', 'Scroll Right');
    buttonRight.addEventListener('click', (event) => {
      next(event, true);
    });
    block.append(buttonRight);

    const sliderContainer = document.createElement('div');
    sliderContainer.classList.add('slider-container');
    intialCount = 1;
    [...categoryContainer.children].forEach((row) => {
      const tabIndexValue = intialCount <= fetchItemsInCarousel() ? 0 : -1;
      const sliderItem = document.createElement('div');
      sliderItem.classList.add(`${category}-slider-item`);
      sliderItem.setAttribute('tabindex', tabIndexValue);
      sliderItem.innerHTML = row.innerHTML;
      sliderItem.style.order = current;
      sliderItem.dataset.position = current;
      current += 1;
      sliderContainer.append(sliderItem);
      intialCount += 1;
    });
    sliderList.append(sliderContainer);
    block.append(sliderList);

    current = 1;
    const bulletsContainer = document.createElement('div');
    bulletsContainer.id = 'bullets';
    const carouselList = document.getElementById(`id-${category}-slider-list`);
    carouselList.append(bulletsContainer);

    const carouselContainer = document.querySelector('.carousel-container');
    const resizeObserver = new ResizeObserver(() => {
      createBullets();
    });
    resizeObserver.observe(carouselContainer);

    block.querySelector(`.${category}-slider-list`).addEventListener('transitionend', changeOrder);

    const resizeObserverToShowOrHideCarousel = new ResizeObserver(() => {
      showHideCarousel();
      autoScrollCarousel();
    });
    resizeObserverToShowOrHideCarousel.observe(carouselContainer);

    let touchStartX = 0;
    let touchEndX = 0;
    carouselContainer.addEventListener('touchstart', (event) => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (event) => {
      touchEndX = event.changedTouches[0].clientX;
      const swipeThreshold = 50; // Minimum distance for a swipe to be recognized as one item
      const swipeDistance = touchStartX - touchEndX;
      if (swipeDistance > swipeThreshold) {
        next(event, true);
      } else if (swipeDistance < -swipeThreshold) {
        next(event, false);
      }
    }, { passive: true });
  } else {
    block.append('no result found');
  }
}
