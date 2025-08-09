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
import episode2 from './episode2.js';
import episode3 from './episode3.js';
import episode4 from './episode4.js';
import episode5 from './episode5.js';
import episode6 from './episode6.js';
import episode7 from './episode7.js';
import episode8 from './episode8.js';
import episode9 from './episode9.js';
import episode10 from './episode10.js';
import episode11 from './episode11.js';
import episode12 from './episode12.js';
import episode13 from './episode13.js';
import episode14 from './episode14.js';
import episode15 from './episode15.js';
import episode17 from './episode17.js';
import episode18 from './episode18.js';
import episode19 from './episode19.js';
import episode20 from './episode20.js';
import episode21 from './episode21.js';
import episode22 from './episode22.js';
import episode23 from './episode23.js';
import episode24 from './episode24.js';
import episode25 from './episode25.js';
import episode26 from './episode26.js';
import episode27 from './episode27.js';
import episode28 from './episode28.js';
import episode29 from './episode29.js';
import episode30 from './episode30.js';
import episode31 from './episode31.js';
import episode32 from './episode32.js';
import episode33 from './episode33.js';

import short1 from './short1.js';

// Add new movie plugins here
export const plugins = [
  episode1, episode13, episode25, episode20, episode12,
  episode9, episode19, episode8, episode21, short1,
  episode17, episode26, episode24, episode14,
  episode18, episode2, episode3, episode15, episode10,
  episode28, episode6, episode30, episode29, episode11,
  episode23, episode4, episode33, episode5, episode22,
  episode7, episode27, episode31, episode32
  
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


