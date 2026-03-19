const API = {
 base: 'http://localhost:3000/api', // ← FIXED from 5000 to 3000

  headers() {
    const token = localStorage.getItem('geoToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  async get(path) {
    const res = await fetch(this.base + path, { headers: this.headers() });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
    return data;
  },

  // Datasets
  getDatasets(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get(`/datasets${q ? '?' + q : ''}`);
  },
  getDataset(id)    { return this.get(`/datasets/${id}`); },
  getByEvent(event) { return this.get(`/datasets/event/${event}`); },
  getRecommend(event, excludeId) {
    const q = excludeId ? `?excludeId=${excludeId}` : '';
    return this.get(`/datasets/recommend/${event}${q}`);
  },

  // Blogs
  getBlogs()  { return this.get('/blogs'); },
  getBlog(id) { return this.get(`/blogs/${id}`); },

  // Events
  getEvents(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this.get(`/events${q ? '?' + q : ''}`);
  },

  // Users
  register(data)  { return this.post('/users/register', data); },
  login(data)     { return this.post('/users/login', data); },
  getProfile()    { return this.get('/users/profile'); },
  saveDataset(id) { return this.post('/users/save-dataset', { datasetId: id }); },

  // Suggestions ← NEW
  getSuggestions(q) { return this.get(`/suggestions?q=${encodeURIComponent(q)}`); },

  // Feedback ← NEW
  submitFeedback(data) { return this.post('/feedback', data); },
  getFeedback()        { return this.get('/feedback'); }
};

const Auth = {
  save(token, user) {
    localStorage.setItem('geoToken', token);
    if (user) localStorage.setItem('geoUser', JSON.stringify(user));
  },
  user()  { try { return JSON.parse(localStorage.getItem('geoUser')); } catch { return null; } },
  token() { return localStorage.getItem('geoToken'); },
  isLoggedIn() { return !!this.token(); },
 logout() {
  localStorage.removeItem('geoToken');
  localStorage.removeItem('geoUser');
  window.location.href = '/';
},
async requireAuth() {
  if (!this.isLoggedIn()) {
    window.location.href = '/';
    return;
  }
    try {
      const user = await API.getProfile();
      this.save(this.token(), user);
    } catch {
      this.logout();
    }
  }
};