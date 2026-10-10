/*
 * Copia os dados de um banco SQLite do CRM para o Postgres do Supabase.
 *
 *   node scripts/sqlite-to-supabase.js [caminho/do/crm.db] [--images-dir=pasta]
 *
 * - Destino: DATABASE_URL (server/.env). O banco de destino precisa estar vazio
 *   (sem usuários); o schema é criado automaticamente.
 * - Mantém os ids originais e ajusta as sequências do Postgres.
 * - Com SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY, envia as imagens do blog
 *   (assets/img/blog/...) para o Supabase Storage e atualiza imagem_url.
 *   A pasta das imagens é --images-dir, BLOG_UPLOAD_DIR ou assets/img/blog.
 * Tudo roda numa transação: se algo falhar, nada é gravado no Postgres.
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const sourcePath = path.resolve(args.find((a) => !a.startsWith('--')) || path.join(__dirname, '..', 'crm.db'));
const imagesArg = args.find((a) => a.startsWith('--images-dir='));

const TABLES = ['usuarios', 'leads', 'clientes', 'apolices', 'sinistros', 'agendamentos', 'blog_posts', 'site_conteudo'];

async function main() {
  const db = require('../db');
  if (db.driver !== 'postgres' || !process.env.DATABASE_URL) throw new Error('Defina DATABASE_URL (Supabase) em server/.env.');
  if (!fs.existsSync(sourcePath)) throw new Error(`SQLite não encontrado: ${sourcePath}`);
  await db.ready;

  const { DatabaseSync } = require('node:sqlite');
  const source = new DatabaseSync(sourcePath, { readOnly: true });
  const storage = require('../storage');
  if (imagesArg) process.env.BLOG_UPLOAD_DIR = imagesArg.split('=')[1];

  const client = await db.client.connect();
  try {
    const { rows: [{ n }] } = await client.query('SELECT COUNT(*)::int AS n FROM usuarios');
    if (n > 0) throw new Error(`O Postgres já tem ${n} usuário(s). A migração só roda num banco vazio.`);

    await client.query('BEGIN');
    for (const table of TABLES) {
      const { rows: cols } = await client.query(
        'SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1', [table]);
      const targetCols = new Set(cols.map((c) => c.column_name));
      const rows = source.prepare(`SELECT * FROM ${table}`).all();
      for (const row of rows) {
        const keys = Object.keys(row).filter((k) => targetCols.has(k));
        const values = keys.map((k) => row[k]);
        const conflict = table === 'site_conteudo' ? ' ON CONFLICT (chave) DO UPDATE SET valor = excluded.valor, atualizado_em = excluded.atualizado_em' : '';
        await client.query(
          `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')})${conflict}`, values);
      }
      if (targetCols.has('id')) {
        await client.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM ${table}`);
      }
      console.log(`${table}: ${rows.length} linha(s)`);
    }

    if (storage.useSupabase) {
      const dir = storage.localDir();
      const { rows: posts } = await client.query("SELECT id, imagem_url FROM blog_posts WHERE imagem_url LIKE 'assets/img/blog/%'");
      for (const post of posts) {
        const filename = path.basename(post.imagem_url);
        const file = path.join(dir, filename);
        if (!fs.existsSync(file)) { console.warn(`Imagem não encontrada, mantida como está: ${file}`); continue; }
        const type = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[path.extname(filename).toLowerCase()];
        const url = await storage.saveBlogImage(filename, fs.readFileSync(file), type || 'application/octet-stream', { upsert: true });
        await client.query('UPDATE blog_posts SET imagem_url = $1 WHERE id = $2', [url, post.id]);
        console.log(`Imagem enviada: ${filename}`);
      }
    }

    await client.query('COMMIT');
    console.log('Migração concluída.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
    source.close();
    await db.close();
  }
}

main().catch((err) => { console.error('Falha na migração:', err.message); process.exit(1); });
