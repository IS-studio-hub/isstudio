(function () {
  /* Long-term brand partnerships — separate from website projects on work.html */
  const SLIDES = [
    {
      id: '01',
      name: 'HAVEN HOTELS',
      href: 'contact.html',
      img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80'
    },
    {
      id: '02',
      name: 'FIELD & CO',
      href: 'contact.html',
      img: 'https://images.unsplash.com/photo-1441984904996-e0b495a8b8a1?auto=format&fit=crop&w=2000&q=80'
    },
    {
      id: '03',
      name: 'SONIC ARTS',
      href: 'contact.html',
      img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2000&q=80'
    },
    {
      id: '04',
      name: 'MERIDIAN HEALTH',
      href: 'contact.html',
      img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=80'
    },
    {
      id: '05',
      name: 'ATLAS WORKS',
      href: 'contact.html',
      img: 'https://images.unsplash.com/photo-1497360404758-f9ca24cfb4d4?auto=format&fit=crop&w=2000&q=80'
    },
    {
      id: '06',
      name: 'LUMINA BEAUTY',
      href: 'contact.html',
      img: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8f0?auto=format&fit=crop&w=2000&q=80'
    }
  ];

  const root = document.getElementById('ltSlider');
  const slidesEl = document.getElementById('ltSlides');
  if (!root || !slidesEl || typeof gsap === 'undefined') return;

  const ease = 'power2.inOut';
  const titleEase = 'power2.inOut';
  const duration = 1.1;
  const titleDuration = 1;
  const titleStagger = 0.12;
  const count = SLIDES.length;

  let index = 0;
  let transitioning = false;

  const numbersWrap = document.querySelector('.lt-slider__numbers');
  const numbersEl = document.querySelector('.lt-slider__numbers-inner');
  const titleEl = document.querySelector('.lt-slider__title');
  const btnPrev = root.querySelector('.lt-slider__btn--prev');
  const btnNext = root.querySelector('.lt-slider__btn--next');

  const slideNodes = [];
  const titleNodes = [];

  function slideDigit(n) {
    return String(n);
  }

  function numberRowHeight() {
    return numbersWrap ? numbersWrap.offsetHeight : 0;
  }

  function buildSlides() {
    SLIDES.forEach((s, i) => {
      const item = document.createElement('article');
      item.className = 'lt-slider__slide';
      item.dataset.index = String(i);
      if (i === 0) item.classList.add('is-active');
      item.innerHTML =
        '<div class="lt-slider__img-wrap">' +
          '<img class="lt-slider__img" src="' + s.img + '" alt="' + s.name + '" loading="' + (i ? 'lazy' : 'eager') + '">' +
        '</div>';
      slidesEl.appendChild(item);
      slideNodes.push(item);

      const title = document.createElement('h2');
      title.className = 'lt-slider__title-item';
      title.dataset.index = String(i);
      title.innerHTML =
        '<a class="lt-slider__title-link" href="' + s.href + '">' +
          '<span class="lt-slider__title-text">' + s.name + '</span>' +
        '</a>';
      if (i !== 0) title.setAttribute('aria-hidden', 'true');
      titleNodes.push(title);
      titleEl.appendChild(title);

      const num = document.createElement('div');
      num.className = 'lt-slider__number-row';
      num.innerHTML =
        '<span class="lt-slider__number-static">(0</span>' +
        '<span class="lt-slider__number-digit">' + slideDigit(i + 1) + '</span>' +
        '<span class="lt-slider__number-static">)</span>';
      numbersEl.appendChild(num);
    });
  }

  function titleTextEl(titleItem) {
    return titleItem.querySelector('.lt-slider__title-text');
  }

  function resetTitleWords(titleItem) {
    const el = titleTextEl(titleItem);
    if (!el) return;
    const original = el.dataset.originalText;
    if (original) {
      el.innerHTML = original;
    } else {
      el.dataset.originalText = el.innerHTML;
    }
    const words = el.querySelectorAll('.lt-slider__title-word');
    if (words.length) gsap.set(words, { clearProps: 'transform' });
  }

  function animateTitleWords(titleItem, yStart, yEnd) {
    const el = titleTextEl(titleItem);
    if (!el) return;
    const original = el.dataset.originalText || el.textContent.trim();
    el.dataset.originalText = original;
    const words = original.trim().split(/\s+/);
    el.innerHTML = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'lt-slider__title-word';
      span.textContent = word;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      gsap.fromTo(
        span,
        { yPercent: yStart },
        {
          yPercent: yEnd,
          duration: titleDuration,
          ease: titleEase,
          delay: i * titleStagger
        }
      );
    });
  }

  function updateNumbers(immediate) {
    const y = -index * numberRowHeight();
    if (immediate) {
      gsap.set(numbersEl, { y: y, force3D: true });
      return;
    }
    gsap.to(numbersEl, {
      y: y,
      duration: 0.8,
      ease: 'power2.inOut',
      overwrite: true
    });
  }

  function resetSlideTransforms(slide) {
    const wrap = slide.querySelector('.lt-slider__img-wrap');
    const img = slide.querySelector('.lt-slider__img');
    if (wrap && img) gsap.set([wrap, img], { xPercent: 0 });
  }

  function setTitleStack(activeIndex, prevIndex, nextIndex) {
    titleNodes.forEach((el, n) => {
      const isActive = n === activeIndex;
      const isAnimating = prevIndex != null && nextIndex != null && (n === prevIndex || n === nextIndex);
      const isIncoming = nextIndex != null && n === nextIndex;

      el.classList.toggle('is-active', isActive && !isAnimating);
      el.classList.toggle('is-animating', isAnimating);
      el.setAttribute('aria-hidden', isActive || isAnimating ? 'false' : 'true');

      if (isAnimating) {
        el.style.zIndex = isIncoming ? '2' : '1';
      } else if (isActive) {
        el.style.zIndex = '2';
      } else {
        el.style.zIndex = '0';
        gsap.set(el, { clearProps: 'opacity,transform,y' });
      }
    });
  }

  function setTitleVisibility(activeIndex) {
    setTitleStack(activeIndex, null, null);
  }

  function setActive(i) {
    index = (i + count) % count;

    slideNodes.forEach((el, n) => {
      el.classList.toggle('is-active', n === index);
      el.style.display = n === index ? 'block' : 'none';
      if (n !== index) resetSlideTransforms(el);
    });

    titleNodes.forEach((el) => resetTitleWords(el));
    setTitleVisibility(index);
    updateNumbers(true);
    root.setAttribute('data-slide', String(index + 1));
  }

  function changeSlide(nextIndex, forward) {
    if (transitioning) return;
    const prevIndex = index;
    if (prevIndex === nextIndex) return;

    transitioning = true;
    const prevSlide = slideNodes[prevIndex];
    const nextSlide = slideNodes[nextIndex];
    const prevTitle = titleNodes[prevIndex];
    const nextTitle = titleNodes[nextIndex];
    const move = forward ? 100 : -100;

    const prevWrap = prevSlide.querySelector('.lt-slider__img-wrap');
    const prevImg = prevSlide.querySelector('.lt-slider__img');
    const nextWrap = nextSlide.querySelector('.lt-slider__img-wrap');
    const nextImg = nextSlide.querySelector('.lt-slider__img');

    prevSlide.style.display = 'block';
    nextSlide.style.display = 'block';

    setTitleStack(nextIndex, prevIndex, nextIndex);

    resetTitleWords(prevTitle);
    resetTitleWords(nextTitle);

    index = nextIndex;
    updateNumbers(false);

    const tl = gsap.timeline({
      onComplete: () => {
        resetSlideTransforms(prevSlide);
        titleNodes.forEach((el) => resetTitleWords(el));
        setActive(nextIndex);
        transitioning = false;
      }
    });

    tl.call(() => animateTitleWords(prevTitle, 0, move * -1), null, 0);
    tl.call(() => animateTitleWords(nextTitle, move, 0), null, 0);
    tl.fromTo(prevWrap, { xPercent: 0 }, { xPercent: move * -1, duration, ease }, 0);
    tl.fromTo(prevImg, { xPercent: 0 }, { xPercent: move, duration, ease }, 0);
    tl.fromTo(nextWrap, { xPercent: move }, { xPercent: 0, duration, ease }, 0);
    tl.fromTo(nextImg, { xPercent: move * -1 }, { xPercent: 0, duration, ease }, 0);
  }

  function step(forward) {
    changeSlide((index + (forward ? 1 : -1) + count) % count, forward);
  }

  btnPrev.addEventListener('click', () => step(false));
  btnNext.addEventListener('click', () => step(true));

  window.addEventListener('wheel', (e) => {
    if (transitioning) return;
    if (Math.abs(e.deltaY) < 8) return;
    e.preventDefault();
    step(e.deltaY > 0);
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(true); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(false); }
  });

  buildSlides();
  setActive(0);

  if (numbersWrap) {
    gsap.set(numbersWrap, {
      clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)'
    });
    gsap.to(numbersWrap, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 1,
      ease: 'power2.out',
      delay: 0.2
    });
  }

  titleNodes.forEach((titleItem) => {
    const text = titleTextEl(titleItem);
    if (text) text.dataset.originalText = text.textContent.trim();
  });

  const firstTitle = titleTextEl(titleNodes[0]);
  if (firstTitle) {
    titleNodes[0].style.zIndex = '2';
    animateTitleWords(titleNodes[0], 100, 0);
  }

  window.addEventListener('resize', () => updateNumbers(true));

  gsap.to(root.querySelector('.lt-slider__nav-line'), {
    scaleX: 1,
    duration: 1.2,
    ease: 'power2.out',
    delay: 0.35
  });
})();
