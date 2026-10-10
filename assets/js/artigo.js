(function () {
  const slot = document.getElementById('articleContent');
  const slug = new URLSearchParams(location.search).get('slug');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeImage = (u) => /^(https:\/\/|assets\/)/.test(String(u || '')) ? u : '';

  // Formatação simples usada pelo editor do CRM: "## " subtítulo, "### " intertítulo,
  // "• "/"- "/"* " item de lista, **negrito** e links https:// clicáveis.
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/https:\/\/[^\s<]+[^\s<.,;:!?)]/g, (u) => '<a href="' + u + '" target="_blank" rel="noopener noreferrer">' + u + '</a>');
  function renderContent(text) {
    const out = [];
    let para = [], list = [];
    const flushPara = () => { if (para.length) out.push('<p>' + para.map(inline).join('<br>') + '</p>'); para = []; };
    const flushList = () => { if (list.length) out.push('<ul>' + list.map((li) => '<li>' + inline(li) + '</li>').join('') + '</ul>'); list = []; };
    String(text || '').split(/\r?\n/).forEach((raw) => {
      const line = raw.trim();
      let m;
      if (!line) { flushPara(); flushList(); }
      else if ((m = line.match(/^(#{2,3})\s+(.+)/))) { flushPara(); flushList(); out.push(m[1].length === 2 ? '<h2>' + inline(m[2]) + '</h2>' : '<h3>' + inline(m[2]) + '</h3>'); }
      else if ((m = line.match(/^[•\-*]\s+(.+)/))) { flushPara(); list.push(m[1]); }
      else { flushList(); para.push(line); }
    });
    flushPara(); flushList();
    return out.join('');
  }

  function shareBar(title) {
    const url = location.href;
    const wa = 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url);
    return '<div class="article__share"><span>Compartilhe:</span><a class="share-btn share-btn--wa" href="' + esc(wa) + '" target="_blank" rel="noopener noreferrer">WhatsApp</a><button type="button" class="share-btn" id="copyLink">Copiar link</button></div>';
  }

  if (!slug) { slot.innerHTML = '<div class="article__body"><p>Artigo não encontrado.</p></div>'; return; }
  fetch('/api/blog/' + encodeURIComponent(slug)).then((r) => r.ok ? r.json() : Promise.reject()).then((p) => {
    document.title = p.titulo + ' | Vida de Ouro Jacareí';
    document.getElementById('metaDescription').content = p.resumo || 'Artigo do Blog Vida de Ouro Jacareí';
    if (p.palavras_chave) document.getElementById('metaKeywords').content = p.palavras_chave;
    const image = safeImage(p.imagem_url);
    const published = p.publicado_em ? new Date(String(p.publicado_em).replace(' ', 'T')).toLocaleDateString('pt-BR') : '';
    const words = String(p.conteudo || '').split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.round(words / 200)) + ' min de leitura';
    slot.innerHTML = '<header class="article__head"><span class="section-tag">' + esc(p.categoria || 'Conteúdo') + '</span><h1>' + esc(p.titulo) + '</h1><p class="article__meta">' + (p.autor_nome ? 'Por ' + esc(p.autor_nome) + ' · ' : '') + published + ' · ' + readTime + '</p>' + (image ? '<img class="article__image" src="' + esc(image) + '" alt="' + esc(p.titulo) + '">' : '') + '</header><article class="article__body">' + renderContent(p.conteudo) + shareBar(p.titulo) + '<aside class="article__cta"><h2>Precisa de uma cotação?</h2><p>Fale com nossa equipe e receba orientação personalizada.</p><a class="btn btn--whatsapp" target="_blank" rel="noopener noreferrer" href="https://wa.me/5512976002718">Chamar no WhatsApp</a></aside></article>';
    const copy = document.getElementById('copyLink');
    copy.addEventListener('click', () => {
      const done = () => { copy.textContent = 'Link copiado!'; setTimeout(() => { copy.textContent = 'Copiar link'; }, 2000); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, () => prompt('Copie o link:', location.href));
      else prompt('Copie o link:', location.href);
    });
  }).catch(() => { slot.innerHTML = '<div class="article__body"><p>Este artigo não está disponível.</p></div>'; });
}());
