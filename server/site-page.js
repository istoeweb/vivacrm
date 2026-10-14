// Entrega as páginas institucionais (início, sobre, contato, política, blog) já
// com os textos editados no CRM aplicados no servidor — o Google e as prévias de
// links leem o conteúdo final, sem depender de JavaScript.
const path = require('path');
const db = require('./db');
const { readPage, renderPage, carregarValores } = require('./editable');

// Arquivo público → id da página no CRM (usado no título/descrição de SEO).
const PAGE_IDS = {
  'index.html': 'home',
  'sobre.html': 'sobre',
  'contato.html': 'contato',
  'politica-de-privacidade.html': 'politica',
  'blog.html': 'blog',
};

module.exports = function sitePage(siteDir) {
  return (arquivo) => async (_req, res) => {
    let valores = {};
    try {
      valores = await carregarValores(db);
    } catch (err) {
      // Banco indisponível: mantém o site no ar com os textos do arquivo.
      console.error('Página sem textos do banco:', err.message);
      return res.sendFile(path.join(siteDir, arquivo));
    }
    res.type('html').send(renderPage(readPage(arquivo), valores, PAGE_IDS[arquivo]));
  };
};

module.exports.PAGE_IDS = PAGE_IDS;
