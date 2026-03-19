// Handles all auth form interactions on index.html

document.addEventListener('DOMContentLoaded', () => {

  // ── If already logged in → go to dashboard ─────────────────────────────────
  (async () => {
    if (Auth.isLoggedIn()) {
      try {
        const user = await API.getProfile();
        Auth.save(Auth.token(), user);
        window.location.href = 'dashboard.html';
      } catch {
        Auth.logout();
      }
    }
  })();

  // ── Elements ────────────────────────────────────────────────────────────────
  const roleSection  = document.getElementById('role-selection');
  const loginSection = document.getElementById('login-signup-section');
  const dot1         = document.getElementById('dot-1');
  const dot2         = document.getElementById('dot-2');
  const loginTab     = document.getElementById('login-tab');
  const signupTab    = document.getElementById('signup-tab');
  const loginForm    = document.getElementById('login-form');
  const signupForm   = document.getElementById('signup-form');
  const backBtn      = document.getElementById('back-to-role-select');
  const welcomeMsg   = document.getElementById('welcome-message');
  const errorEl      = document.getElementById('auth-error');

  let selectedRole = 'Student';

  // ── Step navigation ─────────────────────────────────────────────────────────
  function showRoles() {
    roleSection.style.display = 'block';
    loginSection.classList.add('hidden');
    dot1.classList.add('active');
    dot2.classList.remove('active');
    clearError();
  }

  function showForms(role) {
    selectedRole = role;
    if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${role}! Sign in to access NASA datasets.`;
    roleSection.style.display = 'none';
    loginSection.classList.remove('hidden');
    dot1.classList.remove('active');
    dot2.classList.add('active');
    clearError();
  }

  document.getElementById('role-student')?.addEventListener('click', () => showForms('Student'));
  document.getElementById('role-researcher')?.addEventListener('click', () => showForms('Scientist'));
  backBtn?.addEventListener('click', showRoles);

  // ── Tabs ────────────────────────────────────────────────────────────────────
  loginTab?.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    clearError();
  });

  signupTab?.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    clearError();
  });

  // ── Error helpers ────────────────────────────────────────────────────────────
  function showError(msg) {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
      errorEl.style.display = 'block';
    }
  }

  function clearError() {
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
      errorEl.style.display = 'none';
    }
  }

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    clearError();

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Validation
    if (!email && !password) { showError('⚠️ Please enter your email and password.'); return; }
    if (!email)               { showError('⚠️ Please enter your email address.'); return; }
    if (!email.includes('@')) { showError('⚠️ Please enter a valid email address.'); return; }
    if (!password)            { showError('⚠️ Please enter your password.'); return; }

    try {
      const data = await API.login({ email, password });
      if (!data.token) throw new Error('Login failed');
      Auth.save(data.token, data.user);
      window.location.href = 'dashboard.html';
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid credentials') || msg.includes('401')) {
        showError('❌ Wrong email or password. Please try again.');
      } else if (msg.includes('not found') || msg.includes('404')) {
        showError('❌ No account found with this email. Please sign up.');
      } else {
        showError('❌ ' + (msg || 'Login failed. Please try again.'));
      }
    }
  });

  // ── SIGNUP ───────────────────────────────────────────────────────────────────
  signupForm?.addEventListener('submit', async e => {
    e.preventDefault();
    clearError();

    const name     = document.getElementById('signup-name').value.trim();
    const email    = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    // Validation
    if (!name)                 { showError('⚠️ Please enter your full name.'); return; }
    if (!email)                { showError('⚠️ Please enter your email address.'); return; }
    if (!email.includes('@'))  { showError('⚠️ Please enter a valid email address.'); return; }
    if (!password)             { showError('⚠️ Please enter a password.'); return; }
    if (password.length < 6)   { showError('⚠️ Password must be at least 6 characters.'); return; }

    try {
      const data = await API.register({ name, email, password, role: selectedRole });
      if (!data.token) throw new Error('Signup failed');
      Auth.save(data.token, data.user);
      window.location.href = 'dashboard.html';
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('409')) {
        showError('❌ Email already registered. Please login instead.');
      } else {
        showError('❌ ' + (msg || 'Signup failed. Please try again.'));
      }
    }
  });

});