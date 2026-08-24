(function () {
  const slot = document.getElementById('articleContent');
  const slug = new URLSearchParams(location.search).get('slug');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeImage = (u) => /^(https:\/\/|assets\/)/.test(String(u || '')) ? u : '';
  if (!slug) { slot.innerHTML = '<div class="article__body"><p>Artigo não encontrado.</p></div>'; return; }
  fetch('/api/blog/' + encodeURIComponent(slug)).then((r) => r.ok ? r.json() : Promise.reject()).then((p) => {
    document.title = p.titulo + ' | Vida de Ouro Jacareí';
    document.getElementById('metaDescription').content = p.resumo || 'Artigo do Blog Vida de Ouro Jacareí';
    const paragraphs = String(p.conteudo || '').split(/\n\s*\n/).filter(Boolean).map((x) => '<p>' + esc(x).replace(/\n/g, '<br>') + '</p>').join('');
    const image = safeImage(p.imagem_url);
    const published = p.publicado_em ? new Date(String(p.publicado_em).replace(' ', 'T')).toLocaleDateString('pt-BR') : '';
    slot.innerHTML = '<header class="article__head"><span class="section-tag">' + esc(p.categoria || 'Conteúdo') + '</span><h1>' + esc(p.titulo) + '</h1><p class="article__meta">' + (p.autor_nome ? 'Por ' + esc(p.autor_nome) + ' · ' : '') + published + '</p>' + (image ? '<img class="article__image" src="' + esc(image) + '" alt="">' : '') + '</header><article class="article__body">' + paragraphs + '<aside class="article__cta"><h2>Precisa de uma cotação?</h2><p>Fale com nossa equipe e receba orientação personalizada.</p><a class="btn btn--whatsapp" target="_blank" rel="noopener noreferrer" href="https://wa.me/5512976002718">Chamar no WhatsApp</a></aside></article>';
  }).catch(() => { slot.innerHTML = '<div class="article__body"><p>Este artigo não está disponível.</p></div>'; });
}());
