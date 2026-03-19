// ── Dataset Explorer (datasets.html) ─────────────────────────────────────────
async function initDatasets() {
  const grid   = document.getElementById('dataset-grid');
  const search = document.getElementById('ds-search');
  const filter = document.getElementById('ds-filter');
  const sort   = document.getElementById('ds-sort');
  const suggBox = document.getElementById('ds-suggestions');
  const info   = document.getElementById('results-info');
  if (!grid) return;

  const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };

  async function load(params = {}) {
    grid.innerHTML = '<div class="spinner"></div>';
    const apiParams = { ...params };
    const clientSort = apiParams.sort;
    if (clientSort === 'az' || clientSort === 'za') delete apiParams.sort;

    try {
      const data = await API.getDatasets(apiParams);
      let datasets = data.datasets;

      // Client-side sorts
      if (clientSort === 'easy-first') datasets.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
      if (clientSort === 'hard-first') datasets.sort((a, b) => levelOrder[b.level] - levelOrder[a.level]);
      if (clientSort === 'az') datasets.sort((a, b) => a.name.localeCompare(b.name));
      if (clientSort === 'za') datasets.sort((a, b) => b.name.localeCompare(a.name));

      if (info) info.innerHTML = `Showing <span style="color:var(--accent);font-weight:600">${datasets.length}</span> datasets · Role: <span style="color:var(--accent);font-weight:600">${data.role}</span>`;

      render(datasets);
    } catch {
      grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">Failed to load datasets.</p>';
    }
  }

  function render(datasets) {
    if (!datasets.length) {
      grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">No datasets found. Try a different filter.</p>';
      return;
    }
    grid.innerHTML = datasets.map(d => `
      <div class="card dataset-card" onclick="location.href='dataset-details.html?id=${d.id}'">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <span class="tag tag-${d.event}">${d.event}</span>
          <span class="level-badge level-${d.level}">${d.level}</span>
        </div>
        <h3 style="font-size:15px;margin:10px 0 4px;color:var(--text)">${d.name}</h3>
        <div style="color:var(--muted);font-size:12px;margin-bottom:8px">🛰 ${d.satellite} · ${d.resolution}</div>
        <p style="color:var(--muted);font-size:13px;line-height:1.5;flex:1">${d.description}</p>
        <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center">
          <a class="btn-sm" href="dataset-details.html?id=${d.id}">View Details →</a>
          <span style="font-size:11px;color:var(--muted)">${d.tags.slice(0,2).map(t=>'#'+t).join(' ')}</span>
        </div>
      </div>
    `).join('');
  }

  // ── Search with suggestions ───────────────────────────────────────────────
  search?.addEventListener('input', async () => {
    const q = search.value.trim();
    const ev = filter?.value || 'all';

    if (!q) {
      if (suggBox) suggBox.style.display = 'none';
      load(ev !== 'all' ? { event: ev } : {});
      return;
    }

    // Suggestions from backend
    try {
      const data = await API.getSuggestions(q);
      if (suggBox && data.suggestions.length) {
        suggBox.innerHTML = data.suggestions.map(s =>
          `<div class="suggest-item" onclick="selectSuggestion('${s}')">${s}</div>`
        ).join('');
        suggBox.style.display = 'block';
      } else if (suggBox) {
        suggBox.style.display = 'none';
      }
    } catch {
      if (suggBox) suggBox.style.display = 'none';
    }

    // Filter results
    const params = {};
    if (ev !== 'all') params.event = ev;
    params.search = q;
    load(params);
  });

  // ── Filter dropdown ───────────────────────────────────────────────────────
  filter?.addEventListener('change', () => {
    const ev = filter.value;
    const s  = sort?.value || 'default';
    const q  = search?.value.trim() || '';
    const params = {};
    if (ev !== 'all') params.event = ev;
    if (s !== 'default') params.sort = s;
    if (q) params.search = q;
    load(params);
  });

  // ── Sort dropdown ─────────────────────────────────────────────────────────
  sort?.addEventListener('change', () => {
    const ev = filter?.value || 'all';
    const s  = sort.value;
    const q  = search?.value.trim() || '';
    const params = {};
    if (ev !== 'all') params.event = ev;
    if (s !== 'default') params.sort = s;
    if (q) params.search = q;
    load(params);
  });

  // ── Close suggestions on outside click ───────────────────────────────────
  document.addEventListener('click', e => {
    if (suggBox && !search?.contains(e.target)) suggBox.style.display = 'none';
  });

  // ── Read URL param on load ────────────────────────────────────────────────
  const urlEvent = new URLSearchParams(location.search).get('event');
  if (urlEvent && filter) {
    filter.value = urlEvent;
    await load({ event: urlEvent });
  } else {
    await load();
  }
}

