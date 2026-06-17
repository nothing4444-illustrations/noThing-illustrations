// Slider animation extracted from the simplified parallax script

(() => {
  const navLinks = document.querySelectorAll('nav .nav-link');
  const slider = document.querySelector('.slider');
  const activeSlide = slider?.querySelector('.slide1');

  if (!slider || !activeSlide || navLinks.length === 0) {
    return;
  }

  const slideTargets = {
    home: slider.querySelector('.slide1'),
    about: slider.querySelector('.slide2'),
    contact: slider.querySelector('.slide3'),
  };

  const slidePathStates = Object.fromEntries(
    Object.entries(slideTargets).map(([name, slide]) => [
      name,
      slide ? [...slide.querySelectorAll('path')].map((path) => path.getAttribute('d')) : [],
    ]),
  );

  const slideCenters = {
    home: 1219.82,
    about: 1473.4,
    contact: 1722.04,
  };

  slider.style.visibility = 'hidden';

  let slideAnimationFrame;
  let currentSlideNav = 'home';

  const easeInOutCubic = (progress) => (
    progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2
  );

  const getNavLink = (navName) => [...navLinks].find((link) => link.dataset.nav === navName);

  const getSliderScaleX = () => {
    if (!activeSlide) {
      return 1;
    }

    return activeSlide.getBoundingClientRect().width / 1920;
  };

  const getNavCenterX = (navName) => {
    const link = getNavLink(navName);

    if (!slider || !link) {
      return slideCenters[navName];
    }

    const sliderRect = slider.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const scaleX = getSliderScaleX();

    return ((linkRect.left + linkRect.width / 2) - sliderRect.left) / scaleX;
  };

  const setOrnamentTransform = (ornamentPaths, baseCenterX, targetCenterX) => {
    const scaleX = getSliderScaleX();
    const inverseScaleX = scaleX ? 1 / scaleX : 1;
    const transform = `translate(${targetCenterX} 0) scale(${inverseScaleX} 1) translate(${-baseCenterX} 0)`;

    ornamentPaths.forEach((path) => {
      path.setAttribute('transform', transform);
    });

    activeSlide
      ?.querySelector('linearGradient')
      ?.setAttribute('gradientTransform', transform);
  };

  const setGradientStops = (gradient, opacities) => {
    const stops = gradient ? [...gradient.querySelectorAll('stop')] : [];

    stops.forEach((stop, index) => {
      const opacity = opacities[index];

      if (opacity === null) {
        stop.removeAttribute('stop-opacity');
        return;
      }

      stop.setAttribute('stop-opacity', opacity);
    });
  };

  const updateSliderLineEnds = (activePaths, centerX) => {
    const leftLine = activePaths[5];
    const rightLine = activePaths[6];
    const gradients = activeSlide ? [...activeSlide.querySelectorAll('linearGradient')] : [];
    const leftGradient = gradients[1];
    const rightGradient = gradients[2];
    const scaleX = getSliderScaleX();
    const ornamentHalfWidth = scaleX ? 103.61 / scaleX : 103.61;
    const leftEndX = centerX - ornamentHalfWidth;
    const rightStartX = centerX + ornamentHalfWidth;

    leftLine.setAttribute('d', `M${leftEndX} 15V16H0V15H${leftEndX}Z`);
    rightLine.setAttribute('d', `M1920 15V16H${rightStartX}V15H1920Z`);

    if (leftGradient) {
      leftGradient.setAttribute('x1', '0');
      leftGradient.setAttribute('x2', leftEndX);
      setGradientStops(leftGradient, ['0', null, null, null]);
      leftLine.setAttribute('fill', `url(#${leftGradient.id})`);
    }

    if (rightGradient) {
      rightGradient.setAttribute('x1', rightStartX);
      rightGradient.setAttribute('x2', '1920');
      setGradientStops(rightGradient, [null, null, null, '0']);
      rightLine.setAttribute('fill', `url(#${rightGradient.id})`);
    }
  };

  const updateCurrentSliderLayout = () => {
    if (!activeSlide) {
      return;
    }

    const activePaths = [...activeSlide.querySelectorAll('path')];
    const ornamentPaths = activePaths.slice(0, 5);
    const centerX = getNavCenterX(currentSlideNav);

    setOrnamentTransform(ornamentPaths, slideCenters[currentSlideNav], centerX);
    updateSliderLineEnds(activePaths, centerX);
  };

  const morphSlideTo = (targetNav) => {
    const targetPathData = slidePathStates[targetNav];

    if (!activeSlide || !targetPathData?.length || targetNav === currentSlideNav) {
      return;
    }

    const activePaths = [...activeSlide.querySelectorAll('path')];
    const ornamentPaths = activePaths.slice(0, 5);

    if (activePaths.length !== targetPathData.length) {
      return;
    }

    const duration = 520;
    const startedAt = performance.now();
    const startX = getNavCenterX(currentSlideNav);
    const targetX = getNavCenterX(targetNav);
    const startBaseX = slideCenters[currentSlideNav];
    const translateX = targetX - startX;

    if (slideAnimationFrame) {
      cancelAnimationFrame(slideAnimationFrame);
    }

    const animate = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      const centerX = startX + translateX * easedProgress;

      setOrnamentTransform(ornamentPaths, startBaseX, centerX);
      updateSliderLineEnds(activePaths, centerX);

      if (progress < 1) {
        slideAnimationFrame = requestAnimationFrame(animate);
        return;
      }

      ornamentPaths.forEach((path) => {
        path.removeAttribute('transform');
      });

      activeSlide
        ?.querySelector('linearGradient')
        ?.removeAttribute('gradientTransform');

      activePaths.forEach((path, index) => {
        path.setAttribute('d', targetPathData[index]);
      });

      currentSlideNav = targetNav;
      updateCurrentSliderLayout();
      slideAnimationFrame = null;
    };

    slideAnimationFrame = requestAnimationFrame(animate);
  };

  const setSlideState = (targetNav) => {
    const targetPathData = slidePathStates[targetNav];

    if (!activeSlide || !targetPathData?.length) {
      return;
    }

    const activePaths = [...activeSlide.querySelectorAll('path')];

    if (activePaths.length !== targetPathData.length) {
      return;
    }

    activePaths.forEach((path, index) => {
      path.setAttribute('d', targetPathData[index]);
    });

    currentSlideNav = targetNav;
    updateCurrentSliderLayout();
  };

  const setActiveNav = (activeNav) => {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.nav === activeNav);
      link.style.color = '';
    });
  };

  const getNavFromPath = (path) => {
    const pageName = path.split('/').pop();

    if (pageName === 'about.html') {
      return 'about';
    }

    if (pageName === 'contact.html') {
      return 'contact';
    }

    return 'home';
  };

  const updatePageUrl = (link) => {
    const nextUrl = link.getAttribute('href');

    if (!nextUrl) {
      return;
    }

    history.pushState({ nav: link.dataset.nav }, '', nextUrl);
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();

      const targetNav = link.dataset.nav;
      const nextUrl = link.getAttribute('href');

      morphSlideTo(targetNav);
      setActiveNav(targetNav);

      if (!nextUrl) {
        return;
      }

      if (new URL(nextUrl, window.location.href).pathname === window.location.pathname) {
        updatePageUrl(link);
        return;
      }

      window.setTimeout(() => {
        window.location.href = nextUrl;
      }, 520);
    });
  });

  window.addEventListener('popstate', () => {
    const targetNav = getNavFromPath(window.location.pathname);

    morphSlideTo(targetNav);
    setActiveNav(targetNav);
  });

  window.addEventListener('resize', () => {
    updateCurrentSliderLayout();
  });

  const syncCurrentSliderLayout = () => {
    currentSlideNav = (window.getNavFromPath
      ? window.getNavFromPath(window.location.pathname)
      : getNavFromPath(window.location.pathname));
    setActiveNav(currentSlideNav);
    setSlideState(currentSlideNav);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        slider.style.visibility = '';
      });
    });
  };

  syncCurrentSliderLayout();

  window.addEventListener('pageshow', () => {
    syncCurrentSliderLayout();
  });

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      syncCurrentSliderLayout();
    });
  }
})();

