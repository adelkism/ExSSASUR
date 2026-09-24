import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../cloudflare/worker.js';

const ACCESS_TOKEN = 'enlace-de-prueba-largo-y-no-publico';

function environment() {
  let assetRequests = 0;
  return {
    env: {
      ACCESS_TOKEN,
      ASSETS: {
        async fetch() {
          assetRequests += 1;
          return new Response('<h1>ExSSASUR</h1>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        },
      },
    },
    get assetRequests() {
      return assetRequests;
    },
  };
}

test('rechaza solicitudes sin enlace ni sesión', async () => {
  const state = environment();
  const response = await worker.fetch(new Request('https://private.example/'), state.env);

  assert.equal(response.status, 404);
  assert.equal(state.assetRequests, 0);
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
});

test('intercambia el enlace secreto por una cookie y limpia la URL', async () => {
  const state = environment();
  const response = await worker.fetch(
    new Request(`https://private.example/?access=${ACCESS_TOKEN}`),
    state.env,
  );

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), 'https://private.example/');
  assert.match(response.headers.get('Set-Cookie'), /^exssasur_session=[a-f0-9]{64};/);
  assert.match(response.headers.get('Set-Cookie'), /HttpOnly; Secure; SameSite=Strict/);
  assert.equal(state.assetRequests, 0);
});

test('sirve la aplicación solo después de crear una sesión válida', async () => {
  const state = environment();
  const login = await worker.fetch(
    new Request(`https://private.example/?access=${ACCESS_TOKEN}`),
    state.env,
  );
  const cookie = login.headers.get('Set-Cookie').split(';', 1)[0];

  const response = await worker.fetch(
    new Request('https://private.example/', { headers: { Cookie: cookie } }),
    state.env,
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), '<h1>ExSSASUR</h1>');
  assert.equal(state.assetRequests, 1);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer');
});

test('un enlace incorrecto no crea sesión ni entrega archivos', async () => {
  const state = environment();
  const response = await worker.fetch(
    new Request('https://private.example/?access=incorrecto'),
    state.env,
  );

  assert.equal(response.status, 404);
  assert.equal(response.headers.get('Set-Cookie'), null);
  assert.equal(state.assetRequests, 0);
});