// Global suggestion click handler
window.selectSuggestion = function(val) {
  const search = document.getElementById('ds-search');
  const suggBox = document.getElementById('ds-suggestions');
  if (search) search.value = val;
  if (suggBox) suggBox.style.display = 'none';
  // Check if it's an event type
  const events = ['flood','volcano','wildfire','earthquake','cyclone','avalanche'];
  if (events.includes(val.toLowerCase())) {
    const filter = document.getElementById('ds-filter');
    if (filter) filter.value = val.toLowerCase();
    loadDatasets({ event: val.toLowerCase() });
  } else {
    loadDatasets({ search: val });
  }
};

// ── Dataset Details (dataset-details.html) ────────────────────────────────────
async function initDatasetDetails() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) { location.href = 'datasets.html'; return; }

  const container = document.getElementById('dataset-detail');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const d = await API.getDataset(id);
    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <span class="tag tag-${d.event}">${d.event}</span>
        <span class="level-badge level-${d.level}">${d.level}</span>
      </div>
      <h1 style="font-family:'Orbitron',monospace;font-size:24px;margin-bottom:8px;line-height:1.3">${d.name}</h1>
      <p style="color:var(--muted);margin-bottom:24px;font-size:14px">🛰 ${d.satellite} · Resolution: ${d.resolution}</p>
      <p style="line-height:1.8;margin-bottom:28px;font-size:15px">${d.description}</p>

      <div class="use-cases">
        <h3>Research Use Cases</h3>
        <ul>
          ${d.useCases.map(u => `<li>${u}</li>`).join('')}
        </ul>
      </div>

      <div class="tags-row">
        ${d.tags.map(t => `<span class="chip">#${t}</span>`).join('')}
      </div>

      <div class="action-btns">
        <a href="${d.url}" target="_blank" class="btn-primary">🔗 View Official Dataset ↗</a>
        <a href="recommendations.html?event=${d.event}&exclude=${d.id}" class="btn-outline">🤖 See Recommendations →</a>
        <button class="btn-save" onclick="saveDataset(${d.id})">🔖 Save Dataset</button>
      </div>
    `;

    loadRecommendations(d.event, d.id);
  } catch {
    container.innerHTML = '<p style="color:var(--muted)">Dataset not found.</p>';
  }
}

async function loadRecommendations(event, excludeId) {
  const recEl = document.getElementById('recommendations');
  if (!recEl) return;

  try {
    const data = await API.getRecommend(event, excludeId);
    if (!data.recommendations.length) return;
    recEl.innerHTML = `
      <h3 style="font-size:16px;font-weight:600;margin-bottom:16px">🤖 Recommended Datasets</h3>
      <div class="rec-grid">
        ${data.recommendations.map(d => `
          <div class="rec-card" onclick="location.href='dataset-details.html?id=${d.id}'">
            <span class="tag tag-${d.event}">${d.event}</span>
            <h4 style="font-size:14px;margin:8px 0 4px;color:var(--text)">${d.name}</h4>
            <p style="color:var(--muted);font-size:12px">🛰 ${d.satellite}</p>
          </div>
        `).join('')}
      </div>
    `;
  } catch { /* silent */ }
}

// ── Save dataset — uses toast if available, else alert ────────────────────────
window.saveDataset = async function(id) {
  if (!Auth.isLoggedIn()) {
    if (window.showToast) showToast('Please log in to save datasets.', 'error');
    else alert('Please log in to save datasets.');
    return;
  }
  try {
    await API.saveDataset(id);
    if (window.showToast) showToast('Dataset saved to your profile! 🔖', 'success');
    else alert('Dataset saved!');
  } catch (e) {
    if (window.showToast) showToast(e.message || 'Could not save.', 'error');
    else alert(e.message);
  }
};

// ── Recommendations page (recommendations.html) ───────────────────────────────
async function initRecommendations() {
  const params  = new URLSearchParams(location.search);
  const event   = params.get('event') || 'flood';
  const exclude = params.get('exclude');
  const grid    = document.getElementById('rec-grid');
  const select  = document.getElementById('rec-event');
  if (!grid) return;

  if (select) select.value = event;

  async function load(ev) {
    grid.innerHTML = '<div class="spinner"></div>';
    try {
      const data = await API.getRecommend(ev, exclude);
      if (!data.recommendations.length) {
        grid.innerHTML = '<p style="color:var(--muted)">No recommendations found.</p>';
        return;
      }
      grid.innerHTML = data.recommendations.map(d => `
        <div class="card dataset-card" onclick="location.href='dataset-details.html?id=${d.id}'">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <span class="tag tag-${d.event}">${d.event}</span>
            <span class="level-badge level-${d.level}">${d.level}</span>
          </div>
          <h3 style="font-size:15px;margin:10px 0 4px;color:var(--text)">${d.name}</h3>
          <div style="color:var(--muted);font-size:12px;margin-bottom:8px">🛰 ${d.satellite} · ${d.resolution}</div>
          <p style="color:var(--muted);font-size:13px;line-height:1.5">${d.description}</p>
          <a class="btn-sm" style="margin-top:12px" href="dataset-details.html?id=${d.id}">View Details →</a>
        </div>
      `).join('');
    } catch {
      grid.innerHTML = '<p style="color:var(--muted)">Failed to load recommendations.</p>';
    }
  }

  select?.addEventListener('change', () => load(select.value));
  load(event);
}

// ── Init on page load ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = location.pathname;
  if (page.includes('datasets.html'))        initDatasets();
  if (page.includes('dataset-details.html')) initDatasetDetails();
  if (page.includes('recommendations.html')) initRecommendations();
});

// // ── Dataset Explorer (datasets.html) ─────────────────────────────────────────
// async function initDatasets() {
//   const grid    = document.getElementById('dataset-grid');
//   const search  = document.getElementById('ds-search');
//   // 🔍 Suggestions Box
// const suggestionBox = document.createElement('div');
// suggestionBox.className = 'suggestions-box';
// search?.parentNode.appendChild(suggestionBox);

// // Static suggestions (can later come from backend)
// const suggestions = ['flood', 'cyclone', 'volcano', 'wildfire', 'earthquake', 'avalanche'];
//   const filter  = document.getElementById('ds-filter');
//   if (!grid) return;

//   let all = [];

//   async function load(params = {}) {
//     grid.innerHTML = '<div class="spinner"></div>';
//     try {
//       const data = await API.getDatasets(params);
//       all = data.datasets;
//       render(all);
//     } catch {
//       grid.innerHTML = '<p style="color:var(--muted)">Failed to load datasets.</p>';
//     }
//   }

//   function render(datasets) {
//     if (!datasets.length) {
//       grid.innerHTML = '<p style="color:var(--muted)">No datasets found.</p>';
//       return;
//     }
//     grid.innerHTML = datasets.map(d => `
//       <div class="card dataset-card" onclick="location.href='/dataset-details.html?id=${d.id}'">
//         <span class="tag tag-${d.event}">${d.event}</span>
//         <h3 style="font-size:16px;margin:10px 0 4px">${d.name}</h3>
//         <div style="color:var(--muted);font-size:12px;margin-bottom:8px">🛰 ${d.satellite} · ${d.resolution}</div>
//         <p style="color:var(--muted);font-size:13px;line-height:1.5">${d.description}</p>
//         <div style="margin-top:12px">
//           <a class="btn" style="font-size:12px" href="/dataset-details.html?id=${d.id}">View Details →</a>
//         </div>
//       </div>
//     `).join('');
//   }

