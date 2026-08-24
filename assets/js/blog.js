(function () {
  const grid = document.getElementById('blogGrid');
  const search = document.getElementById('blogSearch');
  const category = document.getElementById('blogCategory');
  const top = document.getElementById('blogTop');
  const categoryBar = document.getElementById('categoryBar');
  const sidebarCategories = document.getElementById('sidebarCategories');
  let posts = [];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = (s) => s ? new Date(String(s).replace(' ', 'T')).toLocaleDateString('pt-BR') : '';
  const safeImage = (u) => /^(https:\/\/|assets\/)/.test(String(u || '')) ? u : '';
  function media(p, cls) {
    const img = safeImage(p.imagem_url);
    return img ? '<img class="' + cls + '__image" src="' + esc(img) + '" alt="" loading="lazy">' : '<div class="' + cls + '__cover" aria-hidden="true">VO</div>';
  }
  function setCategory(value) {
    category.value = value; render();
  }
  function render() {
    const q = search.value.toLowerCase();
    const cat = category.value;
    const rows = posts.filter((p) => (!cat || p.categoria === cat) && (!q || (p.titulo + ' ' + (p.resumo || '') + ' ' + (p.categoria || '')).toLowerCase().includes(q)));
    if (!rows.length) { top.innerHTML = '<div class="blog-empty">Nenhuma notícia publicada encontrada.</div>'; grid.innerHTML = ''; return; }
    const lead = rows[0], side = rows.slice(1, 3);
    top.innerHTML = '<article class="headline"><a class="headline__media" href="artigo.html?slug=' + encodeURIComponent(lead.slug) + '">' + media(lead, 'headline') + '</a><span class="headline__tag">' + esc(lead.categoria || 'Conteúdo') + ' · ' + date(lead.publicado_em) + '</span><h2><a href="artigo.html?slug=' + encodeURIComponent(lead.slug) + '">' + esc(lead.titulo) + '</a></h2><p>' + esc(lead.resumo || 'Leia a notícia completa.') + '</p></article><div class="top-side">' + side.map((p) => '<article class="side-story"><a href="artigo.html?slug=' + encodeURIComponent(p.slug) + '">' + media(p, 'side-story') + '</a><span class="news-item__tag">' + esc(p.categoria || 'Conteúdo') + '</span><h3><a href="artigo.html?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.titulo) + '</a></h3></article>').join('') + '</div>';
    grid.innerHTML = rows.slice(3).length ? rows.slice(3).map((p) => '<article class="news-item"><a href="artigo.html?slug=' + encodeURIComponent(p.slug) + '">' + media(p, 'news-item') + '</a><div><span class="news-item__tag">' + esc(p.categoria || 'Conteúdo') + '</span><h2><a href="artigo.html?slug=' + encodeURIComponent(p.slug) + '">' + esc(p.titulo) + '</a></h2><p>' + esc(p.resumo || 'Leia a notícia completa.') + '</p><span class="news-item__meta">' + date(p.publicado_em) + (p.autor_nome ? ' · Por ' + esc(p.autor_nome) : '') + '</span></div></article>').join('') : '<div class="blog-empty">Novas notícias serão publicadas em breve.</div>';
  }
  fetch('/api/blog').then((r) => r.ok ? r.json() : Promise.reject()).then((data) => {
    posts = data;
    [...new Set(posts.map((p) => p.categoria).filter(Boolean))].sort().forEach((c) => {
      const option = document.createElement('option'); option.value = c; option.textContent = c; category.appendChild(option);
      const topButton = document.createElement('button'); topButton.type = 'button'; topButton.dataset.category = c; topButton.textContent = c; categoryBar.appendChild(topButton);
      const sideButton = document.createElement('button'); sideButton.type = 'button'; sideButton.textContent = c; sideButton.addEventListener('click', () => setCategory(c)); sidebarCategories.appendChild(sideButton);
    });
    render();
  }).catch(() => { grid.innerHTML = '<div class="blog-empty">Não foi possível carregar os artigos agora.</div>'; });
  search.addEventListener('input', render); category.addEventListener('change', render);
  categoryBar.addEventListener('click', (event) => { const button = event.target.closest('[data-category]'); if (button) setCategory(button.dataset.category); });
}());
