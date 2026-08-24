<?php
require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../auth.php';

const BLOG_INTS = ['id', 'autor_id'];

function blog_slug(string $value): string {
  $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
  $value = strtolower(trim($value));
  return trim(preg_replace('/[^a-z0-9]+/', '-', $value), '-');
}

function blog_clean(array $b, array $old = []): array {
  $titulo = mb_substr(trim((string)($b['titulo'] ?? $old['titulo'] ?? '')), 0, 180);
  $conteudo = mb_substr(trim((string)($b['conteudo'] ?? $old['conteudo'] ?? '')), 0, 100000);
  $slug = mb_substr(blog_slug((string)($b['slug'] ?? $titulo ?: ($old['slug'] ?? ''))), 0, 140);
  if ($titulo === '' || $conteudo === '' || $slug === '') json_error(400, 'Título e conteúdo são obrigatórios');
  return [
    'titulo'=>$titulo, 'slug'=>$slug, 'conteudo'=>$conteudo,
    'resumo'=>str_or_null($b['resumo'] ?? $old['resumo'] ?? null, 500),
    'categoria'=>str_or_null($b['categoria'] ?? $old['categoria'] ?? null, 80),
    'imagem_url'=>str_or_null($b['imagem_url'] ?? $old['imagem_url'] ?? null, 500),
    'status'=>(($b['status'] ?? $old['status'] ?? '') === 'publicado') ? 'publicado' : 'rascunho',
  ];
}

function blog_dispatch(string $method, array $parts): void {
  $first = $parts[0] ?? '';
  if ($first === 'admin') {
    $user = current_user(); require_role($user, 'admin');
    $id = isset($parts[1]) && ctype_digit($parts[1]) ? (int)$parts[1] : null;
    if ($method === 'POST' && ($parts[1] ?? '') === 'upload') blog_admin_upload();
    if ($method === 'GET' && $id === null) blog_admin_list();
    if ($method === 'GET' && $id) blog_admin_get($id);
    if ($method === 'POST' && $id === null) blog_admin_create($user);
    if ($method === 'PUT' && $id) blog_admin_update($id);
    if ($method === 'DELETE' && $id) blog_admin_delete($id);
    json_error(404, 'Recurso não encontrado');
  }
  if ($method !== 'GET') json_error(405, 'Método não permitido');
  if ($first === '') blog_public_list();
  blog_public_get($first);
}

function blog_admin_upload(): void {
  $b=body(); $type=(string)($b['type']??''); $data=(string)($b['data']??'');
  $allowed=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];
  if(!isset($allowed[$type])||$data==='') json_error(400,'Envie uma imagem JPG, PNG ou WebP');
  $raw=base64_decode(preg_replace('#^data:[^;]+;base64,#','',$data),true);
  if($raw===false||strlen($raw)===0||strlen($raw)>5*1024*1024) json_error(400,'A imagem deve ter no máximo 5 MB');
  $ext=$allowed[$type]; $valid=($ext==='jpg'&&substr($raw,0,2)==="\xFF\xD8")||($ext==='png'&&substr($raw,0,8)==="\x89PNG\r\n\x1A\n")||($ext==='webp'&&substr($raw,0,4)==='RIFF'&&substr($raw,8,4)==='WEBP');
  if(!$valid) json_error(400,'O conteúdo do arquivo não corresponde ao formato informado');
  $dir=dirname(__DIR__,2).'/assets/img/blog'; if(!is_dir($dir)) mkdir($dir,0775,true);
  $name=time().'-'.bin2hex(random_bytes(6)).'.'.$ext;
  if(file_put_contents($dir.'/'.$name,$raw,LOCK_EX)===false) json_error(500,'Não foi possível salvar a imagem');
  json_response(['ok'=>true,'url'=>'assets/img/blog/'.$name],201);
}

function blog_admin_list(): void {
  json_response(q_all("SELECT p.*,u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id ORDER BY p.criado_em DESC", [], BLOG_INTS));
}
function blog_admin_get(int $id): void {
  $row=q_one('SELECT * FROM blog_posts WHERE id=?',[$id],BLOG_INTS);
  if(!$row) json_error(404,'Artigo não encontrado'); json_response($row);
}
function blog_admin_create(array $user): void {
  $p=blog_clean(body()); $published=$p['status']==='publicado'?date('c'):null;
  try {
    q_run('INSERT INTO blog_posts (titulo,slug,resumo,conteudo,categoria,imagem_url,status,autor_id,publicado_em) VALUES (?,?,?,?,?,?,?,?,?)',[$p['titulo'],$p['slug'],$p['resumo'],$p['conteudo'],$p['categoria'],$p['imagem_url'],$p['status'],$user['id'],$published]);
    json_response(['id'=>(int)db()->lastInsertId(),'ok'=>true],201);
  } catch(PDOException $e) { if(str_contains($e->getMessage(),'UNIQUE')) json_error(409,'Já existe um artigo com esse endereço'); throw $e; }
}
function blog_admin_update(int $id): void {
  $old=q_one('SELECT * FROM blog_posts WHERE id=?',[$id],BLOG_INTS); if(!$old) json_error(404,'Artigo não encontrado');
  $p=blog_clean(body(),$old); $published=$p['status']==='publicado'?($old['publicado_em']?:date('c')):null;
  try {
    q_run("UPDATE blog_posts SET titulo=?,slug=?,resumo=?,conteudo=?,categoria=?,imagem_url=?,status=?,publicado_em=?,atualizado_em=datetime('now') WHERE id=?",[$p['titulo'],$p['slug'],$p['resumo'],$p['conteudo'],$p['categoria'],$p['imagem_url'],$p['status'],$published,$id]);
    json_response(['ok'=>true]);
  } catch(PDOException $e) { if(str_contains($e->getMessage(),'UNIQUE')) json_error(409,'Já existe um artigo com esse endereço'); throw $e; }
}
function blog_admin_delete(int $id): void { if(q_run('DELETE FROM blog_posts WHERE id=?',[$id])===0) json_error(404,'Artigo não encontrado'); json_response(['ok'=>true]); }
function blog_public_list(): void {
  $cat=trim((string)($_GET['categoria']??''));
  $sql="SELECT p.id,p.titulo,p.slug,p.resumo,p.categoria,p.imagem_url,p.publicado_em,u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id WHERE p.status='publicado'";
  $args=[]; if($cat!==''){ $sql.=' AND p.categoria=?'; $args[]=$cat; }
  json_response(q_all($sql.' ORDER BY p.publicado_em DESC',$args,BLOG_INTS));
}
function blog_public_get(string $slug): void {
  $row=q_one("SELECT p.*,u.nome autor_nome FROM blog_posts p LEFT JOIN usuarios u ON u.id=p.autor_id WHERE p.slug=? AND p.status='publicado'",[$slug],BLOG_INTS);
  if(!$row) json_error(404,'Artigo não encontrado'); json_response($row);
}