//   search?.addEventListener('input', () => {
//   const q = search.value.toLowerCase();

//   // Normal search
//   render(all.filter(d =>
//     d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
//   ));

//   // Suggestions
//   if (!q) {
//     suggestionBox.innerHTML = '';
//     return;
//   }

//   const filtered = suggestions.filter(s => s.startsWith(q));

//   suggestionBox.innerHTML = filtered.map(s => `
//     <div class="suggestion-item">${s}</div>
//   `).join('');

//   // Click on suggestion
//   document.querySelectorAll('.suggestion-item').forEach(item => {
//     item.addEventListener('click', () => {
//       search.value = item.textContent;
//       suggestionBox.innerHTML = '';
//       load({ event: item.textContent });
//     });
//   });
// });

//   filter?.addEventListener('change', async () => {
//     const v = filter.value;
//     if (v === 'all') await load();
//     else await load({ event: v });
//   });

//   // Check URL param
//   const urlEvent = new URLSearchParams(location.search).get('event');
//   if (urlEvent && filter) {
//     filter.value = urlEvent;
//     await load({ event: urlEvent });
//   } else {
//     await load();
//   }
// }

// // ── Dataset Details (dataset-details.html) ────────────────────────────────────
// async function initDatasetDetails() {
//   const id = new URLSearchParams(location.search).get('id');
//   if (!id) { location.href = '/datasets.html'; return; }

