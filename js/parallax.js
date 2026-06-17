// Load correct parallax images based on viewport
const isMobileViewport = () => window.innerWidth <= 660;

const loadParallaxImages = () => {
  const desktopImages = document.querySelectorAll('.parallax-layer.desktop');
  const mobileImages = document.querySelectorAll('.parallax-layer.mobile');
  
  if (isMobileViewport()) {
    // Mobile: remove data-src from desktop images to prevent loading
    desktopImages.forEach(img => {
      img.removeAttribute('data-src');
      img.removeAttribute('src');
    });
    // Show mobile images
    mobileImages.forEach(img => {
      img.style.display = '';
    });
    desktopImages.forEach(img => {
      img.style.display = 'none';
    });
  } else {
    // Desktop: load desktop images from data-src
    desktopImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    // Hide mobile images
    mobileImages.forEach(img => {
      img.style.display = 'none';
    });
    desktopImages.forEach(img => {
      img.style.display = '';
    });
  }
};

// Load immediately before page renders
loadParallaxImages();

const parallaxLayers = document.querySelectorAll('.parallax-layer');
const layer3 = document.querySelector('.layer3');
const layer4 = document.querySelector('.layer4');

let mouseX = 0;
let mouseY = 0;
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let animationFrame;

const drift4 = {
  x: 0,
  y: 0,
  angle: Math.random() * Math.PI * 2,
  angularVelocity: 0.0017,
  radius: 25,
  verticalScale: 0.6,
};

const drift3 = {
  x: 0,
  y: 0,
  angle: Math.random() * Math.PI * 2,
  angularVelocity: 0.0009,
  radius: 12,
  verticalScale: 0.5,
};

const updateDrift = () => {
  drift4.angle += drift4.angularVelocity;
  drift4.x = Math.cos(drift4.angle) * drift4.radius;
  drift4.y = Math.sin(drift4.angle * 0.7) * drift4.radius * drift4.verticalScale;

  drift3.angle += drift3.angularVelocity;
  drift3.x = Math.cos(drift3.angle) * drift3.radius;
  drift3.y = Math.sin(drift3.angle * 0.7) * drift3.radius * drift3.verticalScale;
};

const switchImagesToMobile = () => {
  document.querySelectorAll('.parallax-layer.desktop').forEach(img => {
    img.style.display = 'none';
  });
  document.querySelectorAll('.parallax-layer.mobile').forEach(img => {
    img.style.display = '';
  });
};

const switchImagesToDesktop = () => {
  document.querySelectorAll('.parallax-layer.desktop').forEach(img => {
    img.style.display = '';
  });
  document.querySelectorAll('.parallax-layer.mobile').forEach(img => {
    img.style.display = 'none';
  });
};

const updateLayerPositions = () => {
  const centerX = mouseX / windowWidth - 0.5;
  const centerY = mouseY / windowHeight - 0.5;

  parallaxLayers.forEach(layer => {
    const isMobileLayer = layer.classList.contains('mobile');
    const speed = windowWidth <= 660 && isMobileLayer ? 0 : (Number(layer.dataset.speed) || 10);
    const translateX = centerX * speed;
    const translateY = centerY * speed;
    let extraX = 0;
    let extraY = 0;

    if (layer === layer4) {
      extraX = drift4.x;
      extraY = drift4.y;
    } else if (layer === layer3) {
      extraX = drift3.x * 0.5;
      extraY = drift3.y * 0.5;
    }

    layer.style.transform = `translate3d(calc(-50% + ${translateX + extraX}px), calc(-50% + ${translateY + extraY}px), 0)`;
  });

  animationFrame = requestAnimationFrame(updateLayerPositions);
};

let isDriftRunning = false;
let driftAnimationId = null;
let layerAnimationId = null;

const startDrift = () => {
  if (!layer4 || isDriftRunning) {
    return;
  }

  isDriftRunning = true;
  const driftLoop = () => {
    updateDrift();
    driftAnimationId = requestAnimationFrame(driftLoop);
  };

  driftAnimationId = requestAnimationFrame(driftLoop);
};

const stopDrift = () => {
  isDriftRunning = false;
  if (driftAnimationId) {
    cancelAnimationFrame(driftAnimationId);
    driftAnimationId = null;
  }
};

let isLayerUpdateRunning = false;

const startLayerUpdate = () => {
  if (isLayerUpdateRunning) return;
  isLayerUpdateRunning = true;
  layerAnimationId = requestAnimationFrame(updateLayerPositions);
};

const stopLayerUpdate = () => {
  isLayerUpdateRunning = false;
  if (layerAnimationId) {
    cancelAnimationFrame(layerAnimationId);
  }
};

const observerOptions = {
  root: null,
  rootMargin: '100px',
  threshold: 0.01
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      startDrift();
      startLayerUpdate();
    } else {
      stopDrift();
      stopLayerUpdate();
    }
  });
}, observerOptions);

const parallaxBg = document.querySelector('.parallax-bg');
if (parallaxBg) {
  observer.observe(parallaxBg);
  startDrift();
  startLayerUpdate();
}

window.addEventListener('mousemove', event => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

window.addEventListener('resize', () => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  window.PortfolioSlider?.refreshCurrentSliderLayout();
  window.PortfolioScrollUI?.updateScrollDownVisibility();
  window.PortfolioScrollUI?.updateProjectFrameHeaderLine();

  if (windowWidth <= 660) {
    switchImagesToMobile();
  } else {
    switchImagesToDesktop();
  }

  const particles = document.querySelectorAll('.parallax-layer.particle-layer');
  particles.forEach(pl => {
    if (pl.classList.contains('layer5')) window.createParticlesForLayer?.(pl, 130, 2, 8);
    else if (pl.classList.contains('layer6')) window.createParticlesForLayer?.(pl, 55, 1.2, 4);
  });
});

if (parallaxLayers.length > 0) {
  if (windowWidth <= 660) {
    switchImagesToMobile();
  } else {
    switchImagesToDesktop();
  }

  updateLayerPositions();
  startDrift();
}
