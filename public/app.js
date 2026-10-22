const $ = selector => document.querySelector(selector);
const authDialog = $('#auth-dialog');
const workspace = $('#workspace');
let authMode = 'register';
let projects = [];
let user = null;
const money = value => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...(options.body ? { 'content-type': 'application/json' } : {}), ...options.headers } });
  let data = {};
  try { data = await response.json(); } catch { throw new Error('The server returned an unreadable response.'); }
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}
function showAuth(mode = 'register') {
  authMode = mode;
  $('#auth-error').textContent = '';
  $('#name-field').hidden = mode === 'login';
  $('#name-field input').required = mode === 'register';
  $('#name-field input').disabled = mode === 'login';
  $('#auth-form [name="password"]').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('#dialog-title').innerHTML = mode === 'login' ? 'Welcome <em>back.</em>' : 'A good place to <em>begin.</em>';
  $('#auth-submit').innerHTML = mode === 'login' ? 'Sign in <span aria-hidden="true">↗</span>' : 'Create my workspace <span aria-hidden="true">↗</span>';
  $('#signup-tab').classList.toggle('active', mode === 'register'); $('#signup-tab').setAttribute('aria-selected', String(mode === 'register'));
  $('#login-tab').classList.toggle('active', mode === 'login'); $('#login-tab').setAttribute('aria-selected', String(mode === 'login'));
  authDialog.showModal();
}
['#nav-cta','#hero-cta','#bottom-cta','#price-cta'].forEach(sel => $(sel).addEventListener('click', () => showAuth()));
$('#signup-tab').addEventListener('click', () => showAuth('register'));
$('#login-tab').addEventListener('click', () => showAuth('login'));
$('#year').textContent = new Date().getFullYear();

$('#auth-form').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget);
  $('#auth-submit').disabled = true; $('#auth-error').textContent = '';
  try {
    const payload = Object.fromEntries(form.entries());
    user = (await api(`/api/${authMode}`, { method: 'POST', body: JSON.stringify(payload) })).user;
    authDialog.close(); event.currentTarget.reset(); await openWorkspace();
  } catch (error) { $('#auth-error').textContent = error.message; }
  finally { $('#auth-submit').disabled = false; }
});

async function openWorkspace() {
  $('#welcome-name').textContent = user.name;
  document.body.classList.add('in-workspace'); workspace.hidden = false;
  window.scrollTo(0, 0); await loadProjects();
}
async function loadProjects() {
  try { projects = (await api('/api/projects')).projects; renderProjects(); }
  catch (error) { $('#project-grid').innerHTML = `<p class="form-error">${escapeHtml(error.message)}</p>`; }
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[char]); }
function renderProjects() {
  $('#empty-state').hidden = projects.length > 0;
  $('#project-grid').innerHTML = projects.map((project, index) => `<article class="project-card"><div class="project-card-head"><span class="project-index">${String(index + 1).padStart(2,'0')}</span><button class="edit-project" data-edit="${project.id}" aria-label="Edit ${escapeHtml(project.title)}">↗</button></div><p class="label">${escapeHtml(project.client)}</p><h2>${escapeHtml(project.title)}</h2><p class="project-description">${escapeHtml(project.description || 'A new project, ready to take shape.')}</p><div class="project-card-foot"><span>STARTING ESTIMATE</span><strong>${money(project.estimate)}</strong></div></article>`).join('');
  document.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => editProject(button.dataset.edit)));
}
function editProject(id = '') {
  const project = projects.find(p => p.id === id);
  const form = $('#project-form'); form.reset();
  form.elements.id.value = project?.id || '';
  form.elements.title.value = project?.title || '';
  form.elements.client.value = project?.client || '';
  form.elements.description.value = project?.description || '';
  form.elements.estimate.value = project?.estimate ?? '';
  $('#project-title').innerHTML = project ? 'Refine the <em>details.</em>' : 'Start with <em>the essentials.</em>';
  $('#delete-project').hidden = !project; $('#project-error').textContent = '';
  $('#project-dialog').showModal();
}
$('#new-project').addEventListener('click', () => editProject());
$('#empty-new').addEventListener('click', () => editProject());
$('#project-form').addEventListener('submit', async event => {
  event.preventDefault(); const form = new FormData(event.currentTarget); const id = form.get('id');
  const values = Object.fromEntries(form.entries()); delete values.id;
  try {
    await api(`/api/projects${id ? `/${encodeURIComponent(id)}` : ''}`, { method: id ? 'PUT' : 'POST', body: JSON.stringify(values) });
    $('#project-dialog').close(); await loadProjects();
  } catch (error) { $('#project-error').textContent = error.message; }
});
$('#delete-project').addEventListener('click', async () => {
  const id = $('#project-form').elements.id.value;
  try { await api(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }); $('#project-dialog').close(); await loadProjects(); }
  catch (error) { $('#project-error').textContent = error.message; }
});
$('#logout').addEventListener('click', async () => { await api('/api/logout', { method: 'POST' }); user = null; workspace.hidden = true; document.body.classList.remove('in-workspace'); window.scrollTo(0,0); });

api('/api/me').then(async result => { if (result.user) { user = result.user; await openWorkspace(); } }).catch(() => {});
