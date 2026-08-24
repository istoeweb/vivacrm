/* CRM helper (auth, API, render) */

const API_BASE = (location.port === '3001' || location.port === '') && location.pathname.includes('/crm/')
  ? (location.port === '3001' ? 'http://localhost:3001/api' : '/api')
  : '/api';
function API(p) { return API_BASE + p; }

function getToken() { return sessionStorage.getItem('crm_token'); }
function getUser() {
  try { return JSON.parse(sessionStorage.getItem('crm_user') || '{}'); } catch { return {}; }
}
function requireAuth() {
  if (!getToken()) { location.href = 'index.html'; return false; }
  return true;
}
function logout() {
  sessionStorage.removeItem('crm_token');
  sessionStorage.removeItem('crm_user');
  location.href = 'index.html';
}

async function apiGet(path) {
  const r = await fetch(API(path), { headers: authHeaders() });
  if (r.status === 401) { logout(); throw new Error('Sessão expirada'); }
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Erro');
  return r.json();
}
async function apiPost(path, body) { return apiSend('POST', path, body); }
async function apiPut(path, body)  { return apiSend('PUT',  path, body); }
async function apiDel(path)        { return apiSend('DELETE', path); }

async function apiSend(method, path, body) {
  const opts = { method, headers: authHeaders() };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(API(path), opts);
  if (r.status === 401) { logout(); throw new Error('Sessão expirada'); }
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Erro');
  return r.json();
}
function authHeaders() {
  const h = {};
  const t = getToken(); if (t) h.Authorization = 'Bearer ' + t;
  return h;
}

/* ---- UI helpers ---- */
function toast(msg, isErr = false) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.toggle('toast--err', isErr);
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function badgeForStatus(status) {
  const map = {
    novo: 'new', contato_realizado: 'contacted', proposta_enviada: 'quoted',
    aguardando_retorno: 'pendente', fechado: 'won', desistiu: 'lost', sem_interesse: 'sem-interesse',
    // compatibilidade com status antigos
    contatado: 'contacted', cotacao_enviada: 'quoted', perdido: 'lost',
    ativa: 'ativo', cancelada: 'cancelada', renovada: 'renovada', vencida: 'vencida',
    aberto: 'aberto', em_analise: 'analise', aprovado: 'aprovado', negado: 'negado', finalizado: 'final',
    pendente: 'pendente', concluido: 'concluido', cancelado: 'lost',
    publicado: 'ativo', rascunho: 'pendente',
    admin: 'admin', corretor: 'corretor'
  };
  const cls = map[status] || 'new';
  const labels = {
    novo: 'Novo', contato_realizado: 'Contato realizado', proposta_enviada: 'Proposta enviada',
    aguardando_retorno: 'Aguardando retorno', fechado: 'Fechado', desistiu: 'Desistiu',
    sem_interesse: 'Não tem interesse',
    // compatibilidade com status antigos
    contatado: 'Contatado', cotacao_enviada: 'Cotação enviada', perdido: 'Perdido',
    ativa: 'Ativa', cancelada: 'Cancelada', renovada: 'Renovada', vencida: 'Vencida',
    aberto: 'Aberto', em_analise: 'Em análise', aprovado: 'Aprovado', negado: 'Negado', finalizado: 'Finalizado',
    pendente: 'Pendente', concluido: 'Concluído', cancelado: 'Cancelado',
    publicado: 'Publicado', rascunho: 'Rascunho'
  };
  return `<span class="badge badge--${cls}">${labels[status] || status}</span>`;
}

function fmtDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString('pt-BR');
}
function fmtMoney(v) {
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (!isFinite(n)) return '-';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtDateTime(d) {
  if (!d) return '-';
  const dt = new Date(d.replace(' ', 'T'));
  if (isNaN(dt)) return d;
  return dt.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
}
function wppLink(tel) {
  if (!tel) return '#';
  const digits = String(tel).replace(/\D/g, '');
  return 'https://wa.me/' + (digits.length === 11 || digits.length === 10 ? '55' + digits : digits);
}

/* ---- Paginação (client-side) ---- */
const DEFAULT_PAGE_SIZE = 10;

// Divide uma lista já filtrada em páginas, corrigindo a página atual se sair do intervalo.
function paginate(rows, page, pageSize = DEFAULT_PAGE_SIZE) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page || 1), totalPages);
  const start = (current - 1) * pageSize;
  return { slice: rows.slice(start, start + pageSize), page: current, totalPages, total, pageSize };
}

