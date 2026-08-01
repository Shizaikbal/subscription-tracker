redirectIfAuthed();

const form = document.getElementById('signup-form');
const alertBox = document.getElementById('alert');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertBox.innerHTML = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';

  try {
    const data = await api('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
      }),
    });
    setToken(data.data.token);
    window.location.href = '/dashboard.html';
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign Up';
  }
});
