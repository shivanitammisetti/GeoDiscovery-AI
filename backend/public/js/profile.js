document.addEventListener('DOMContentLoaded', async () => {
  await Auth.requireAuth();

  const user = Auth.user();
  if (!user) return;

  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('user-role').textContent = user.role;

  const container = document.getElementById('saved-datasets');
  container.innerHTML = '<div class="spinner"></div>';

  try {
    const profile = await API.getProfile();
    const savedIds = profile.savedDatasets || [];

    if (!savedIds.length) {
      container.innerHTML = '<p style="color:var(--muted)">No saved datasets yet.</p>';
      return;
    }

    // ← FIXED: fetch each dataset by ID
    const datasets = await Promise.all(savedIds.map(id => API.getDataset(id)));

    container.innerHTML = datasets.map(d => `
      <div class="card" onclick="location.href='/dataset-details.html?id=${d.id}'" style="cursor:pointer">
        <span class="tag tag-${d.event}">${d.event}</span>
        <h4 style="margin:8px 0">${d.name}</h4>
        <p style="color:var(--muted);font-size:12px">${d.satellite}</p>
      </div>
    `).join('');

  } catch (err) {
    container.innerHTML = '<p style="color:red">Failed to load saved datasets.</p>';
  }
});