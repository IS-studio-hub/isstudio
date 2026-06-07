/**
 * Utopia Tokyo–style cc-intro animations (glitch, scramble, kanji draw).
 * Adapted from https://www.utopiatokyo.com/ interaction patterns.
 */
(function () {
  const intro = document.querySelector('.cc-intro');
  if (!intro || typeof gsap === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const plugins = [window.ScrollTrigger, window.ScrambleTextPlugin, window.DrawSVGPlugin].filter(Boolean);
  if (plugins.length) gsap.registerPlugin(...plugins);

  const scroller = document.querySelector('.screen');
  let scrollContextReady = false;

  function elementIsScrollContainer(el) {
    if (!el || el.scrollHeight <= el.clientHeight + 2) return false;
    const oy = getComputedStyle(el).overflowY;
    return oy === 'auto' || oy === 'scroll' || oy === 'overlay';
  }

  function initScrollContext() {
    if (!window.ScrollTrigger || scrollContextReady) return;
    const screenEl = scroller || document.querySelector('.screen');

    if (screenEl && elementIsScrollContainer(screenEl)) {
      ScrollTrigger.scrollerProxy(screenEl, {
        scrollTop(value) {
          if (arguments.length) screenEl.scrollTop = value;
          return screenEl.scrollTop;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: screenEl.clientWidth,
            height: window.innerHeight,
          };
        },
      });
      ScrollTrigger.defaults({ scroller: screenEl });
      screenEl.addEventListener('scroll', ScrollTrigger.update, { passive: true });
    } else {
      ScrollTrigger.defaults({ scroller: window });
    }

    scrollContextReady = true;
  }

  function initDrawSvgOnScroll() {
    if (!window.DrawSVGPlugin || !window.ScrollTrigger) return;
    const items = intro.querySelectorAll('.intro__kanji-item');
    items.forEach((item) => {
      const svg = item.querySelector('.intro__kanji-svg');
      if (!svg) return;
      const isFilled = svg.classList.contains('intro__kanji-svg--filled');
      const fillShape = isFilled ? svg.querySelector('.intro__kanji-svg__fill') : null;
      const shapes = Array.from(
        svg.querySelectorAll(
          isFilled
            ? '.intro__kanji-svg__draw'
            : 'path, line, polyline, polygon, circle, rect, ellipse'
        )
      ).filter((el) => {
        const stroke = el.getAttribute('stroke');
        return !(stroke && stroke.toLowerCase() === 'none');
      });
      if (!shapes.length) return;

      const durationMs = Math.max(0, parseFloat(svg.getAttribute('data-draw-duration')) || 1200);
      const duration = durationMs / 1000;

      if (reducedMotion) {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.set(shapes, { drawSVG: '0% 100%', opacity: isFilled ? 0 : 1 });
            if (fillShape) gsap.set(fillShape, { opacity: 1 });
          },
        });
        return;
      }

      gsap.set(shapes, { drawSVG: '0% 0%', opacity: 1 });
      if (fillShape) {
        fillShape.setAttribute('fill', 'currentColor');
        gsap.set(fillShape, { opacity: 0 });
      }
      const lengths = shapes.map((s) => {
        try {
          return typeof s.getTotalLength === 'function' ? s.getTotalLength() : 0;
        } catch {
          return 0;
        }
      });
      const total = lengths.reduce((a, b) => a + b, 0) || 1;
      const tl = gsap.timeline({ paused: true });
      let offset = 0;
      shapes.forEach((shape, i) => {
        const seg = total > 0 ? (lengths[i] / total) * duration : duration / shapes.length;
        tl.to(shape, { drawSVG: '0% 100%', duration: Math.max(0.01, seg), ease: 'none' }, offset);
        offset += Math.max(0.01, seg);
      });
      if (fillShape) {
        tl.to(fillShape, { opacity: 1, duration: 0.35, ease: 'power2.out' }, '-=0.15');
        tl.to(
          shapes,
          {
            opacity: 0,
            duration: 0.2,
            ease: 'power1.out',
            onComplete: () => {
              fillShape.setAttribute('fill', 'currentColor');
              gsap.set(fillShape, { opacity: 1 });
              gsap.set(shapes, { opacity: 0 });
            },
          },
          '<'
        );
      }
      ScrollTrigger.create({
        trigger: item,
        start: 'top 85%',
        once: true,
        onEnter: () => tl.play(0),
        onEnterBack: () => tl.play(0),
      });
    });
  }

  function initGlitchEffects() {
    if (!window.ScrollTrigger || reducedMotion) return;

    const scrollSelector = '.cc-intro [data-glitch="scroll"]';
    const config = {
      intensity: 1,
      minInterval: 1.6,
      maxInterval: 5,
      burstMin: 0.1,
      burstMax: 0.26,
      enableArtifacts: true,
      artifactsMax: 2,
      artifactsInset: 20,
      maxConcurrent: 2,
    };

    const rand = gsap.utils.random;
    const pool = new WeakMap();
    let activeBursts = 0;

    const canBurst = () => activeBursts < config.maxConcurrent && (activeBursts += 1, true);
    const releaseBurst = () => {
      activeBursts = Math.max(0, activeBursts - 1);
    };

    const resetVars = (el) => {
      gsap.set(el, { '--gx': '0px', '--gy': '0px', '--sliceTop': '0%', '--sliceBottom': '0%', '--gOpacity': 1 });
    };

    const getArtifacts = (host) => {
      let node = host.querySelector(':scope > .glitch-artifacts');
      if (!node) {
        node = document.createElement('div');
        node.className = 'glitch-artifacts';
        node.style.inset = `${-config.artifactsInset}px`;
        host.appendChild(node);
      }
      return node;
    };

    const clearArtifacts = (layer) => {
      if (layer) layer.innerHTML = '';
    };

    const spawnArtifacts = (layer) => {
      if (!layer) return;
      layer.innerHTML = '';
      const count = Math.floor(rand(0, config.artifactsMax + 1));
      const frag = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const bar = document.createElement('div');
        bar.className = 'artifact';
        const w = rand(20, 220);
        const h = rand(2, 22);
        const d = rand(0, 1);
        const color = d < 0.33 ? '#ff2a2a' : d < 0.66 ? '#00f3ff' : '#f7e491';
        bar.style.cssText = `width:${w}px;height:${h}px;left:${rand(0, 100)}%;top:${rand(0, 100)}%;background-color:${color};transform:translate3d(${rand(-28, 28)}px,0,0);opacity:0.85;`;
        frag.appendChild(bar);
      }
      layer.appendChild(frag);
    };

    const resolveTarget = (host) => {
      if (host.dataset.glitchTarget) {
        const inner = host.querySelector(host.dataset.glitchTarget);
        if (inner) return inner;
      }
      if (host.tagName === 'svg' || host.tagName === 'SVG') return host;
      return host.querySelector('svg') || host;
    };

    const register = (host) => {
      if (pool.has(host)) return pool.get(host);

      const target = resolveTarget(host);
      target.classList.add('glitch-target');
      const artifacts = config.enableArtifacts ? getArtifacts(host) : null;
      let timer = null;
      let timeline = null;
      let stopped = false;

      const schedule = () => {
        if (stopped) return;
        timer = setTimeout(burst, rand(config.minInterval, config.maxInterval) * 1000);
      };

      const burst = () => {
        if (stopped) return;
        if (!canBurst()) {
          timer = setTimeout(burst, rand(0.2, 0.6) * 1000);
          return;
        }
        if (timeline) timeline.kill();
        const dur = rand(config.burstMin, config.burstMax);
        const steps = Math.max(6, Math.floor(dur / 0.028));
        const step = dur / steps;
        timeline = gsap.timeline({
          onComplete() {
            timeline = null;
            resetVars(host);
            clearArtifacts(artifacts);
            releaseBurst();
            schedule();
          },
        });

        for (let i = 0; i < steps; i++) {
          const slice = rand(0, 1) > 0.35;
          timeline.set(
            host,
            {
              '--gx': `${rand(-4, 4)}px`,
              '--gy': `${rand(-2, 2)}px`,
              '--gOpacity': rand(0.62, 1),
              '--sliceTop': slice ? `${rand(0, 85)}%` : '0%',
              '--sliceBottom': slice ? `${Math.max(0, 100 - rand(8, 32))}%` : '0%',
            },
            i * step
          );
          if (artifacts && rand(0, 1) > 0.45) {
            timeline.call(() => spawnArtifacts(artifacts), null, i * step);
          }
        }
        timeline.set(host, { '--sliceTop': '0%', '--sliceBottom': '0%' }, dur);
      };

      const start = () => {
        stopped = false;
        resetVars(host);
        schedule();
      };

      const stop = () => {
        stopped = true;
        if (timer) clearTimeout(timer);
        timer = null;
        if (timeline) timeline.kill();
        timeline = null;
        resetVars(host);
        clearArtifacts(artifacts);
      };

      const api = { host, target, start, stop, burst };
      pool.set(host, api);
      return api;
    };

    intro.querySelectorAll('[data-glitch="scroll"]').forEach((el) => {
      const api = register(el);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: () => api.start(),
        onEnterBack: () => api.start(),
        onLeave: () => api.stop(),
        onLeaveBack: () => api.stop(),
      });
    });
  }

  function initScrambleFX() {
    if (!window.ScrambleTextPlugin || !window.SplitText || !window.ScrollTrigger) return;

    intro.querySelectorAll('[data-scramble="scroll"]').forEach((el) => {
      if (reducedMotion) {
        el.style.visibility = 'visible';
        return;
      }
      const duration = parseFloat(el.getAttribute('data-scramble-duration')) || 1.4;
      const stagger = parseFloat(el.getAttribute('data-scramble-stagger')) || 0.015;
      const speed = parseFloat(el.getAttribute('data-scramble-speed')) || 0.95;
      gsap.set(el, { visibility: 'hidden' });
      const split = new SplitText(el, { type: 'words, chars', wordsClass: 'word', charsClass: 'char' });
      gsap.set(el, { visibility: 'visible' });
      ScrollTrigger.create({
        trigger: el,
        start: el.getAttribute('data-scramble-start') || 'top 88%',
        once: true,
        onEnter() {
          gsap.to(split.words, {
            duration,
            stagger,
            ease: 'power2.out',
            scrambleText: { text: '{original}', chars: 'upperCase', speed },
            onComplete: () => split.revert(),
          });
        },
      });
    });
  }

  let refreshTimer;

  function refreshIntro() {
    if (!window.ScrollTrigger) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(true), 120);
  }

  function boot() {
    initScrollContext();
    initDrawSvgOnScroll();
    initGlitchEffects();
    initScrambleFX();
    refreshIntro();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('load', refreshIntro);
  window.addEventListener('resize', refreshIntro);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', refreshIntro);
  }

  window.refreshCcIntro = refreshIntro;
})();
