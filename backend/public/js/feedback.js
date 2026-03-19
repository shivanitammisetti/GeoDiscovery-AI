document.addEventListener('DOMContentLoaded', async () => {
  loadFeedback();
});

async function loadFeedback() {
  const list = document.getElementById('feedback-list');
  if (!list) return;

  list.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await API.getFeedback();
    if (!data.feedbacks.length) {
      list.innerHTML = '<p style="color:var(--muted)">No reviews yet. Be the first!</p>';
      return;
    }
    list.innerHTML = data.feedbacks.map(f => `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong style="font-size:14px">${f.userName}</strong>
          <span style="color:var(--warning)">${'⭐'.repeat(f.rating)}</span>
        </div>
        <p style="color:var(--muted);font-size:13px;line-height:1.6">${f.comment}</p>
        <div style="color:var(--muted);font-size:11px;margin-top:8px">
          ${new Date(f.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
          · ${f.userId?.role || ''}
        </div>
      </div>
    `).join('');
  } catch {
    list.innerHTML = '<p style="color:var(--muted)">Failed to load reviews.</p>';
  }
}

window.submitFeedback = async function() {
  const rating  = parseInt(document.getElementById('fb-rating').value);
  const comment = document.getElementById('fb-comment').value.trim();
  const msgEl   = document.getElementById('feedback-msg');

  if (!comment) {
    msgEl.innerHTML = '<div class="alert alert-danger">Please write a comment.</div>';
    return;
  }

  try {
    await API.submitFeedback({ rating, comment });
    msgEl.innerHTML = '<div class="alert alert-success">Review submitted! Thank you.</div>';
    document.getElementById('fb-comment').value = '';
    loadFeedback();
  } catch (err) {
    msgEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
};
