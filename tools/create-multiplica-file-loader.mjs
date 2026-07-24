import { readFile, writeFile } from 'node:fs/promises';

const state = await readFile('qa/multiplica-carga-qa-completa.json', 'utf8');
const safeState = state.replace(/<\//g, '<\\/');

const html = `<!doctype html>
<html lang="es">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cargar Multiplica QA en archivo local</title>
<style>
  body{font-family:Arial,sans-serif;background:#111;color:#f8f3ec;min-height:100vh;display:grid;place-items:center;margin:0}
  main{max-width:720px;padding:32px;border:1px solid #333842;border-radius:12px;background:#222228}
  h1{margin:0 0 12px;color:#f07d36}
  p{line-height:1.5;color:#c9c1b8}
  button{background:#f07d36;color:white;border:0;border-radius:8px;padding:12px 18px;font-weight:800;cursor:pointer}
  code{color:#4db8e8}
</style>
<main>
  <h1>Cargar Multiplica QA en archivo local</h1>
  <p>Usa este cargador cuando abras Nexo Klar desde <code>file://</code>, como lo estás haciendo ahora.</p>
  <p>Instala la cuenta local <code>Multiplica / 76.541.329-K</code> con data marcada <code>QA 1</code>, <code>QA 2</code>, <code>QA 3</code> y sucesivos.</p>
  <button id="load">Cargar Multiplica y abrir AccesoMina_v6.html</button>
  <p id="status"></p>
</main>
<script type="application/json" id="qa-state">${safeState}</script>
<script>
const tenantId = '76541329K';
const tenantKey = id => 'accesomina_v6_tenant_' + id;
document.getElementById('load').addEventListener('click', () => {
  const status = document.getElementById('status');
  try {
    const state = JSON.parse(document.getElementById('qa-state').textContent);
    localStorage.setItem(tenantKey(tenantId), JSON.stringify(state));
    localStorage.setItem('accesomina_v6_client_registry', JSON.stringify([{
      id: tenantId,
      nombre: state.empresa.nombre,
      rut: state.empresa.rut,
      email: state.empresa.email,
      tel: state.empresa.tel,
      creado: '2026-07-22',
      actualizado: '2026-07-22',
      admin: false
    }]));
    sessionStorage.setItem('accesomina_current_tenant', tenantId);
    sessionStorage.setItem('accesomina_current_user', 'ricardo.hornig.sube@gmail.com');
    status.textContent = 'Carga lista. Abriendo AccesoMina_v6.html...';
    location.href = '../AccesoMina_v6.html';
  } catch (error) {
    status.textContent = 'No se pudo cargar: ' + error.message;
  }
});
</script>
</html>
`;

await writeFile('qa/load-multiplica-file.html', html, 'utf8');
console.log('qa/load-multiplica-file.html creado');
