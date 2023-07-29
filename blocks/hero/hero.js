import {
  isMobile,
} from '../../scripts/scripts.js';

const SECTION_BG_DESKTOP = 'bg-desktop';
const SECTION_BG_MOBILE = 'bg-mobile';
const SECTION_PRODUCT_DESKTOP = 'product-desktop';
const SECTION_PRODUCT_MOBILE = 'product-mobile';
const SECTION_CONTENT = 'content';
let heroSections = [];

function preProcess(block) {
  heroSections = [];
  [...block.children].forEach((row) => {
    if (row.children[0].innerText === SECTION_CONTENT) {
      heroSections[row.children[0].innerText] = row.children[1].innerHTML;
    } else if (row.children.length === 2) {
      heroSections[row.children[0].innerText] = row.children[1].children[0].children;
    } else {
      heroSections[SECTION_BG_DESKTOP] = row.children[0].children[0].children;
      if (row.children[0].children.length === 2) {
        heroSections[SECTION_CONTENT] = row.children[0].children[1].outerHTML;
      }
    }
  });

  return null;
}

function isValidImg(imgTag) {
  if (heroSections[imgTag] && heroSections[imgTag].length === 4) {
    return true;
  }
  return false;
}

function generateImage(imgDesktop, imgMobile, clsName) {
  const dImg = heroSections[imgDesktop];
  const mImg = heroSections[imgMobile];
  const hImg = document.createElement('picture');
  let imgTag = '';
  [...dImg].forEach((item, index) => {
    if (index !== 1 && index !== 3) {
      hImg.append(item);
    }
    if (index === 3 && !isMobile()) {
      imgTag = item;
    }
  });

  [...mImg].forEach((item, index) => {
    if (index === 1) {
      hImg.append(item);
    }
    if (index === 3 && isMobile()) {
      imgTag = item;
    }
  });
  hImg.append(imgTag);

  const imgContainer = document.createElement('div');
  imgContainer.className = clsName;
  imgContainer.append(hImg);
  return imgContainer;
}

function generateSingleImage(imgDesktop, clsName) {
  const dImg = heroSections[imgDesktop];
  const hImg = document.createElement('picture');
  [...dImg].forEach((item) => {
    hImg.append(item);
  });

  const imgContainer = document.createElement('div');
  imgContainer.className = clsName;
  imgContainer.append(hImg);
  return imgContainer;
}

export default function decorate(block) {
  preProcess(block);
  block.innerHTML = '';
  if (isValidImg(SECTION_BG_DESKTOP) && isValidImg(SECTION_BG_MOBILE)) {
    block.append(generateImage(SECTION_BG_DESKTOP, SECTION_BG_MOBILE, 'hero-bg'));
  } else if (isValidImg(SECTION_BG_DESKTOP) && !isValidImg(SECTION_BG_MOBILE)) {
    block.append(generateSingleImage(SECTION_BG_DESKTOP, 'hero-bg'));
  }

  if (isValidImg(SECTION_PRODUCT_DESKTOP) && isValidImg(SECTION_PRODUCT_MOBILE)) {
    block.append(generateImage(SECTION_PRODUCT_DESKTOP, SECTION_PRODUCT_MOBILE, 'hero-product'));
  }

  if (heroSections[SECTION_CONTENT]) {
    const divContent = document.createElement('div');
    divContent.className = 'hero-content';
    const divInnerContainer = document.createElement('div');
    divInnerContainer.className = 'inner-container';
    const description = document.createElement('div');
    description.className = 'hero-description';
    description.innerHTML = heroSections[SECTION_CONTENT];
    divInnerContainer.appendChild(description);
    divContent.appendChild(divInnerContainer);
    block.append(divContent);
  }
}
