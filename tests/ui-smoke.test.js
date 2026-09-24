import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');

test('todos los controles usados por la aplicación existen en la interfaz', () => {
  const ids = [...app.matchAll(/byId\('([^']+)'\)/g)].map((match) => match[1]);
  assert.ok(ids.length > 0);
  for (const id of ids) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `Falta #${id} en index.html`);
  }
});

test('los cuatro módulos de trabajo tienen navegación y vista', () => {
  for (const view of ['results', 'evolution', 'outputs', 'closure']) {
    assert.match(html, new RegExp(`data-view-target=["']${view}["']`));
    assert.match(html, new RegExp(`data-view=["']${view}["']`));
  }
});

test('la aplicación no persiste información clínica en el navegador', () => {
  assert.doesNotMatch(app, /localStorage|sessionStorage|indexedDB/);
});
