/*! ============================================================================
 * William's Bistro — Precios centralizados + BCV dinámico
 * ----------------------------------------------------------------------------
 * Arquitectura (100% cliente, sin backend ni DB):
 * 1. Un único data/precios.json es la fuente de verdad (precio USD + tasa BCV fallback).
 * 2. js/precios.js hace fetch del JSON → inyecta USD + Bs en .dish__price.
 * 3. La tasa BCV se cachea en localStorage['bcv_rate'] con TTL de 12h.
 *    Al expirar, llama a la API pública ve.dolarapi.com → parsea "oficial.promedio".
 *    Si la API falla → usa la última cache o el fallback del JSON (nunca falla).
 * 4. El fallback del JSON se autoactualiza en localStorage['bcv_fresh'] al primer
 *    fetch exitoso, de modo que incluso sin internet se sirve una tasa reciente.
 *
 * Debug:
 *   - Consola:  window.WILLIAMS_BCV_RATE    → tasa en uso
 *               window.WILLIAMS_REFRESH_BCV() → forzar refresco
 *   - Widget:   abrir menu.html?debug=1     → panel fijo abajo-izquierda
 * ============================================================================ */

(function () {
  'use strict';

  // --- Config ---------------------------------------------------------------
  const JSON_URL = 'data/precios.json';
  const BCV_API = 'https://ve.dolarapi.com/v1/dolares';
  const BCV_TTL = 12 * 60 * 60 * 1000; // 12 horas
  const FALLBACK_TASA = 771.07;        // fallback base del JSON

  // --- Helpers --------------------------------------------------------------
  function formatBs(amount) {
    return 'Bs ' + Math.round(amount).toLocaleString('es-VE');
  }
  function cacheSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function cacheGet(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
  }
  function fmtTasa(n) {
    return Number(n).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }
  function fmtEdad(ts) {
    if (!ts) return '—';
    const min = Math.floor((Date.now() - ts) / 60000);
    if (min < 1) return 'hace <1 min';
    if (min < 60) return 'hace ' + min + ' min';
    const h = Math.floor(min / 60);
    return 'hace ' + h + 'h ' + (min % 60) + 'm';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // --- Tasa BCV --------------------------------------------------------------
  // Devuelve { rate, source } donde source ∈ api | cache | fresh | json
  async function getBcVRateInfo() {
    // 1. Cache local viva (12h)
    const cached = cacheGet('bcv_rate');
    if (cached?.rate && (Date.now() - cached.ts) < BCV_TTL) {
      return { rate: cached.rate, source: 'cache' };
    }

    // 2. API pública ligera (cliente → ve.dolarapi.com)
    try {
      const res = await fetch(BCV_API, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const oficial = data.find(
          (d) => d.fuente === 'oficial' && typeof d.promedio === 'number'
        );
        if (oficial?.promedio) {
          const rate = oficial.promedio;
          const now = Date.now();
          cacheSet('bcv_rate', { rate, ts: now });
          cacheSet('bcv_fresh', { rate, ts: now }); // autoactualiza fallback
          return { rate, source: 'api' };
        }
      }
    } catch (err) {
      console.warn('[precios.js] BCV API falló, usando fallback:', err);
    }

    // 3. Fallback: última cache reciente → fallback JSON base
    const fresh = cacheGet('bcv_fresh');
    if (fresh?.rate) return { rate: fresh.rate, source: 'fresh' };
    return { rate: FALLBACK_TASA, source: 'json' };
  }

  // --- Inyección de precios --------------------------------------------------
  async function renderPrecios() {
    try {
      const resp = await fetch(JSON_URL);
      const data = await resp.json();
      if (!data?.items) throw new Error('JSON inválido');

      // Expone fallback global por si se necesita debug
      window.WILLIAMS_FALLBACK_RATE = data.metadata?.bs_rate ?? FALLBACK_TASA;
      const fallbackJson = data.metadata?.bs_rate ?? FALLBACK_TASA;

      const { rate: tasa, source } = await getBcVRateInfo();
      window.WILLIAMS_BCV_RATE = tasa; // tasa en uso ahora (consola)

      data.items.forEach((item) => {
        const dish = document.querySelector(`.dish[data-dish="${item.id}"]`);
        if (!dish) return;

        const priceEl = dish.querySelector('.dish__price');
        if (!priceEl) return;

        const usd = item.precio_usd;
        const bs = usd * tasa;

        priceEl.innerHTML =
          `<span class="dish__price-usd">$${usd.toFixed(2)}</span>` +
          `<span class="dish__price-bs">${formatBs(bs)}</span>`;
      });

      renderDebugWidget({ tasa, source, fallbackJson });
    } catch (err) {
      console.error('[precios.js] No se pudieron cargar los precios:', err);
      // Fallback: asegura que al menos los USD visibles estén como $<precio>
      document.querySelectorAll('.dish__price[data-usd]').forEach((el) => {
        const usd = parseFloat(el.getAttribute('data-usd')) || 0;
        el.textContent = `$${usd.toFixed(2)}`;
      });
    }
  }

  // --- Widget de debug (solo con ?debug=1) ------------------------------------
  const DEBUG_QUERY = new URLSearchParams(window.location.search).get('debug') === '1';

  function renderDebugWidget({ tasa, source, fallbackJson }) {
    if (!DEBUG_QUERY) return;

    const cached = cacheGet('bcv_rate');
    const fresh = cacheGet('bcv_fresh');

    const srcLabel = {
      api: '🟢 API en vivo',
      cache: '🟡 Cache 12h',
      fresh: '🟠 Fallback vivo',
      json: '🔴 Fallback JSON'
    }[source] || source;

    const widget = document.createElement('div');
    widget.id = 'williams-debug';
    widget.style.cssText = [
      'position:fixed', 'left:14px', 'bottom:14px', 'z-index:9999',
      'background:rgba(25,18,11,0.96)', 'border:1px solid rgba(212,175,55,0.4)',
      'border-radius:12px', 'padding:12px 14px', 'width:280px',
      'font:12px/1.5 Poppins, sans-serif', 'color:#f3ead6',
      'box-shadow:0 10px 30px rgba(0,0,0,0.55)', 'backdrop-filter:blur(6px)'
    ].join(';');

    widget.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
        '<strong style="color:#D4AF37;font-size:12px;letter-spacing:.05em">💵 TASA BCV · DEBUG</strong>' +
        '<button id="williams-debug-close" aria-label="Cerrar" style="background:none;border:none;color:#b3a68f;cursor:pointer;font-size:14px;line-height:1">✕</button>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(212,175,55,.25)">' +
        '<span style="color:#b3a68f">En uso ahora</span>' +
        '<strong style="color:#E5B80B">' + fmtTasa(tasa) + ' Bs/$</strong>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(212,175,55,.25)">' +
        '<span style="color:#b3a68f">Fuente</span><span id="williams-debug-src">' + escapeHtml(srcLabel) + '</span>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(212,175,55,.25)">' +
        '<span style="color:#b3a68f">Cache 12h</span>' +
        '<span>' + (cached?.rate ? fmtTasa(cached.rate) + ' <small style="color:#8f8570">(' + fmtEdad(cached.ts) + ')</small>' : '<span style="color:#8f8570">vacía</span>') + '</span>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed rgba(212,175,55,.25)">' +
        '<span style="color:#b3a68f">Fallback vivo</span>' +
        '<span>' + (fresh?.rate ? fmtTasa(fresh.rate) + ' <small style="color:#8f8570">(' + fmtEdad(fresh.ts) + ')</small>' : '<span style="color:#8f8570">vacío</span>') + '</span>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;padding:4px 0">' +
        '<span style="color:#b3a68f">Fallback JSON</span><span>' + fmtTasa(fallbackJson) + ' Bs/$</span>' +
      '</div>' +
      '<button id="williams-debug-refresh" style="margin-top:8px;width:100%;padding:6px 0;background:linear-gradient(135deg,#D4AF37,#E5B80B);color:#19120b;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-size:12px">⟳ Refrescar tasa</button>';

    document.body.appendChild(widget);

    document.getElementById('williams-debug-close').addEventListener('click', function () {
      widget.remove();
      // Re-mostrar solo si el usuario recarga con ?debug=1
    });
    document.getElementById('williams-debug-refresh').addEventListener('click', function () {
      localStorage.removeItem('bcv_rate'); // fuerza re-fetch a la API
      localStorage.removeItem('bcv_fresh');
      renderPrecios();
    });
  }

  // --- Hook: solo en menu.html (las otras páginas ignoran esto) ------------
  function isMenuPage() {
    return document.querySelectorAll('.dish').length > 0;
  }

  if (isMenuPage()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderPrecios);
    } else {
      renderPrecios();
    }

    // Exposed para debugging / refresh manual desde devtools
    window.WILLIAMS_REFRESH_BCV = function () {
      localStorage.removeItem('bcv_rate');
      renderPrecios();
    };
  }
})();