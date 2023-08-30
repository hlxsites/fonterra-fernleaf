/*
 * Picture Block
 * Show image and gifs directly on your page
 */

const IMG_DESKTOP = 'desktop';
const IMG_MOBILE = 'mobile';
const IMG_ALT = 'alt';

function createPicture(content) {
  const desktopImgUrl = content[IMG_DESKTOP];
  const mobileImgUrl = content[IMG_MOBILE];
  const alt = content?.IMG_ALT ? content.IMG_ALT : ' ';

  let picture;
  // If desktop and mobile images are configured, create images sources accordingly
  if (mobileImgUrl && desktopImgUrl) {
    picture = document.createElement('picture');
    const sourceDesktop = document.createElement('source');
    sourceDesktop.media = '(min-width: 600px)';
    sourceDesktop.srcset = desktopImgUrl;
    sourceDesktop.type = 'image/webp';
    picture.appendChild(sourceDesktop);

    if (mobileImgUrl) {
      const sourceMobile = document.createElement('source');
      sourceDesktop.type = 'image/webp';
      sourceMobile.srcset = mobileImgUrl;
      picture.appendChild(sourceMobile);
    }
  }

  // create image tag
  const img = document.createElement('img');
  img.src = desktopImgUrl || mobileImgUrl;
  img.alt = '';
  img.width = '1024';
  img.height = '750';
  img.alt = alt;

  // if only one image is configured, return it
  // else append img and return picture tag
  if (mobileImgUrl && desktopImgUrl) {
    picture.appendChild(img);
  } else {
    return img;
  }

  return picture;
}

const loadPicture = (block) => {
  if (block.classList.contains('picture-is-loaded')) {
    return;
  }

  const content = {};
  [...block.children].forEach((row) => {
    if (row.children[0].innerText === IMG_ALT) {
      content[row.children[0].innerText] = row.children[1].innerText;
      return;
    }
    content[row.children[0].innerText] = row.querySelector('a').href;
  });
  block.textContent = '';
  block.appendChild(createPicture(content));
  block.classList.add('picture-is-loaded');
};

export default function decorate(block) {
  // load picture when it is in viewport
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      loadPicture(block);
    }
  });
  observer.observe(block);
}
