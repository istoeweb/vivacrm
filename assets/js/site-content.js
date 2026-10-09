/*
 * CMS-lite do site: busca o conteúdo editável no painel e aplica nas páginas.
 * - Atualiza TODOS os links de WhatsApp (wa.me) e telefone (tel:) a partir de um
 *   único campo `contato.whatsapp`, preservando parâmetros ?text=.
 * - Substitui o telefone de exibição padrão pelo configurado.
 * - Preenche elementos marcados com data-cms / data-cms-href e oculta os
 *   marcados com data-cms-show quando o valor estiver vazio.
 * Falha em silêncio para nunca quebrar o site caso a API esteja indisponível.
 */
(function () {
  // Textos padrão presentes no HTML estático usados como âncora para substituição.
  var TEXT_ANCHORS = [
    { key: 'contato.telefone', anchor: '(12) 97600-2718' },
    { key: 'contato.endereco', anchor: 'Jacare\u00ed \u2013 SP \u00b7 Vale do Para\u00edba' },
  ];

  function onlyDigits(s) { return String(s || '').replace(/\D/g, ''); }

  function applyWhatsApp(content) {
    var wpp = onlyDigits(content['contato.whatsapp']);
    if (!wpp) return;
    document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
      a.href = a.getAttribute('href').replace(/wa\.me\/\d+/, 'wa.me/' + wpp);
    });
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      a.href = 'tel:+' + wpp;
    });
  }

  function replaceText(content) {
    TEXT_ANCHORS.forEach(function (item) {
      var value = (content[item.key] || '').trim();
      if (!value || value === item.anchor) return;
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      var nodes = [];
      while (walker.nextNode()) if (walker.currentNode.nodeValue.indexOf(item.anchor) !== -1) nodes.push(walker.currentNode);
      nodes.forEach(function (n) { n.nodeValue = n.nodeValue.split(item.anchor).join(value); });
    });
  }

  function hydrateSlots(content) {
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var key = el.getAttribute('data-cms');
      if (key in content && content[key] !== '') el.textContent = content[key];
    });
    document.querySelectorAll('[data-cms-href]').forEach(function (el) {
      var key = el.getAttribute('data-cms-href');
      if (content[key]) el.setAttribute('href', content[key]);
    });
    document.querySelectorAll('[data-cms-mailto]').forEach(function (el) {
      var key = el.getAttribute('data-cms-mailto');
      if (content[key]) el.setAttribute('href', 'mailto:' + content[key]);
    });
    document.querySelectorAll('[data-cms-show]').forEach(function (el) {
      var key = el.getAttribute('data-cms-show');
      if (!content[key]) el.style.display = 'none';
    });
    document.querySelectorAll('[data-cms-show-any]').forEach(function (el) {
      var keys = el.getAttribute('data-cms-show-any').split(',').map(function (k) { return k.trim(); });
      if (!keys.some(function (k) { return content[k]; })) el.style.display = 'none';
    });
  }

  function apply(content) {
    try { applyWhatsApp(content); } catch (e) {}
    try { replaceText(content); } catch (e) {}
    try { hydrateSlots(content); } catch (e) {}
  }

  function run() {
    fetch('/api/site/content')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (content) { if (content) apply(content); })
      .catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
}());
