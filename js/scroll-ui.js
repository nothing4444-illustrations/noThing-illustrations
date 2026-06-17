const scrollDownAnimation = document.querySelector('.scroll-down-animation');
let scrollDownFrame = null;
const projectFrameHeaderLine = document.querySelector('.project-frame-header-line');
const projectFrameHeaderLineStraight = document.querySelector('#project-frame-header-line-straight');
const customScrollbarThumb = document.querySelector('.custom-scrollbar-thumb');
let customScrollbarFrame = null;

const updateScrollDownVisibility = () => {
  if (!scrollDownAnimation) {
    return;
  }

  const isHomeRoute = (window.location.hash.replace('#', '') || 'home') === 'home';

  if (!isHomeRoute) {
    scrollDownAnimation.classList.add('is-hidden');
    return;
  }

  if (window.scrollY <= 40) {
    scrollDownAnimation.classList.remove('is-hidden');
    return;
  }

  const rect = scrollDownAnimation.getBoundingClientRect();
  const hideThreshold = window.innerHeight * 0.5;
  const showThreshold = window.innerHeight * 0.68;

  if (rect.top <= hideThreshold) {
    scrollDownAnimation.classList.add('is-hidden');
    return;
  }

  if (rect.top >= showThreshold) {
    scrollDownAnimation.classList.remove('is-hidden');
    return;
  }

  scrollDownAnimation.classList.remove('is-hidden');
};

const updateProjectFrameHeaderLine = () => {
  if (!projectFrameHeaderLine || !projectFrameHeaderLineStraight) {
    return;
  }

  const renderedWidth = projectFrameHeaderLine.getBoundingClientRect().width;
  const viewBoxWidth = Math.max(1098, renderedWidth);
  const leftCurveEndX = 10.7752;
  const straightEndX = Math.max(leftCurveEndX, viewBoxWidth - 1);

  projectFrameHeaderLineStraight.setAttribute('d', `M${leftCurveEndX} 0.5H${straightEndX}`);
  projectFrameHeaderLine.setAttribute('viewBox', `0 0 ${viewBoxWidth} 12`);

  const gradient = projectFrameHeaderLine.querySelector('linearGradient');

  if (gradient) {
    gradient.setAttribute('x2', `${viewBoxWidth}`);
  }
};

const requestScrollDownVisibilityUpdate = () => {
  if (scrollDownFrame !== null) {
    return;
  }

  scrollDownFrame = requestAnimationFrame(() => {
    scrollDownFrame = null;
    updateScrollDownVisibility();
  });
};

const updateCustomScrollbar = () => {
  if (!customScrollbarThumb) {
    return;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const viewportHeight = window.innerHeight;
  const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  const maxScroll = Math.max(scrollHeight - viewportHeight, 1);
  const railHeight = Math.max(viewportHeight - 124, 1);
  const thumbHeight = 50;
  const travel = Math.max(railHeight - thumbHeight, 0);
  const thumbTop = (scrollTop / maxScroll) * travel;

  customScrollbarThumb.style.height = `${thumbHeight}px`;
  customScrollbarThumb.style.transform = `translateY(${thumbTop}px)`;
};

const requestCustomScrollbarUpdate = () => {
  if (customScrollbarFrame !== null) {
    return;
  }

  customScrollbarFrame = requestAnimationFrame(() => {
    customScrollbarFrame = null;
    updateCustomScrollbar();
  });
};

window.requestScrollDownVisibilityUpdate = requestScrollDownVisibilityUpdate;
window.requestCustomScrollbarUpdate = requestCustomScrollbarUpdate;

const isMobileScrollOptimize = () => window.innerWidth <= 768;
let lastScrollTime = 0;
const scrollThrottle = isMobileScrollOptimize() ? 100 : 16;

const throttledScrollUpdate = () => {
  const now = Date.now();
  if (now - lastScrollTime >= scrollThrottle) {
    lastScrollTime = now;
    requestScrollDownVisibilityUpdate();
    requestCustomScrollbarUpdate();
  }
};

window.addEventListener('load', updateScrollDownVisibility);
window.addEventListener('load', updateProjectFrameHeaderLine);
window.addEventListener('load', updateCustomScrollbar);
window.addEventListener('scroll', throttledScrollUpdate, { passive: true });
window.addEventListener('resize', requestCustomScrollbarUpdate);
document.fonts?.ready.then(updateScrollDownVisibility);
document.fonts?.ready.then(updateProjectFrameHeaderLine);
document.fonts?.ready.then(updateCustomScrollbar);

window.PortfolioScrollUI = {
  updateScrollDownVisibility,
  updateProjectFrameHeaderLine,
  requestScrollDownVisibilityUpdate,
  updateCustomScrollbar,
  requestCustomScrollbarUpdate,
};
