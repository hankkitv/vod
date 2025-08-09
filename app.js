const movieContainer = document.getElementById("movie-container");
const searchInput = document.getElementById("search-input");
const filterSelect = document.getElementById("filter-select");
const themeToggleBtn = document.getElementById("theme-toggle");

const sliderContainer = document.getElementById("carousel-slider");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

let allMovies = [];
let sliderMovies = []; // Movies to be shown in the top slider
let currentSlideIndex = 0;
let autoSlideInterval;
const SLIDE_DURATION = 15000; // 15 seconds

let isSliderHovered = false;
let userInteractedWithSlider = false;

async function loadPlugins() {
  try {
    const pluginIndex = await import("./plugins/index.js");
    allMovies = pluginIndex.plugins;
    sliderMovies = pluginIndex.sliderTrailers; // allMovies.slice(0, 3); // pick first 3 movies for slider (you can change this)

    renderSlider(sliderMovies);
    startAutoSlide();

    renderMovies(allMovies);
    populateFilters(allMovies);
  } catch (err) {
    console.error("Failed to load plugins", err);
  }
}

function extractYouTubeId(url) {
  // Match ?v=VIDEO_ID (watch URL)
  const watchMatch = url.match(/[?&]v=([^&#]+)/);
  if (watchMatch) return watchMatch[1];

  // Match /embed/VIDEO_ID
  const embedMatch = url.match(/\/embed\/([^/?#]+)/);
  if (embedMatch) return embedMatch[1];

  // Match shortened youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^/?#]+)/);
  if (shortMatch) return shortMatch[1];

  return null; // fallback
}

function renderMovies(movies) {
  movieContainer.innerHTML = "";
  
  movies.forEach((movie, index) => {

    const card = document.createElement("div");
    card.className = "movie-card";

    const videoId = extractYouTubeId(movie.trailerUrl);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const duration = formatDuration(movie.duration);

    // Title
    const title = document.createElement("h2");
    title.textContent = movie.title;


    card.innerHTML = `
      <div class="movie-thumbnail-wrapper" data-index="${index}">
        <img src="${thumbnailUrl}" alt="${movie.title}" class="movie-thumbnail" loading="lazy">
        <span class="duration-badge">${duration}</span>
      </div>
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <button class="play-btn" data-index="${index}">▶ Play</button>
      </div>
    `;

    movieContainer.appendChild(card);
  });

  // Play button click
  const playButtons = movieContainer.querySelectorAll('.play-btn');
  playButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const index = e.currentTarget.dataset.index;
      openMovieDetail(movies[index]);
    });
  });
}

function renderSlider(movies) {
  sliderContainer.innerHTML = "";
  movies.forEach((movie, index) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";

    const iframe = document.createElement("iframe");
    iframe.setAttribute(
      "data-src",
      movie.trailerUrl + "?enablejsapi=1&mute=1&autoplay=1&controls=0&loop=1&rel=0&&hd=1"
    );
    iframe.allow = "autoplay; encrypted-media";
    iframe.setAttribute("frameborder", "0");
    
    const overlay = document.createElement("div");
    overlay.className = "slider-overlay";
    let overlayHtml = `
      <h2>${movie.title}</h2>
      <p>${movie.description}</p>
      <small>${movie.category}</small>
      <button class="play-btn" data-index="${index}">▶ Play</button>      
    `;

    // If on mobile (max-width: 600px), apply the requested changes
    if (window.matchMedia && window.matchMedia("(max-width: 600px)").matches) {
      overlayHtml = `
        <h3 class="slider-title-mobile">${movie.title}</h3>
        <p class="slider-desc-mobile">${movie.description}</p>
        <button class="play-btn" data-index="${index}">▶ Play</button>
      `;
    }

    overlay.innerHTML = overlayHtml;

    const progressBar = document.createElement('div');
    progressBar.className = 'slider-progress';

    slide.appendChild(iframe);
    slide.appendChild(overlay);    
    slide.appendChild(progressBar);

    // >>> ADD THIS BLOCK <<<
    slide.addEventListener("mouseenter", () => {
      if (!userInteractedWithSlider) return; // Prevent action until interaction
      const iframe = slide.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"unMute","args":""}',
          "*"
        );
      }
    });
    slide.addEventListener("mouseleave", () => {
      if (!userInteractedWithSlider) return; // Prevent action until interaction
      const iframe = slide.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          '{"event":"command","func":"mute","args":""}',
          "*"
        );
      }
    });
    
    sliderContainer.appendChild(slide);
  });
  // sliderContainer.appendChild(prevBtn);
  // sliderContainer.appendChild(nextBtn);

  updateSliderPosition();
}

