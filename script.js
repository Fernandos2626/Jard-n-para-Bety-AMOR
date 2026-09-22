(function () {
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
     CONFIG: fotografías
     Para agregar/quitar/reordenar fotos, edita SOLO este arreglo.
     No hace falta tocar el HTML. Si un archivo no existe, esa
     tarjeta simplemente se oculta y el resto de la página sigue
     funcionando con normalidad.
  ========================================================= */
  var PHOTOS = [
    { src: 'assets/images/foto-01.jpg', alt: 'Fernando y Bety juntos', caption: 'De todos los lugares que existen, qué bonito coincidir contigo.' },
    { src: 'assets/images/foto-02.jpg', alt: 'Fernando y Bety en un viaje', caption: '' },
    { src: 'assets/images/foto-03.jpg', alt: 'Manos de Fernando y Bety', caption: 'Hay recuerdos que uno quisiera guardar para siempre.' },
    { src: 'assets/images/foto-04.jpg', alt: 'Fernando y Bety una noche especial', caption: '' },
    { src: 'assets/images/foto-05.jpg', alt: 'Fernando y Bety sonriendo', caption: '' }
  ];

  function renderPhotoGrid() {
    var grid = document.getElementById('foto-grid');
    if (!grid) return;
    PHOTOS.forEach(function (photo) {
      var card = document.createElement('div');
      card.className = 'foto-card reveal';

      var img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';

      img.addEventListener('error', function () {
        card.innerHTML = '';
        var missing = document.createElement('div');
        missing.className = 'foto-missing';
        missing.textContent = 'Coloca aquí: ' + photo.src;
        card.appendChild(missing);
      });

      card.appendChild(img);

      if (photo.caption) {
        var cap = document.createElement('p');
        cap.className = 'foto-caption';
        cap.textContent = photo.caption;
        card.appendChild(cap);
      }

      grid.appendChild(card);

      if (photo.caption && photo.caption.length > 0 && grid.children.length % 2 === 0) {
        // línea narrativa entre pares de fotos (opcional, sutil)
      }
    });
    // re-observar los nuevos elementos .reveal generados dinámicamente
    observeReveals(grid.querySelectorAll('.reveal'));
  }

  /* =========================================================
     FLORES: variedad de tipos en SVG (sin archivos externos)
  ========================================================= */
  var PALETTE = ['#f6c945', '#f3d488', '#e8b84b', '#ffd966'];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rand(min, max) { return min + Math.random() * (max - min); }

  function svgWrap(inner, vb) {
    return '<svg viewBox="' + vb + '" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }

  // Girasol: centro grande, muchos pétalos alargados
  function sunflowerSVG(c) {
    var petals = '';
    for (var i = 0; i < 14; i++) {
      var a = (360 / 14) * i;
      petals += '<ellipse cx="0" cy="-15" rx="4.2" ry="11" fill="' + c + '" transform="rotate(' + a + ')"/>';
    }
    return svgWrap(
      '<g transform="translate(30,30)">' + petals +
      '<circle r="10" fill="#8a5a1e"/>' +
      '<circle r="10" fill="none" stroke="#6e461a" stroke-width="0.6" stroke-dasharray="1.4 1.4"/>' +
      '</g>', '0 0 60 60');
  }

  // Margarita amarilla: pétalos ovalados finos, centro pequeño
  function daisySVG(c) {
    var petals = '';
    for (var i = 0; i < 10; i++) {
      var a = (360 / 10) * i;
      petals += '<ellipse cx="0" cy="-10" rx="2.6" ry="8.5" fill="' + c + '" transform="rotate(' + a + ')"/>';
    }
    return svgWrap(
      '<g transform="translate(24,24)">' + petals +
      '<circle r="5.5" fill="#c98b1f"/>' +
      '</g>', '0 0 48 48');
  }

  // Flor silvestre pequeña: 5-6 pétalos redondos delicados
  function wildflowerSVG(c) {
    var n = 6;
    var petals = '';
    for (var i = 0; i < n; i++) {
      var a = (360 / n) * i;
      petals += '<circle cx="0" cy="-6.5" r="3.6" fill="' + c + '" transform="rotate(' + a + ')"/>';
    }
    return svgWrap(
      '<g transform="translate(16,16)">' + petals +
      '<circle r="2.6" fill="#a9711e"/>' +
      '</g>', '0 0 32 32');
  }

  // Ranúnculo: pétalos redondeados superpuestos, aspecto lustroso
  function buttercupSVG(c) {
    var n = 8;
    var petals = '';
    for (var i = 0; i < n; i++) {
      var a = (360 / n) * i;
      petals += '<ellipse cx="0" cy="-7" rx="5.2" ry="7.4" fill="' + c + '" opacity="0.95" transform="rotate(' + a + ')"/>';
    }
    return svgWrap(
      '<g transform="translate(22,22)">' + petals +
      '<circle r="4.4" fill="#d99a1f"/>' +
      '</g>', '0 0 44 44');
  }

  // Ramita de pétalos sueltos (relleno de profundidad)
  function petalSprigSVG(c) {
    return svgWrap(
      '<g transform="translate(12,12)">' +
      '<ellipse cx="-4" cy="0" rx="4" ry="7" fill="' + c + '" transform="rotate(-20)"/>' +
      '<ellipse cx="4" cy="2" rx="3.4" ry="6" fill="' + c + '" opacity="0.85" transform="rotate(25)"/>' +
      '</g>', '0 0 24 24');
  }

  // Tallo con hoja (para dar base a algunas flores grandes)
  function stemLeafSVG() {
    return '<path d="M12 44 L12 18" stroke="#7c9473" stroke-width="2" fill="none"/>' +
      '<path d="M12 30 C 4 28, 2 20, 6 16 C 10 20, 12 26, 12 30 Z" fill="#8fa885"/>';
  }

  var FLOWER_MAKERS = [sunflowerSVG, daisySVG, wildflowerSVG, buttercupSVG, petalSprigSVG];

  /* =========================================================
     "ALFOMBRA" DE FLORES: patrón repetible (miles visuales, 0 costo)
     En vez de crear miles de elementos animados (lo cual sí haría
     lenta la página en el teléfono), generamos UNA sola imagen SVG
     con muchas flores pequeñas y la repetimos como fondo. El
     navegador la repite gratis, así que da la sensación de un
     campo interminable sin afectar el rendimiento.
  ========================================================= */
  function miniFlowerMarkup(color, variant) {
    if (variant === 0) {
      // florecita de 5 pétalos
      var petals = '';
      for (var i = 0; i < 5; i++) {
        petals += '<ellipse cx="0" cy="-4.2" rx="2.1" ry="4.4" fill="' + color + '" transform="rotate(' + (i * 72) + ')"/>';
      }
      return petals + '<circle r="1.6" fill="#c98b1f"/>';
    } else if (variant === 1) {
      // punto/capullo pequeño
      return '<circle r="2.6" fill="' + color + '"/><circle r="1.1" fill="#c98b1f"/>';
    } else {
      // pétalo suelto
      return '<ellipse cx="0" cy="0" rx="2.6" ry="4.6" fill="' + color + '" opacity="0.9"/>';
    }
  }

  function buildMeadowTileURI(px, count) {
    var shapes = '';
    for (var i = 0; i < count; i++) {
      var x = rand(0, px);
      var y = rand(0, px);
      var scale = rand(0.6, 1.5);
      var rot = rand(0, 360);
      var color = pick(PALETTE);
      var variant = Math.floor(rand(0, 3));
      shapes += '<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + rot.toFixed(0) + ') scale(' + scale.toFixed(2) + ')">' +
        miniFlowerMarkup(color, variant) + '</g>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + px + '" height="' + px + '" viewBox="0 0 ' + px + ' ' + px + '">' + shapes + '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  function applyMeadow(el, opts) {
    if (!el) return;
    opts = opts || {};
    var tile = buildMeadowTileURI(opts.tilePx || 180, opts.count || 20);
    el.style.backgroundImage = tile;
    el.style.backgroundRepeat = 'repeat';
    el.style.backgroundSize = (opts.tileSize || 180) + 'px';
    if (opts.opacity !== undefined) el.style.opacity = opts.opacity;
  }

  /**
   * Genera un campo de flores dentro del contenedor dado.
   * opts: { count, sizeMin, sizeMax, withStems, edgeBleed }
   */
  function growFlowerField(containerId, opts) {
    var host = document.getElementById(containerId);
    if (!host || host.dataset.grown) return;
    host.dataset.grown = '1';

    opts = opts || {};
    var count = reduceMotion ? Math.max(4, Math.round((opts.count || 14) * 0.35)) : (opts.count || 14);
    var sizeMin = opts.sizeMin || 20;
    var sizeMax = opts.sizeMax || 46;
    var edgeBleed = opts.edgeBleed || 6; // % que puede salirse del borde

    for (var i = 0; i < count; i++) {
      (function (i) {
        var delay = reduceMotion ? 0 : i * (opts.stagger || 55);
        setTimeout(function () {
          var el = document.createElement('div');
          el.className = 'flower-el';
          var size = rand(sizeMin, sizeMax);
          var isBack = Math.random() < 0.4;
          var maker = pick(FLOWER_MAKERS);
          var color = pick(PALETTE);

          el.style.width = size + 'px';
          el.style.height = size + 'px';
          el.style.left = rand(-edgeBleed, 100 - (size / 8)) + '%';
          var vSpread = opts.vSpread || [60, 96];
          el.style.top = rand(vSpread[0], vSpread[1]) + '%';
          el.style.setProperty('--rot', rand(-22, 22) + 'deg');
          el.style.setProperty('--op', isBack ? rand(0.45, 0.7) : rand(0.85, 1));
          if (isBack) { el.style.filter = 'blur(0.4px)'; }
          el.style.zIndex = isBack ? 1 : 2;

          el.innerHTML = maker(color);
          host.appendChild(el);
        }, delay);
      })(i);
    }
  }

  /* =========================================================
     Pétalos cayendo (capa global, sutil)
  ========================================================= */
  function initFallingPetals() {
    var layer = document.getElementById('petal-layer');
    if (!layer) return;
    var count = reduceMotion ? 4 : 16;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('div');
      p.className = 'falling-petal';
      var size = rand(7, 13);
      p.style.width = size + 'px';
      p.style.height = size * 1.2 + 'px';
      p.style.left = rand(0, 100) + 'vw';
      p.style.background = pick(PALETTE);
      p.style.setProperty('--drift', rand(-40, 40) + 'px');
      p.style.animationDuration = rand(14, 26) + 's';
      p.style.animationDelay = rand(0, 20) + 's';
      layer.appendChild(p);
    }
  }

  /* =========================================================
     Pantalla de entrada + música ambiental
  ========================================================= */
  function initGateAndMusic() {
    var gate = document.getElementById('gate');
    var btn = document.getElementById('btn-entrar');
    var audio = document.getElementById('audio');
    var toggle = document.getElementById('music-toggle');

    if (!btn) return;

    btn.addEventListener('click', function () {
      gate.classList.add('hidden');
      document.body.style.overflow = 'auto';
      growFlowerField('field-intro', { count: 28, sizeMin: 22, sizeMax: 52, vSpread: [30, 98], edgeBleed: 8, stagger: 35 });

      if (audio) {
        var playPromise = audio.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            // El navegador bloqueó el audio incluso tras el toque;
            // el control de música seguirá disponible para iniciarlo manualmente.
          });
        }
      }
      if (toggle) toggle.classList.add('show');
    }, { once: true });

    if (toggle && audio) {
      toggle.addEventListener('click', function () {
        if (audio.paused) {
          audio.play().catch(function () {});
        } else {
          audio.pause();
        }
      });
      audio.addEventListener('play', function () { toggle.textContent = '🔊'; });
      audio.addEventListener('pause', function () { toggle.textContent = '🔈'; });
    }
  }

  /* =========================================================
     Reveal on scroll
  ========================================================= */
  var io = null;
  function getObserver() {
    if (io || !('IntersectionObserver' in window)) return io;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    return io;
  }

  function observeReveals(nodeList) {
    var observer = getObserver();
    if (!observer) {
      nodeList.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    nodeList.forEach(function (el) { observer.observe(el); });
  }

  function initReveal() {
    observeReveals(document.querySelectorAll('#intro .reveal, #antes-carta .reveal, #carta .reveal, #fotos > .container > .reveal, #final .reveal'));

    var sections = [
      { id: 'fotos', field: 'field-fotos', opts: { count: 34, sizeMin: 16, sizeMax: 40, vSpread: [2, 100], edgeBleed: 10, stagger: 25 } },
      { id: 'final', field: 'field-final', opts: { count: 46, sizeMin: 22, sizeMax: 58, vSpread: [35, 100], edgeBleed: 10, stagger: 20 } }
    ];

    sections.forEach(function (s) {
      var sectionEl = document.getElementById(s.id);
      if (!sectionEl) return;
      if (!('IntersectionObserver' in window)) {
        growFlowerField(s.field, s.opts);
        return;
      }
      var fio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            growFlowerField(s.field, s.opts);
            fio.disconnect();
          }
        });
      }, { threshold: 0.12 });
      fio.observe(sectionEl);
    });
  }

  /* =========================================================
     Init
  ========================================================= */
  document.addEventListener('DOMContentLoaded', function () {
    document.body.style.overflow = 'hidden';

    // Alfombra de fondo: una capa fija y sutil detrás de TODA la página,
    // más una capa más densa dentro del jardín final.
    applyMeadow(document.getElementById('meadow-global'), { tilePx: 170, count: 22, tileSize: 170, opacity: 0.4 });
    applyMeadow(document.getElementById('meadow-gate'), { tilePx: 150, count: 18, tileSize: 150, opacity: 0.55 });
    applyMeadow(document.getElementById('meadow-intro'), { tilePx: 160, count: 20, tileSize: 160, opacity: 0.5 });
    applyMeadow(document.getElementById('meadow-fotos'), { tilePx: 150, count: 24, tileSize: 150, opacity: 0.45 });
    applyMeadow(document.getElementById('meadow-final'), { tilePx: 140, count: 30, tileSize: 140, opacity: 0.65 });

    growFlowerField('field-gate', { count: 16, sizeMin: 16, sizeMax: 34, vSpread: [55, 100], edgeBleed: 8, stagger: 55 });
    initFallingPetals();
    renderPhotoGrid();
    initReveal();
    initGateAndMusic();
  });
})();
