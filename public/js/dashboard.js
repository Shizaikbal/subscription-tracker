if (!requireAuth()) throw new Error('redirecting');

const alertBox = document.getElementById('alert');
const subListEl = document.getElementById('sub-list');
const upcomingEl = document.getElementById('upcoming-list');
let subscriptions = [];

async function loadUser() {
  const { data } = await api('/users/me');
  document.getElementById('user-name').textContent = data.name;
}

function statusBadge(status) {
  return `<span class="badge badge-${escapeHtml(status)}">${escapeHtml(status)}</span>`;
}

function renderSubscriptions() {
  if (!subscriptions.length) {
    subListEl.innerHTML = '<div class="empty">No subscriptions yet. Add your first one!</div>';
    return;
  }
  const cancellable = (status) => status === 'active' || status === 'paused';
  subListEl.innerHTML = subscriptions.map((sub) => `
    <div class="sub-card" data-id="${sub._id}">
      <div>
        <div class="sub-name">${escapeHtml(sub.name)} ${statusBadge(sub.status)}</div>
        <div class="sub-meta">${escapeHtml(sub.category)} &middot; renews ${formatDate(sub.renewalDate)} &middot; ${escapeHtml(sub.paymentMethod)}</div>
      </div>
      <div class="actions">
        <span class="sub-price">${escapeHtml(formatPrice(sub))}</span>
        ${cancellable(sub.status) ? `<button class="btn btn-danger" data-action="cancel">Cancel</button>` : ''}
      </div>
    </div>
  `).join('');
}

subListEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="cancel"]');
  if (!btn) return;
  const id = btn.closest('[data-id]').dataset.id;
  cancelSub(id);
});

document.getElementById('logout-btn').addEventListener('click', logout);

document.getElementById('test-email-btn').addEventListener('click', sendTestEmail);

function renderUpcoming() {
  api('/subscriptions/upcoming-renewals')
    .then(({ data }) => {
      if (!data.length) {
        upcomingEl.innerHTML = '<div class="empty">No renewals in the next 7 days</div>';
        return;
      }
      upcomingEl.innerHTML = data.map((sub) => `
        <div class="sub-card">
          <div>
            <div class="sub-name">${escapeHtml(sub.name)}</div>
            <div class="sub-meta">${formatDate(sub.renewalDate)} (${sub.frequency})</div>
          </div>
          <span class="sub-price">${escapeHtml(formatPrice(sub))}</span>
        </div>
      `).join('');
    })
    .catch((err) => showToast(err.message, 'error'));
}

async function loadSubscriptions() {
  try {
    const { data } = await api('/subscriptions');
    subscriptions = data;
    renderSubscriptions();
    renderUpcoming();
  } catch (err) {
    subListEl.innerHTML = `<div class="empty">${escapeHtml(err.message)}</div>`;
  }
}

async function cancelSub(id) {
  if (!confirm('Cancel this subscription?')) return;
  try {
    await api(`/subscriptions/${id}/cancel`, { method: 'PUT' });
    showToast('Subscription cancelled');
    loadSubscriptions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function sendTestEmail() {
  if (!subscriptions.length) {
    showToast('Add a subscription first', 'error');
    return;
  }
  const target = subscriptions.find((s) => s.status === 'active') || subscriptions[0];
  api('/workflow/test-reminder', {
    method: 'POST',
    body: JSON.stringify({ subscriptionId: target._id }),
  })
    .then(({ message }) => showToast(message))
    .catch((err) => showToast(err.message, 'error'));
}

document.getElementById('sub-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('sub-btn');
  btn.disabled = true;
  btn.textContent = 'Adding...';
  try {
    await api('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('name').value.trim(),
        price: Number(document.getElementById('price').value),
        currency: document.getElementById('currency').value,
        frequency: document.getElementById('frequency').value,
        category: document.getElementById('category').value,
        paymentMethod: document.getElementById('paymentMethod').value.trim(),
        startDate: document.getElementById('startDate').value,
      }),
    });
    e.target.reset();
    showToast('Subscription added');
    loadSubscriptions();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-error">${escapeHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Add Subscription';
  }
});

loadUser();
loadSubscriptions();
