(function () {
  const DETAIL_SECTIONS = ['howItStarted', 'process', 'assets', 'finalResult'];
  const projects = window.LONG_TERM_PROJECTS || {};
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('project') || '01';
  const project = projects[projectId] || projects['01'];
  const contentEl = document.getElementById('projectContent');

  if (!contentEl || !project) return;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function collectProjectMedia(item) {
    if (item.gallery && item.gallery.length) {
      return item.gallery.map((entry) => ({
        type: 'image',
        src: entry.src,
        alt: entry.alt || item.name,
        layout: entry.layout || 'default',
        fit: entry.fit || 'cover',
        sectionTitle: entry.caption || ''
      }));
    }

    const seen = new Set();
    const media = [];

    const add = (entry, sectionTitle) => {
      if (!entry || !entry.src) return;
      if (seen.has(entry.src)) return;
      seen.add(entry.src);
      media.push({ ...entry, sectionTitle: sectionTitle || '' });
    };

    if (item.img) {
      add({ type: 'image', src: item.img, alt: item.name }, 'Hero');
    }

    DETAIL_SECTIONS.forEach((key) => {
      const section = item[key];
      if (!section) return;
      const title = section.title || key;
      if (section.media) section.media.forEach((entry) => add(entry, title));
      if (section.images) {
        section.images.forEach((src, index) => {
          add({ type: 'image', src, alt: `${title} ${index + 1}` }, title);
        });
      }
    });

    return media;
  }

  function galleryItemClass(entry) {
    const layout = entry.layout || 'default';
    const fitClass = entry.fit === 'contain' ? ' project-gallery__item--contain' : '';
    if (layout === 'wide') return 'project-gallery__item project-gallery__item--wide' + fitClass;
    if (layout === 'half') return 'project-gallery__item project-gallery__item--half' + fitClass;
    if (layout === 'third') return 'project-gallery__item project-gallery__item--third' + fitClass;
    if (layout === 'tall') return 'project-gallery__item project-gallery__item--tall' + fitClass;
    return 'project-gallery__item' + fitClass;
  }

  function renderGalleryItem(entry, index, total) {
    const alt = escapeHtml(entry.alt || project.name);
    const src = encodeURI(entry.src);
    const cls = galleryItemClass(entry);
    const caption = entry.sectionTitle
      ? `<figcaption class="project-gallery__caption">${escapeHtml(entry.sectionTitle)}</figcaption>`
      : '';

    let media = '';
    if (entry.type === 'video' || /\.(mp4|mov|webm)(\?|$)/i.test(entry.src)) {
      media = `<video autoplay loop muted playsinline preload="metadata"><source src="${src}" type="video/mp4"></video>`;
    } else {
      media = `<img src="${src}" alt="${alt}" loading="${index < 3 ? 'eager' : 'lazy'}" />`;
    }

    return `<figure class="${cls}">${media}${caption}</figure>`;
  }

  function renderGallery(media) {
    if (!media.length) {
      return `
        <figure class="project-gallery__item project-gallery__item--wide">
          <img src="${encodeURI(project.img)}" alt="${escapeHtml(project.name)}" loading="eager" />
        </figure>
      `;
    }
    return media.map((entry, i) => renderGalleryItem(entry, i, media.length)).join('');
  }

  function renderMetaItem(label, value, fullWidth) {
    if (!value) return '';
    return `
      <div class="project-meta__item${fullWidth ? ' project-meta__value--full' : ''}">
        <span class="project-meta__label">${escapeHtml(label)}</span>
        <span class="project-meta__value">${escapeHtml(value)}</span>
      </div>
    `;
  }

  function renderDisciplines(list) {
    if (!list || !list.length) return '';
    return `
      <div class="project-meta__item project-meta__value--full">
        <span class="project-meta__label">Disciplines</span>
        <div class="project-disciplines">
          ${list.map((d) => `<span class="project-discipline">${escapeHtml(d)}</span>`).join('')}
        </div>
      </div>
    `;
  }

  function renderMetaBlock(meta) {
    return `
      <dl class="project-meta">
        ${renderMetaItem('My Role', meta.role)}
        ${renderMetaItem('Timeline', meta.timeline)}
        ${renderMetaItem('Client', meta.client)}
        ${renderMetaItem('Industry', meta.industry)}
        ${meta.year ? renderMetaItem('Year', meta.year) : ''}
        ${renderMetaItem('Team', meta.team, true)}
        ${renderDisciplines(meta.disciplines)}
      </dl>
    `;
  }

  function renderListContent(items) {
    if (!items || !items.length) return '';
    return `
      <ul class="project-detail-list">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    `;
  }

  function renderOutcomesContent(items) {
    if (!items || !items.length) return '';
    return `
      <div class="project-outcomes">
        ${items.map((item) => `<div class="project-outcome">${escapeHtml(item)}</div>`).join('')}
      </div>
    `;
  }

  function renderAccordionItem(id, title, content, openByDefault) {
    if (!content || !String(content).trim()) return '';
    const isOpen = !!openByDefault;
    return `
      <div class="project-accordion__item${isOpen ? ' is-open' : ''}">
        <button
          type="button"
          class="project-accordion__trigger"
          aria-expanded="${isOpen}"
          aria-controls="accordion-panel-${id}"
          id="accordion-trigger-${id}"
        >
          <span class="project-accordion__label">${escapeHtml(title)}</span>
          <span class="project-accordion__icon" aria-hidden="true"></span>
        </button>
        <div
          class="project-accordion__panel"
          id="accordion-panel-${id}"
          role="region"
          aria-labelledby="accordion-trigger-${id}"
          aria-hidden="${isOpen ? 'false' : 'true'}"
        >
          <div class="project-accordion__content">
            ${content}
          </div>
        </div>
      </div>
    `;
  }

  function buildAccordionSections(item, meta) {
    const sections = [];
    let first = true;

    const push = (id, title, content) => {
      const html = renderAccordionItem(id, title, content, first);
      if (html) {
        sections.push(html);
        first = false;
      }
    };

    push('overview', 'Overview', `<p class="project-sidebar__overview">${escapeHtml(item.businessDescription || '')}</p>`);
    push('details', 'Project Details', renderMetaBlock(meta));
    push('challenge', 'The Challenge', `<p class="project-detail-block__text">${escapeHtml(getChallenge(item))}</p>`);

    const approach = getApproach(item);
    if (approach) {
      push('approach', 'Approach', `<p class="project-detail-block__text">${escapeHtml(approach)}</p>`);
    }

    push('process', 'Process Highlights', renderListContent(getProcessHighlights(item)));
    push('deliverables', 'Key Deliverables', renderListContent(getDeliverables(item)));
    push('outcomes', 'Impact & Outcomes', renderOutcomesContent(getOutcomes(item)));

    return sections.join('');
  }

  function initAccordion(container) {
    if (!container || container.dataset.bound === '1') return;
    container.dataset.bound = '1';

    const items = Array.from(container.querySelectorAll('.project-accordion__item'));

    const setPanelState = (item, open) => {
      const panel = item.querySelector('.project-accordion__panel');
      const trigger = item.querySelector('.project-accordion__trigger');
      if (!panel || !trigger) return;
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      item.classList.toggle('is-open', open);
    };

    items.forEach((item) => {
      const trigger = item.querySelector('.project-accordion__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const wasOpen = item.classList.contains('is-open');

        items.forEach((other) => setPanelState(other, false));

        if (!wasOpen) {
          setPanelState(item, true);
        }
      });
    });
  }

  function getProjectMeta(item) {
    const meta = item.meta || {};
    return {
      role: meta.role || 'Senior UX Lead & Consultant',
      timeline: meta.timeline || 'Long-term engagement',
      client: meta.client || item.name,
      industry: meta.industry || 'Digital Product',
      year: meta.year || '',
      team: meta.team || 'IS Experience House',
      disciplines: meta.disciplines || ['UX Strategy', 'Service Design', 'UI Design', 'Prototyping']
    };
  }

  function getChallenge(item) {
    if (item.challenge) return item.challenge;
    const started = item.howItStarted && item.howItStarted.content;
    return started && started[0] ? started[0] : item.businessDescription;
  }

  function getApproach(item) {
    if (item.approach) return item.approach;
    const process = item.process && item.process.content;
    if (process && process.length) return process.join(' ');
    return '';
  }

  function getDeliverables(item) {
    if (item.deliverables && item.deliverables.length) return item.deliverables;
    const assets = item.assets && item.assets.content;
    if (assets && assets.length) return assets;
    return [];
  }

  function getOutcomes(item) {
    if (item.outcomes && item.outcomes.length) return item.outcomes;
    const final = item.finalResult && item.finalResult.content;
    if (final && final.length) return final;
    return [];
  }

  function getProcessHighlights(item) {
    if (item.processHighlights && item.processHighlights.length) return item.processHighlights;
    const process = item.process && item.process.content;
    if (process && process.length) return process;
    return [];
  }

  const meta = getProjectMeta(project);
  const media = collectProjectMedia(project);
  const viewButton = project.liveSiteUrl
    ? `<a href="${escapeHtml(project.liveSiteUrl)}" class="project-view-button" target="_blank" rel="noopener noreferrer">View Live Product</a>`
    : '';

  contentEl.innerHTML = `
    <div class="project-layout">
      <div class="project-layout__left" aria-label="Project gallery">
        <div class="project-gallery">
          ${renderGallery(media)}
        </div>
      </div>

      <aside class="project-layout__right" aria-label="Project details">
        <div class="project-sidebar">
          <div class="project-sidebar__eyebrow">
            <span class="project-sidebar__number">Project ${escapeHtml(project.number || projectId)}</span>
            <span class="project-sidebar__divider" aria-hidden="true"></span>
            <span>Case Study</span>
          </div>

          <h1 class="project-sidebar__title">${escapeHtml(project.name)}</h1>
          ${project.tagline ? `<p class="project-sidebar__tagline">${escapeHtml(project.tagline)}</p>` : ''}

          <div class="project-accordion" id="projectAccordion">
            ${buildAccordionSections(project, meta)}
          </div>

          <div class="project-actions">
            ${viewButton}
            <a href="long-term.html" class="project-back-link">← All projects</a>
          </div>
        </div>
      </aside>
    </div>
  `;

  initAccordion(document.getElementById('projectAccordion'));

  document.title = `${project.name} — IS Experience House`;

  window.addEventListener('load', () => {
    ['.showreel', '.project-layout__left', '.project-layout__right', '.bottom-left'].forEach((selector) => {
      const el = document.querySelector(selector);
      if (el) el.classList.add('animate-in');
    });
  });
})();