// Renderiza os controles de paginação e liga os cliques ao callback onGo(page).
function renderPager(el, info, onGo) {
  if (!el) return;
  const { page, totalPages, total, pageSize } = info;
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  const btn = (label, target, opts = {}) => {
    const cls = ['pager__btn'];
    if (opts.active) cls.push('pager__btn--active');
    return `<button class="${cls.join(' ')}" ${opts.disabled ? 'disabled' : ''} data-page="${target}" type="button">${label}</button>`;
  };

  const windowSize = 5;
  let startP = Math.max(1, page - 2);
  let endP = Math.min(totalPages, startP + windowSize - 1);
  startP = Math.max(1, endP - windowSize + 1);

  const nums = [];
  for (let i = startP; i <= endP; i++) nums.push(i);

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  el.innerHTML =
    `<span class="pager__info">${from}–${to} de ${total}</span>` +
    `<span class="pager__btns">` +
    btn('‹', page - 1, { disabled: page <= 1 }) +
    (startP > 1 ? btn('1', 1) + (startP > 2 ? '<span class="pager__gap">…</span>' : '') : '') +
    nums.map((p) => btn(String(p), p, { active: p === page })).join('') +
    (endP < totalPages ? (endP < totalPages - 1 ? '<span class="pager__gap">…</span>' : '') + btn(String(totalPages), totalPages) : '') +
    btn('›', page + 1, { disabled: page >= totalPages }) +
    `</span>`;

  el.querySelectorAll('.pager__btn[data-page]').forEach((b) => {
    b.addEventListener('click', () => {
      const n = parseInt(b.getAttribute('data-page'), 10);
      if (!Number.isNaN(n)) onGo(n);
    });
  });
}

/* ---- Modal ---- */
function openModal(title, fieldsHTML, footerHTML = '', onSubmit = null) {
  let m = document.getElementById('appModal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'appModal';
    m.className = 'modal-overlay';
    m.innerHTML = `<div class="modal"><div class="modal__header"><div class="modal__title"></div><button class="modal__close" type="button">&times;</button></div><div class="modal__body"></div><div class="modal__footer"></div></div>`;
    document.body.appendChild(m);
    m.querySelector('.modal__close').onclick = () => m.classList.remove('show');
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
  }
  m.querySelector('.modal__title').textContent = title;
  m.querySelector('.modal__body').innerHTML = fieldsHTML;
  m.querySelector('.modal__footer').innerHTML = footerHTML || '<button class="btn btn-ghost" type="button" data-close>Cancelar</button><button class="btn btn-primary" type="submit" data-save>Salvar</button>';
  m.querySelector('[data-close]').onclick = () => m.classList.remove('show');
  const doSave = () => {
    const form = m.querySelector('form');
    if (!form) { if (onSubmit) onSubmit({}); return; }
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form).entries());
    if (onSubmit) onSubmit(data);
  };
  m.querySelector('[data-save]').onclick = doSave;
  // Enter num campo dispara o submit nativo do form (GET) — previne e salva pela mesma lógica.
  // Como o botão "Salvar" fica no rodapé (fora do form), adiciona-se um submit oculto para
  // que o Enter dispare o submit implícito também em forms com múltiplos campos.
  const modalForm = m.querySelector('form');
  if (modalForm) {
    if (!modalForm.querySelector('[type="submit"]')) {
      modalForm.insertAdjacentHTML('beforeend', '<button type="submit" hidden aria-hidden="true" tabindex="-1"></button>');
    }
    modalForm.addEventListener('submit', (e) => { e.preventDefault(); doSave(); });
  }
  m.classList.add('show');
  return m;
}
function closeModal() {
  const m = document.getElementById('appModal');
  if (m) m.classList.remove('show');
}

