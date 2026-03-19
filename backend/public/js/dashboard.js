document.addEventListener('DOMContentLoaded', async () => {
  await Auth.requireAuth();

  const user = Auth.user();
  if (user) {
    const nameEl  = document.getElementById('user-name');
    const greetEl = document.getElementById('greeting');
    if (nameEl)  nameEl.textContent  = user.name || 'Profile';
    if (greetEl) greetEl.textContent = `Hello, ${user.name}! You're logged in as ${user.role}.`;
  }

  // ── Search + suggestions ──────────────────────────────────────────────────
  const searchInput  = document.getElementById('global-search');
  const suggestBox   = document.getElementById('search-suggestions');
  const categoryFilter = document.getElementById('category-filter');

  searchInput?.addEventListener('input', async () => {
    const q = searchInput.value.trim();
    if (q.length < 2) { suggestBox.style.display = 'none'; return; }

    try {
      const data = await API.getSuggestions(q);
      if (!data.suggestions.length) { suggestBox.style.display = 'none'; return; }

      suggestBox.innerHTML = data.suggestions.map(s => `
        <div class="suggestion-item" onclick="selectSuggestion('${s}')">${s}</div>
      `).join('');
      suggestBox.style.display = 'block';
    } catch { suggestBox.style.display = 'none'; }
  });

  document.addEventListener('click', e => {
    if (!searchInput?.contains(e.target)) suggestBox.style.display = 'none';
  });

  categoryFilter?.addEventListener('change', () => {
    const v = categoryFilter.value;
    if (v === 'all') location.href = '/datasets.html';
    else location.href = `/datasets.html?event=${v}`;
  });
});

window.selectSuggestion = function(val) {
  document.getElementById('global-search').value = val;
  document.getElementById('search-suggestions').style.display = 'none';
  location.href = `/datasets.html?event=${val}`;
};