redirectIfAuthed();

const form = document.getElementById('login-form');
const alertBox = document.getElementById('alert');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertBox.innerHTML = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';

  try {
    const data = await api('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      }),
    });
    setToken(data.data.token);
    window.location.href = '/dashboard.html';
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
});
