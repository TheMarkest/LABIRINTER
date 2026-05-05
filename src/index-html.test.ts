import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('index.html', () => {
  it('declares a favicon asset for the deployed page', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

    expect(html).toMatch(/<link[^>]+rel="icon"[^>]+href="\/favicon\.svg"/i);
  });
});
