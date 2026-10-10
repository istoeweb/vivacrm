// Imagens do blog: Supabase Storage (bucket público) quando SUPABASE_URL e
// SUPABASE_SERVICE_ROLE_KEY estão definidos; senão, disco local
// (BLOG_UPLOAD_DIR ou assets/img/blog, servido pelo Express em /assets/img/blog).
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET = process.env.SUPABASE_BUCKET || 'blog';
const useSupabase = Boolean(SUPABASE_URL && SERVICE_KEY);

const headers = (extra = {}) => ({ Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY, ...extra });

// Cria o bucket público na primeira gravação; "já existe" não é erro.
let bucketReady;
function ensureBucket() {
  bucketReady ??= fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  }).then(async (r) => {
    if (r.ok) return;
    const body = await r.text();
    if (!/already exists|duplicate/i.test(body)) throw new Error(`Supabase Storage: falha ao criar bucket (${r.status}) ${body}`);
  }).catch((err) => { bucketReady = undefined; throw err; });
  return bucketReady;
}

function localDir() {
  return process.env.BLOG_UPLOAD_DIR
    ? path.resolve(process.env.BLOG_UPLOAD_DIR)
    : path.join(__dirname, '..', 'assets', 'img', 'blog');
}

// Grava a imagem e devolve a URL usada em blog_posts.imagem_url.
async function saveBlogImage(filename, buffer, contentType, { upsert = false } = {}) {
  if (useSupabase) {
    await ensureBucket();
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(filename)}`, {
      method: 'POST',
      headers: headers({ 'Content-Type': contentType, 'cache-control': 'max-age=31536000', 'x-upsert': String(upsert) }),
      body: buffer,
    });
    if (!r.ok) throw new Error(`Supabase Storage: falha no upload (${r.status}) ${await r.text()}`);
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(filename)}`;
  }
  const dir = localDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), buffer, { flag: 'wx' });
  return `assets/img/blog/${filename}`;
}

module.exports = { saveBlogImage, localDir, useSupabase };