/* ---- Sidebar ---- */
function renderSidebar(activeKey) {
  const user = getUser();
  const links = [
    { key: 'dashboard',   href: 'dashboard.html',    label: 'Dashboard',  icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { key: 'leads',       href: 'leads.html',        label: 'Leads',      icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
    { key: 'clientes',    href: 'clientes.html',     label: 'Clientes',   icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
    { key: 'apolices',    href: 'apolices.html',     label: 'Apólices',   icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6' },
    { key: 'sinistros',   href: 'sinistros.html',    label: 'Sinistros',  icon: 'M12 2L1 21h22L12 2z M12 9v6 M12 18h.01' },
    { key: 'agendamentos',href: 'agendamentos.html', label: 'Agenda',     icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' }
  ];
  if (user.role === 'admin') {
    links.push({ key: 'blog', href: 'blog.html', label: 'Blog', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20V5H6.5A2.5 2.5 0 004 7.5v12z M8 9h8 M8 13h6' });
    links.push({ key: 'usuarios', href: 'usuarios.html', label: 'Usuários', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' });
  }
  const html = `
    <div class="sidebar__brand">Vida de <strong>Ouro</strong><br><span style="font-size:10.5px;opacity:.6;letter-spacing:.08em;font-weight:500;">CRM Corretora</span></div>
    <nav class="sidebar__nav">
      ${links.map(l => `
        <a href="${l.href}" class="sidebar__link ${l.key === activeKey ? 'active' : ''}">
          <svg class="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="${l.icon}"/></svg>
          <span>${l.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar__user">
      <div class="sidebar__user-name">${esc(user.nome || '')}</div>
      <div class="sidebar__user-role">${user.role === 'admin' ? 'Administrador' : 'Corretor'}</div>
      <button class="sidebar__logout" onclick="logout()">Sair</button>
    </div>
  `;
  let slot = document.getElementById('sidebar');
  if (!slot) {
    slot = document.createElement('aside');
    slot.id = 'sidebar';
    slot.className = 'sidebar';
    document.body.insertAdjacentHTML('afterbegin', '<div class="layout"></div>');
    document.querySelector('.layout').appendChild(slot);
    document.querySelector('.layout').insertAdjacentHTML('beforeend', '<div class="content" id="appContent"></div>');
    const cur = document.querySelector('script[data-page]');
    if (cur) document.getElementById('appContent').innerHTML = cur.innerHTML;
  }
  slot.innerHTML = html;
  enhanceCrmShell();
}
window.logout = logout;

/* ---- Shell moderno compartilhado ---- */
function enhanceCrmShell() {
  if (document.querySelector('.crm-appbar')) return;
  const content = document.querySelector('.content');
  const sidebar = document.getElementById('sidebar');
  if (!content || !sidebar) return;
  const user = getUser();
  document.documentElement.dataset.theme = localStorage.getItem('crm_theme') || 'light';
  document.body.classList.toggle('sidebar-collapsed', localStorage.getItem('crm_sidebar') === 'collapsed');

  const bar = document.createElement('header');
  bar.className = 'crm-appbar';
  bar.innerHTML = '<div class="crm-appbar__left"><button class="appbar-btn" id="crmMenuBtn" aria-label="Abrir menu">☰</button><div class="global-search"><span aria-hidden="true">⌕</span><input id="globalSearch" type="search" placeholder="Buscar no CRM..." autocomplete="off"><div class="global-search__results" id="globalSearchResults"></div></div></div><div class="crm-appbar__actions"><a class="appbar-btn" href="../index.html" target="_blank" title="Abrir site" aria-label="Abrir site">↗</a><button class="appbar-btn" id="themeBtn" title="Alternar tema" aria-label="Alternar tema">◐</button><button class="appbar-btn appbar-notification" id="notificationBtn" title="Pendências" aria-label="Pendências">♢<span id="notificationCount"></span></button><div class="appbar-profile"><span class="appbar-avatar">' + esc((user.nome || 'U').charAt(0).toUpperCase()) + '</span><span><strong>' + esc(user.nome || 'Usuário') + '</strong><small>' + (user.role === 'admin' ? 'Administrador' : 'Corretor') + '</small></span></div></div>';
  document.body.insertBefore(bar, content);
  const overlay = document.createElement('button'); overlay.className = 'sidebar-overlay'; overlay.setAttribute('aria-label','Fechar menu'); document.body.appendChild(overlay);

  function closeMobile() { document.body.classList.remove('sidebar-mobile-open'); }
  document.getElementById('crmMenuBtn').addEventListener('click', () => {
    if (matchMedia('(max-width: 900px)').matches) document.body.classList.toggle('sidebar-mobile-open');
    else { document.body.classList.toggle('sidebar-collapsed'); localStorage.setItem('crm_sidebar', document.body.classList.contains('sidebar-collapsed') ? 'collapsed' : 'open'); }
  });
  overlay.addEventListener('click', closeMobile);
  sidebar.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMobile));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobile(); });
  document.getElementById('themeBtn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next; localStorage.setItem('crm_theme', next);
  });

  const input = document.getElementById('globalSearch'), results = document.getElementById('globalSearchResults');
  let searchTimer;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer); const q=input.value.trim().toLowerCase();
    if(q.length<2){results.classList.remove('show');return;}
    searchTimer=setTimeout(async()=>{try{
      const sources=await Promise.all([
        apiGet('/leads').then(x=>x.slice(0,80).map(r=>({label:r.nome,sub:'Lead · '+(r.telefone||''),href:'leads.html'}))).catch(()=>[]),
        apiGet('/clientes').then(x=>x.slice(0,80).map(r=>({label:r.nome,sub:'Cliente · '+(r.telefone||''),href:'clientes.html'}))).catch(()=>[]),
        apiGet('/apolices').then(x=>x.slice(0,80).map(r=>({label:r.numero||r.produto,sub:'Apólice · '+r.produto,href:'apolices.html'}))).catch(()=>[])
      ]);const found=sources.flat().filter(x=>(x.label+' '+x.sub).toLowerCase().includes(q)).slice(0,8);
      results.innerHTML=found.length?found.map(x=>'<a href="'+x.href+'"><strong>'+esc(x.label)+'</strong><small>'+esc(x.sub)+'</small></a>').join(''):'<div class="search-empty">Nenhum resultado</div>';results.classList.add('show');
    }catch(_){results.classList.remove('show');}},250);
  });
  document.addEventListener('click',(e)=>{if(!e.target.closest('.global-search'))results.classList.remove('show');});
  apiGet('/dashboard').then((d)=>{const n=(d.agendamentosAtrasados||0)+(d.leadsNaoAtribuidos||0)+(d.followupsLeads||[]).length;const badge=document.getElementById('notificationCount');if(n){badge.textContent=n>99?'99+':n;badge.classList.add('show');}}).catch(()=>{});
  enhanceDataTables();
}

function enhanceDataTables() {
  if (location.pathname.endsWith('dashboard.html')) return;
  const process = () => document.querySelectorAll('.table-card table').forEach((table) => {
    const headRow=table.tHead&&table.tHead.rows[0]; if(!headRow)return;
    if(!headRow.querySelector('.bulk-check-head')){const th=document.createElement('th');th.className='bulk-check-head';th.innerHTML='<input type="checkbox" aria-label="Selecionar todos">';headRow.insertBefore(th,headRow.firstChild);}
    table.querySelectorAll('tbody tr:not(.empty-row)').forEach((row)=>{
      if(!row.querySelector('.bulk-check-cell')){const td=document.createElement('td');td.className='bulk-check-cell';td.innerHTML='<input type="checkbox" aria-label="Selecionar registro">';row.insertBefore(td,row.firstChild);}
      if(!row.dataset.quickBound){row.dataset.quickBound='1';row.addEventListener('dblclick',(e)=>{if(e.target.closest('button,a,input'))return;const heads=[...headRow.cells].slice(1).map(x=>x.textContent.trim());const vals=[...row.cells].slice(1).map(x=>x.textContent.trim());openModal('Visualização rápida','<div class="quick-view">'+heads.map((h,i)=>h&&vals[i]?'<div><small>'+esc(h)+'</small><strong>'+esc(vals[i])+'</strong></div>':'').join('')+'</div>','<button class="btn btn-primary" data-close>Fechar</button>');});}
    });
    const card=table.closest('.table-card');let bar=card.querySelector('.bulk-bar');
    if(!bar){bar=document.createElement('div');bar.className='bulk-bar';bar.innerHTML='<span><strong data-bulk-count>0</strong> selecionado(s)</span><button class="btn btn-outline btn-sm" type="button" data-export-selected>Exportar CSV</button>';card.insertBefore(bar,card.querySelector('.table-wrap'));bar.querySelector('[data-export-selected]').addEventListener('click',()=>exportSelected(table));}
    const update=()=>{const checks=[...table.querySelectorAll('.bulk-check-cell input:checked')];bar.querySelector('[data-bulk-count]').textContent=checks.length;bar.classList.toggle('show',checks.length>0);};
    const master=headRow.querySelector('.bulk-check-head input');if(!master.dataset.bound){master.dataset.bound='1';master.addEventListener('change',()=>{table.querySelectorAll('.bulk-check-cell input').forEach(c=>c.checked=master.checked);update();});}
    table.querySelectorAll('.bulk-check-cell input:not([data-bound])').forEach(c=>{c.dataset.bound='1';c.addEventListener('change',update);});
  });
  const observer=new MutationObserver(()=>process());observer.observe(document.querySelector('.content'),{subtree:true,childList:true});process();
}

function exportSelected(table) {
  const headers=[...table.tHead.rows[0].cells].slice(1).map(c=>c.textContent.trim()).filter(Boolean);
  const rows=[...table.querySelectorAll('.bulk-check-cell input:checked')].map(c=>[...c.closest('tr').cells].slice(1,headers.length+1).map(td=>td.textContent.trim()));
  if(!rows.length){toast('Selecione ao menos um registro.',true);return;}
  const csv=[headers,...rows].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\n');
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='crm-exportacao.csv';a.click();URL.revokeObjectURL(a.href);
}
