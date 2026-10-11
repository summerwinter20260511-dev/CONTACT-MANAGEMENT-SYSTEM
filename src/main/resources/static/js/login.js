/**
 * Contact Management System - Login Page Script
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const eyeIcon = document.getElementById('eyeIcon');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const authAlert = document.getElementById('authAlert');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');

  // Forgot password modal elements
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotModal = document.getElementById('forgotPasswordModal');
  const closeForgotModal = document.getElementById('closeForgotModal');
  const acknowledgeForgotBtn = document.getElementById('acknowledgeForgotBtn');

  // Check URL parameters for registration success message
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    showAlert('Account created successfully! Please sign in with your credentials.', 'success');
  }

  // Check if session is already active; if so, redirect to dashboard
  checkExistingSession();

  // Password visibility toggle
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      eyeIcon.textContent = isPassword ? '🔒' : '👁️';
    });
  }

  // Forgot password modal event listeners
  if (forgotPasswordLink && forgotModal) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotModal.classList.add('active');
    });

    const hideForgotModal = () => forgotModal.classList.remove('active');
    if (closeForgotModal) closeForgotModal.addEventListener('click', hideForgotModal);
    if (acknowledgeForgotBtn) acknowledgeForgotBtn.addEventListener('click', hideForgotModal);
    forgotModal.addEventListener('click', (e) => {
      if (e.target === forgotModal) hideForgotModal();
    });
  }

  // Form submit handling
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

    // Client-side validations
    let isValid = true;

    if (!email) {
      showFieldError(emailInput, emailError, 'Email address is required.');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showFieldError(emailInput, emailError, 'Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      showFieldError(passwordInput, passwordError, 'Password is required.');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      const csrfToken = getCookie('XSRF-TOKEN');
      const headers = { 'Content-Type': 'application/json' };
      if (csrfToken) {
        headers['X-XSRF-TOKEN'] = csrfToken;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({ email, password, rememberMe })
      });

      if (response.ok) {
        showAlert('Signed in successfully! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showAlert(errorData.message || 'Invalid email or password. Please try again.', 'danger');
      }
    } catch (err) {
      console.error('Login error:', err);
      showAlert('Unable to connect to server. Please ensure the backend is running.', 'danger');
    } finally {
      setLoading(false);
    }
  });

  async function checkExistingSession() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (res.ok) {
        window.location.href = 'index.html';
      }
    } catch (_) {
      // Not authenticated, stay on login page
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFieldError(input, errorEl, message) {
    input.classList.add('is-invalid');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }

  function clearErrors() {
    [emailInput, passwordInput].forEach(inp => inp.classList.remove('is-invalid'));
    [emailError, passwordError].forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
    authAlert.textContent = '';
    authAlert.className = 'auth-alert';
  }

  function showAlert(message, type = 'danger') {
    authAlert.textContent = message;
    authAlert.className = `auth-alert ${type} visible`;
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.style.display = loading ? 'none' : 'inline';
    btnSpinner.style.display = loading ? 'inline' : 'none';
  }

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
});
