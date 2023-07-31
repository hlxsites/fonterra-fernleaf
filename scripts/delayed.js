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