// function updateSliderPosition() {
//   const offset = -currentSlideIndex * 100;
//   sliderContainer.style.transform = `translateX(${offset}%)`;
// }
function updateSliderPosition() {
  const offset = -currentSlideIndex * 100;
  sliderContainer.style.transform = `translateX(${offset}%)`;

  // Pause all trailers
  const iframes = sliderContainer.querySelectorAll("iframe");
  iframes.forEach((iframe) => {
    iframe.src = ""; // unload iframe to stop playback
  });

  // Restart current trailer
  const currentSlide = sliderContainer.children[currentSlideIndex];
  // Animate overlay
  const allSlides = sliderContainer.querySelectorAll('.carousel-slide');
  allSlides.forEach(slide => slide.classList.remove('show-overlay'));

  // Re-apply animation after a brief delay to trigger CSS
  setTimeout(() => {
    currentSlide.classList.add('show-overlay');
  }, 100); // slight delay ensures transition triggers


  const iframe = currentSlide.querySelector("iframe");
  if (iframe) {
    const newSrc = iframe.getAttribute("data-src");
    iframe.src = newSrc;

    // Add hover mute/unmute handlers
    // currentSlide.addEventListener("mouseenter", () => {
    //   iframe.contentWindow.postMessage(
    //     '{"event":"command","func":"unMute","args":""}',
    //     "*"
    //   );
    // });

    // currentSlide.addEventListener("mouseleave", () => {
    //   iframe.contentWindow.postMessage(
    //     '{"event":"command","func":"mute","args":""}',
    //     "*"
    //   );
    // });

    // Check hover state now
  // setTimeout(() => {
  //   if (isSliderHovered) {
  //     iframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
  //   } else {
  //     iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
  //   }
  // }, 500); // wait a little for iframe to load
    // Animate progress bar
    const slides = sliderContainer.querySelectorAll('.carousel-slide');
    slides.forEach(slide => {
      const bar = slide.querySelector('.slider-progress');
      if (bar) {
        bar.style.transition = 'none';
        bar.style.width = '0%'; // Reset
      }
    });

    const currentBar = currentSlide.querySelector('.slider-progress');
    if (currentBar) {
      setTimeout(() => {
        currentBar.style.transition = `width ${SLIDE_DURATION}ms linear`;
        currentBar.style.width = '100%';
      }, 50); // Slight delay to trigger transition
    }

  }

  // Add mute/unmute event listener
//   const muteBtn = currentSlide.querySelector(".mute-btn");
//   muteBtn.addEventListener("click", () => {
//     const isMuted = muteBtn.textContent === "🔇";
//     muteBtn.textContent = isMuted ? "🔊" : "🔇";
//     const command = isMuted ? "unMute" : "mute";
//     iframe.contentWindow.postMessage(
//       `{"event":"command","func":"${command}","args":""}`,
//       "*"
//     );
//   });
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % sliderMovies.length;
  updateSliderPosition();
}

function prevSlide() {
  currentSlideIndex =
    (currentSlideIndex - 1 + sliderMovies.length) % sliderMovies.length;
  updateSliderPosition();
}

function startAutoSlide() {
  if (autoSlideInterval) clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    nextSlide();
  }, SLIDE_DURATION);
}

function populateFilters(movies) {
  const categories = [...new Set(movies.map((m) => m.category))].sort();
  filterSelect.innerHTML = '<option value="all">All Categories</option>';
  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    filterSelect.appendChild(option);
  }
}

function filterAndSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = filterSelect.value;

  const filtered = allMovies.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchTerm) ||
      movie.description.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || movie.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  renderMovies(filtered);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}

function toggleTheme() {
  const current = document.body.classList.contains("dark") ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
}

function openMovieDetail(movie) {
  document.body.innerHTML = `
    <div id="detail-page">
      <button id="back-btn">← Back</button>
      <h1>${movie.title}</h1>
      <iframe src="${movie.trailerUrl}?autoplay=1&mute=0&enablejsapi=1&rel=0&hd=1" 
              allow="autoplay; encrypted-media" 
              frameborder="0" 
              allowfullscreen
              style="width:100%; height:400px;"></iframe>
      <p>${movie.description}</p>
      <small>${movie.category}</small>
      <h3>Screenshots</h3>
      <div class="screenshots">
  ${
    movie.screenshots
      ?.map((src) => `<img data-src="${src}" loading="lazy" />`)
      .join("") || "<em>No screenshots</em>"
  }
</div>
    </div>
  `;

  document.getElementById("back-btn").addEventListener("click", () => {
    location.reload(); // simple way to restore full app state
  });

  // Lazy-load screenshots
  const screenshotImgs = document.querySelectorAll(".screenshots img");
  screenshotImgs.forEach((img) => {
    const actualSrc = img.getAttribute("data-src");
    if (actualSrc) {
      img.src = actualSrc;
    }
  });
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}


// Load theme from localStorage
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

// Event Listeners
searchInput.addEventListener("input", filterAndSearch);
filterSelect.addEventListener("change", filterAndSearch);
themeToggleBtn.addEventListener("click", toggleTheme);

nextBtn.addEventListener("click", () => {
  nextSlide();
  startAutoSlide(); // reset timer
});

prevBtn.addEventListener("click", () => {
  prevSlide();
  startAutoSlide(); // reset timer
});

// --- Swipe support ---
let touchStartX = 0;
let touchEndX = 0;

sliderContainer.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

sliderContainer.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const diff = touchEndX - touchStartX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      prevSlide();
    } else {
      nextSlide();
    }
    startAutoSlide(); // restart the interval
  }
}

// Handle Play button clicks
sliderContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("play-btn")) {
    const index = parseInt(e.target.dataset.index, 10);
    const movie = sliderMovies[index];
    openMovieDetail(movie);
  }
});

sliderContainer.addEventListener('mouseenter', (e) => {
  // isSliderHovered = true;
  // Ignore if entering from inside slider or over nav buttons
  if (!e.relatedTarget || !sliderContainer.contains(e.relatedTarget)) {
    const isOverNav = e.target.closest('.slider-nav');
    if (!isOverNav) {
      isSliderHovered = true;
    }
  }

});

sliderContainer.addEventListener('mouseleave', (e) => {
  // isSliderHovered = false;
  // Ignore if moving to another child (like buttons)
  if (!e.relatedTarget || !sliderContainer.contains(e.relatedTarget)) {
    const isOverNav = e.relatedTarget?.closest('.slider-nav');
    if (!isOverNav) {
      isSliderHovered = false;
    }
  }
});

// Listen for the first interaction with the slider
sliderContainer.addEventListener('click', function handleUserInteraction() {
  userInteractedWithSlider = true;
  // Optionally, remove listener if you only want to detect the first interaction
  sliderContainer.removeEventListener('click', handleUserInteraction);
});


// Init
loadPlugins();







