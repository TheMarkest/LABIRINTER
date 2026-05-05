import { describe, expect, it } from 'vitest';
import { createGeometry } from './geometry';
import { defaultParams } from './params';

describe('createGeometry', () => {
  it('creates a 4x4 default site with 15m width and height', () => {
    const geometry = createGeometry(defaultParams);

    expect(geometry.width).toBe(15);
    expect(geometry.height).toBe(15);
  });

  it('creates evenly spaced internal transverse lines', () => {
    const geometry = createGeometry({ ...defaultParams, K: 4, D: 5, P: 2 });

    expect(geometry.transverseLines.map((line) => line.x)).toEqual([5, 10]);
  });

  it('marks perimeter segments separately from interior segments', () => {
    const geometry = createGeometry(defaultParams);

    expect(geometry.segments.some((segment) => segment.kind === 'perimeter')).toBe(true);
    expect(geometry.segments.some((segment) => segment.kind === 'interior')).toBe(true);
  });
});