//   const container = document.getElementById('dataset-detail');
//   if (!container) return;

//   container.innerHTML = '<div class="spinner"></div>';

//   try {
//     const d = await API.getDataset(id);
//     container.innerHTML = `
//       <span class="tag tag-${d.event}" style="font-size:13px">${d.event}</span>
//       <h1 style="font-size:28px;margin:12px 0 4px">${d.name}</h1>
//       <p style="color:var(--muted);margin-bottom:24px">🛰 ${d.satellite} · Resolution: ${d.resolution}</p>
//       <p style="line-height:1.7;margin-bottom:24px">${d.description}</p>

//       <h3 style="margin-bottom:12px">Research Use Cases</h3>
//       <ul style="color:var(--muted);line-height:2;padding-left:20px;margin-bottom:28px">
//         ${d.useCases.map(u => `<li>${u}</li>`).join('')}
//       </ul>

//       <div style="display:flex;gap:12px;flex-wrap:wrap">
//         <a href="${d.url}" target="_blank" class="btn btn-primary">View Official Dataset ↗</a>
//         <a href="/recommendations.html?event=${d.event}&exclude=${d.id}" class="btn">See Recommended Datasets →</a>
//         <button class="btn" onclick="saveDataset(${d.id})">🔖 Save Dataset</button>
//       </div>
//     `;

//     // Load recommendations
//     loadRecommendations(d.event, d.id);
//   } catch {
//     container.innerHTML = '<p style="color:var(--muted)">Dataset not found.</p>';
//   }
// }

// async function loadRecommendations(event, excludeId) {
//   const recEl = document.getElementById('recommendations');
//   if (!recEl) return;

//   try {
//     const data = await API.getRecommend(event, excludeId);
//     recEl.innerHTML = `
//       <h3 style="margin-bottom:16px">Recommended Datasets</h3>
//       <div class="grid-3">
//         ${data.recommendations.map(d => `
//           <div class="card" style="cursor:pointer" onclick="location.href='/dataset-details.html?id=${d.id}'">
//             <span class="tag tag-${d.event}">${d.event}</span>
//             <h4 style="font-size:14px;margin:8px 0 4px">${d.name}</h4>
//             <p style="color:var(--muted);font-size:12px">${d.satellite}</p>
//           </div>
//         `).join('')}
//       </div>
//     `;
//   } catch { /* silent */ }
// }

// async function saveDataset(id) {
//   if (!Auth.isLoggedIn()) { alert('Please log in to save datasets.'); return; }
//   try {
//     await API.saveDataset(id);
//     alert('Dataset saved to your profile!');
//   } catch (e) {
//     alert(e.message);
//   }
// }

// // ── Recommendations page (recommendations.html) ───────────────────────────────
// async function initRecommendations() {
//   const params  = new URLSearchParams(location.search);
//   const event   = params.get('event') || 'flood';
//   const exclude = params.get('exclude');
//   const grid    = document.getElementById('rec-grid');
//   const select  = document.getElementById('rec-event');
//   if (!grid) return;

//   if (select) select.value = event;

//   async function load(ev) {
//     grid.innerHTML = '<div class="spinner"></div>';
//     try {
//       const data = await API.getRecommend(ev, exclude);
//       grid.innerHTML = data.recommendations.map(d => `
//         <div class="card dataset-card" onclick="location.href='/dataset-details.html?id=${d.id}'">
//           <span class="tag tag-${d.event}">${d.event}</span>
//           <h3 style="font-size:16px;margin:10px 0 4px">${d.name}</h3>
//           <div style="color:var(--muted);font-size:12px;margin-bottom:8px">🛰 ${d.satellite} · ${d.resolution}</div>
//           <p style="color:var(--muted);font-size:13px;line-height:1.5">${d.description}</p>
//           <a class="btn" style="font-size:12px;margin-top:12px" href="/dataset-details.html?id=${d.id}">View Details →</a>
//         </div>
//       `).join('');
//     } catch {
//       grid.innerHTML = '<p>Failed to load recommendations.</p>';
//     }
//   }

//   select?.addEventListener('change', () => load(select.value));
//   load(event);
// }

// // ── Init on page load ─────────────────────────────────────────────────────────
// document.addEventListener('DOMContentLoaded', () => {
//   const page = location.pathname;
//   if (page.includes('datasets.html'))        initDatasets();
//   if (page.includes('dataset-details.html')) initDatasetDetails();
//   if (page.includes('recommendations.html')) initRecommendations();
// });