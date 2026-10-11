/**
 * Contact Management System - Registration Script
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPasswordBtn');
  const strengthFill = document.getElementById('strengthFill');
  const strengthLabel = document.getElementById('strengthLabel');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const authAlert = document.getElementById('authAlert');

  const fullNameError = document.getElementById('fullNameError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');

  // Toggle password visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      toggleVisibility(passwordInput, togglePasswordBtn);
    });
  }

  if (toggleConfirmPasswordBtn) {
    toggleConfirmPasswordBtn.addEventListener('click', () => {
      toggleVisibility(confirmPasswordInput, toggleConfirmPasswordBtn);
    });
  }

  function toggleVisibility(input, btn) {
    const isPassword = input.getAttribute('type') === 'password';
    input.setAttribute('type', isPassword ? 'text' : 'password');
    btn.querySelector('span').textContent = isPassword ? '🔒' : '👁️';
  }

  // Password strength calculation
  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    const score = computeStrength(val);
    updateStrengthUI(score, val.length);
  });

  function computeStrength(pwd) {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score;
  }

  function updateStrengthUI(score, length) {
    if (length === 0) {
      strengthFill.style.width = '0%';
      strengthFill.style.backgroundColor = 'transparent';
      strengthLabel.textContent = 'Enter password';
      return;
    }

    if (length < 8) {
      strengthFill.style.width = '25%';
      strengthFill.style.backgroundColor = 'var(--color-danger)';
      strengthLabel.textContent = 'Too short (<8 chars)';
      return;
    }

    switch (score) {
      case 1:
      case 2:
        strengthFill.style.width = '40%';
        strengthFill.style.backgroundColor = '#ea580c';
        strengthLabel.textContent = 'Weak';
        break;
      case 3:
        strengthFill.style.width = '70%';
        strengthFill.style.backgroundColor = '#ca8a04';
        strengthLabel.textContent = 'Good';
        break;
      case 4:
      case 5:
        strengthFill.style.width = '100%';
        strengthFill.style.backgroundColor = 'var(--color-success)';
        strengthLabel.textContent = 'Strong';
        break;
    }
  }

  // Submit handling
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    let isValid = true;

    if (!fullName) {
      showFieldError(fullNameInput, fullNameError, 'Full name is required.');
      isValid = false;
    } else if (fullName.length < 2) {
      showFieldError(fullNameInput, fullNameError, 'Full name must be at least 2 characters.');
      isValid = false;
    }

    if (!email) {
      showFieldError(emailInput, emailError, 'Email address is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError(emailInput, emailError, 'Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      showFieldError(passwordInput, passwordError, 'Password is required.');
      isValid = false;
    } else if (password.length < 8) {
      showFieldError(passwordInput, passwordError, 'Password must be at least 8 characters long.');
      isValid = false;
    }

    if (!confirmPassword) {
      showFieldError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      showFieldError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match.');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ fullName, email, password, confirmPassword })
      });

      if (response.ok) {
        showAlert('Registration successful! Redirecting to login...', 'success');
        setTimeout(() => {
          window.location.href = 'login.html?registered=true';
        }, 800);
      } else {
        const data = await response.json().catch(() => ({}));
        if (data.validationErrors) {
          if (data.validationErrors.fullName) showFieldError(fullNameInput, fullNameError, data.validationErrors.fullName);
          if (data.validationErrors.email) showFieldError(emailInput, emailError, data.validationErrors.email);
          if (data.validationErrors.password) showFieldError(passwordInput, passwordError, data.validationErrors.password);
        }
        showAlert(data.message || 'Registration failed. An account with this email may already exist.', 'danger');
      }
    } catch (err) {
      console.error('Registration error:', err);
      showAlert('Server connection error. Please ensure Spring Boot is running.', 'danger');
    } finally {
      setLoading(false);
    }
  });

  function showFieldError(input, errorEl, message) {
    input.classList.add('is-invalid');
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }

  function clearErrors() {
    [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(inp => inp.classList.remove('is-invalid'));
    [fullNameError, emailError, passwordError, confirmPasswordError].forEach(el => {
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
});
