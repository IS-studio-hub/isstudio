(function () {
  function isVisibleUnicornHost(el) {
    if (!el || !el.isConnected) return false;

    let node = el;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      node = node.parentElement;
    }

    const rect = el.getBoundingClientRect();
    return rect.width >= 2 && rect.height >= 2;
  }

  function disableHiddenScenes() {
    document.querySelectorAll('[data-us-project]').forEach(function (el) {
      if (isVisibleUnicornHost(el)) return;
      el.removeAttribute('data-us-project');
      el.setAttribute('data-us-project-disabled', '');
    });
  }

  function hasVisibleScenes() {
    return document.querySelectorAll('[data-us-project]').length > 0;
  }

  function whenLayoutReady(fn) {
    function run() {
      requestAnimationFrame(function () {
        requestAnimationFrame(fn);
      });
    }

    if (document.readyState === 'complete') {
      run();
    } else {
      window.addEventListener('load', run, { once: true });
    }
  }

  window.loadUnicornStudio = function (options) {
    options = options || {};
    const version = options.version || 'v2.1.12';
    const skipBelow = options.skipBelow || null;
    const onReady = typeof options.onReady === 'function' ? options.onReady : null;

    function init() {
      if (!window.UnicornStudio || typeof window.UnicornStudio.init !== 'function') return;
      if (!window.UnicornStudio.isInitialized) {
        window.UnicornStudio.init();
        window.UnicornStudio.isInitialized = true;
      }
      if (onReady) onReady();
    }

    function boot() {
      if (skipBelow && window.matchMedia('(max-width: ' + skipBelow + 'px)').matches) {
        disableHiddenScenes();
        return;
      }

      disableHiddenScenes();
      if (!hasVisibleScenes()) return;

      if (window.UnicornStudio && typeof window.UnicornStudio.init === 'function') {
        init();
        return;
      }

      window.UnicornStudio = window.UnicornStudio || { isInitialized: false };
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@' + version + '/dist/unicornStudio.umd.js';
      script.onload = init;
      (document.head || document.body).appendChild(script);
    }

    whenLayoutReady(boot);
  };
})();
