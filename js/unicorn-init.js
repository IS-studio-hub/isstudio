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
    return rect.width > 0 && rect.height > 0;
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

  window.loadUnicornStudio = function (options) {
    options = options || {};
    const version = options.version || 'v2.1.12';
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

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
      boot();
    }
  };
})();
