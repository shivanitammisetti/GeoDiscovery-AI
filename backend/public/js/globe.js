// GeoDiscovery — Globe page JS
document.addEventListener('DOMContentLoaded', async () => {

  const globeEl = document.getElementById('globeViz');
  if (!globeEl) return;

  // Wait for Globe to load
  if (typeof Globe === 'undefined') {
    document.getElementById('event-count').textContent = 'Globe library not loaded';
    return;
  }

  const TEXTURES = {
    day: {
      globeImageUrl: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg',
      bumpImageUrl:  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png',
      backgroundImageUrl: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png'
    },
    night: {
      globeImageUrl: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg',
      bumpImageUrl:  'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png',
      backgroundImageUrl: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png'
    }
  };

  let theme = 'night';

  const CATEGORY_COLORS = {
    'Wildfires':        '#ef4444',
    'Floods':           '#3b82f6',
    'Volcanoes':        '#f59e0b',
    'Severe Storms':    '#a78bfa',
    'Earthquakes':      '#f97316',
    'Sea and Lake Ice': '#22d3ee',
    'Landslides':       '#84cc16',
    'default':          '#ffffff'
  };

  // ── Build globe ─────────────────────────────────────────────────────────────
  const globe = Globe()(globeEl)
    .globeImageUrl(TEXTURES[theme].globeImageUrl)
    .bumpImageUrl(TEXTURES[theme].bumpImageUrl)
    .backgroundImageUrl(TEXTURES[theme].backgroundImageUrl)
    .showAtmosphere(true)
    .atmosphereAltitude(0.22)
    .atmosphereColor('#1e90ff')
    .pointAltitude(0.02)
    .pointRadius(0.4)
    .pointColor(d => d.color)
    .pointLabel(d => `
      <div style="background:rgba(5,10,25,0.95);border:1px solid rgba(100,180,255,0.3);
        border-radius:10px;padding:12px 16px;max-width:240px;font-family:'Space Grotesk',sans-serif;
        box-shadow:0 4px 20px rgba(0,0,0,0.5);">
        <div style="font-weight:600;color:#e8f4ff;margin-bottom:4px;font-size:13px">${d.title}</div>
        <div style="color:#00d4ff;font-size:11px;margin-bottom:4px">${d.category}</div>
        <div style="color:rgba(200,225,255,0.5);font-size:11px">${d.date ? new Date(d.date).toLocaleDateString() : ''}</div>
      </div>
    `)
    .onPointClick(d => openEventPanel(d))
    .onPointHover(d => {
      globeEl.style.cursor = d ? 'pointer' : 'default';
    });

  globe.controls().autoRotate = true;
  globe.controls().autoRotateSpeed = 0.5;
  globe.controls().enableZoom = true;
  globe.pointOfView({ lat: 20, lng: 0, altitude: 2 }, 0);

  // ── Resize ──────────────────────────────────────────────────────────────────
  function resize() {
  const parent = globeEl.parentElement;
  globe.width(parent.clientWidth);
  globe.height(parent.clientHeight);
}
new ResizeObserver(() => resize()).observe(globeEl.parentElement);
setTimeout(resize, 100);
  // ── Load events ─────────────────────────────────────────────────────────────
  let allEvents = [];

  async function loadEvents() {
    const countEl = document.getElementById('event-count');
    if (countEl) countEl.textContent = 'Loading events...';
    try {
      const data = await API.getEvents();

      // ✅ FIXED: NASA EONET coordinates are [longitude, latitude]
      allEvents = data.events
        .filter(e => e.coordinates && e.coordinates.length === 2)
        .map(e => ({
          ...e,
          lat: e.coordinates[1],  // ← latitude is index 1
          lng: e.coordinates[0],  // ← longitude is index 0
          color: CATEGORY_COLORS[e.category] || CATEGORY_COLORS.default
        }));

      globe.pointsData(allEvents);
      if (countEl) countEl.textContent = `${allEvents.length} active events`;
    } catch (err) {
      console.error('Events load error:', err);
      if (countEl) countEl.textContent = 'Could not load events';
    }
  }

  // ── Filter ──────────────────────────────────────────────────────────────────
  window.filterCategory = function(cat) {
    const filtered = cat === 'all'
      ? allEvents
      : allEvents.filter(e => e.category.toLowerCase().includes(cat.toLowerCase()));
    globe.pointsData(filtered);
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === cat);
    });
  };

  // ── Location search ─────────────────────────────────────────────────────────
  document.getElementById('search-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const q = document.getElementById('location-search').value.trim();
    if (!q) return;
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        globe.controls().autoRotate = false;
        globe.pointOfView({ lat: +data[0].lat, lng: +data[0].lon, altitude: 1.2 }, 1500);
      } else {
        document.getElementById('event-count').textContent = 'Location not found';
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  });

  // ── Event panel ─────────────────────────────────────────────────────────────
 function openEventPanel(event) {
    const panel = document.getElementById('event-panel');
    if (!panel) return;

    const catMap = {
      'wildfires':  'wildfire',
      'floods':     'flood',
      'volcanoes':  'volcano',
      'earthquakes':'earthquake',
      'severe':     'cyclone',
      'storms':     'cyclone',
      'landslides': 'avalanche',
      'sea':        'avalanche',
      'drought':    'flood',
      'dust':       'wildfire'
    };
    const rawCat = event.category?.toLowerCase().split(' ')[0] || 'flood';
    const catKey = catMap[rawCat] || rawCat;

    panel.style.display = 'block';
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <h3 style="font-size:13px;line-height:1.4;flex:1">${event.title}</h3>
        <button onclick="document.getElementById('event-panel').style.display='none'"
          style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;padding:0 0 0 8px">✕</button>
      </div>
      <div style="color:var(--accent);font-size:12px;margin-bottom:10px">📌 ${event.category}</div>
      <div style="color:var(--muted);font-size:12px;margin-bottom:14px;line-height:1.6">
        📍 ${event.lat?.toFixed(3)}°, ${event.lng?.toFixed(3)}°<br/>
        📅 ${event.date ? new Date(event.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : 'N/A'}
      </div>
      <a href="datasets.html?event=${catKey}" 
        style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;
        background:rgba(0,100,255,0.15);border:1px solid rgba(100,180,255,0.3);
        border-radius:8px;color:#e8f4ff;font-size:12px;text-decoration:none">
        📊 Related Datasets →
      </a>
    `;
  }
  // ── Controls ─────────────────────────────────────────────────────────────────
  document.getElementById('btn-rotate')?.addEventListener('click', () => {
    globe.controls().autoRotate = !globe.controls().autoRotate;
  });

  document.getElementById('btn-theme')?.addEventListener('click', () => {
    theme = theme === 'day' ? 'night' : 'day';
    globe
      .globeImageUrl(TEXTURES[theme].globeImageUrl)
      .bumpImageUrl(TEXTURES[theme].bumpImageUrl)
      .backgroundImageUrl(TEXTURES[theme].backgroundImageUrl);
  });

  await loadEvents();
});