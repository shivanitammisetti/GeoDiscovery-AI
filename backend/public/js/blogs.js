// ── Blog List (blogs.html) ────────────────────────────────────────────────────
async function initBlogList() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await API.getBlogs();
    grid.innerHTML = data.blogs.map(b => `
      <div class="card blog-card" onclick="location.href='/blog-details.html?id=${b.id}'">
        <img src="${b.image}" alt="${b.title}" loading="lazy" onerror="this.style.display='none'">
        <div class="blog-meta">${b.author} · ${new Date(b.date).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</div>
        <div class="blog-title">${b.title}</div>
        <div class="blog-preview">${b.preview}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
          ${b.tags.map(t => `<span style="font-size:11px;color:var(--accent);background:rgba(34,211,238,0.1);padding:2px 8px;border-radius:20px">#${t}</span>`).join('')}
        </div>
      </div>
    `).join('');
  } catch {
    grid.innerHTML = '<p style="color:var(--muted)">Failed to load blogs.</p>';
  }
}

// ── Blog Detail (blog-details.html) ──────────────────────────────────────────
async function initBlogDetail() {
  const id = new URLSearchParams(location.search).get('id');
  const container = document.getElementById('blog-detail');
  if (!container || !id) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const b = await API.getBlog(id);

    // Render markdown-ish bold (**text**)
    const content = b.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .split('\n\n')
      .map(p => `<p style="line-height:1.8;margin-bottom:16px">${p}</p>`)
      .join('');

    container.innerHTML = `
      <div style="max-width:720px">
        <div style="color:var(--muted);font-size:13px;margin-bottom:12px">
          ${b.author} · ${new Date(b.date).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}
        </div>
        <h1 style="font-size:30px;line-height:1.3;margin-bottom:20px">${b.title}</h1>
        <img src="${b.image}" alt="${b.title}" style="width:100%;border-radius:12px;margin-bottom:28px;max-height:320px;object-fit:cover"
          onerror="this.style.display='none'">
        <div>${content}</div>
      </div>
    `;

    // Related datasets
    if (b.relatedDatasets?.length) {
      const relEl = document.getElementById('related-datasets');
      if (relEl) {
        try {
          const results = await Promise.all(b.relatedDatasets.map(id => API.getDataset(id)));
          relEl.innerHTML = `
            <h3 style="margin-bottom:16px">Related Datasets</h3>
            <div class="grid-3">
              ${results.map(d => `
                <div class="card" onclick="location.href='/dataset-details.html?id=${d.id}'" style="cursor:pointer">
                  <span class="tag tag-${d.event}">${d.event}</span>
                  <h4 style="font-size:14px;margin:8px 0 4px">${d.name}</h4>
                  <p style="color:var(--muted);font-size:12px">${d.satellite}</p>
                </div>
              `).join('')}
            </div>
          `;
        } catch { /* silent */ }
      }
    }

  } catch {
    container.innerHTML = '<p style="color:var(--muted)">Blog not found.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initBlogList();
  initBlogDetail();
});