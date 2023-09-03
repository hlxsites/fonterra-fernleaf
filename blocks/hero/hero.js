import { createPicture } from '../../scripts/scripts.js';
import { fetchPlaceholders } from '../../scripts/lib-franklin.js';

async function createSplash(block) {
  const heroBanner = block.querySelector('.hero-bg');
  const isProductBanner = block.classList.contains('has-product');
  if (!block.classList.contains('main')) {
    const placeholder = await fetchPlaceholders();
    if (placeholder) {
      const splashImgProps = {
        alt: '',
        loading: 'eager',
        'bg-mobile': isProductBanner ? placeholder?.largeSplashMobile : placeholder?.smallSplashMobile,
        'bg-desktop': isProductBanner ? placeholder?.largeSplashDesktop : placeholder?.smallSplashDesktop,
      };
      const splashImg = createPicture(splashImgProps);
      splashImg.classList.add('hero-splash');
      heroBanner.appendChild(splashImg);
    }
  }
}

export default function decorate(block) {
  createSplash(block);
}
