// import inception from './inception.js';
// import interstellar from './interstellar.js';
// import matrix from './matrix.js';
// import dune from './dune.js';

// // Add new movie plugins here
// export const plugins = [
//   inception,
//   interstellar,
//   matrix,
//   dune
// ];

import episode1 from './episode1.js';
import episode8 from './episode8.js';
import episode12 from './episode12.js';
import episode13 from './episode13.js';
import episode17 from './episode17.js';
import episode19 from './episode19.js';
import episode21 from './episode21.js';
import episode26 from './episode26.js';
import short1 from './short1.js';

// Add new movie plugins here
export const plugins = [
  episode1,
  episode8,
  episode12,
  episode13,
  episode17,
  episode19,
  episode21,
  episode26,
  short1
];

// Shuffle function (Fisher-Yates)
function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// export const sliderTrailers = [episode1, episode8, episode12];
// Select 3 random trailers
export const sliderTrailers = shuffleArray(plugins).slice(0, 3);
