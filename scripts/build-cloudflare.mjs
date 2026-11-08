import { cpSync, mkdirSync, rmSync } from 'node:fs';

const output = new URL('../dist/', import.meta.url);
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const path of ['index.html', 'styles.css', 'icon.svg']) {
  cpSync(new URL(`../${path}`, import.meta.url), new URL(path, output));
}

cpSync(new URL('../src/', import.meta.url), new URL('src/', output), { recursive: true });
