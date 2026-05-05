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

  it('creates an equal editor grid on both axes from the P-derived step', () => {
    const geometry = createGeometry({ ...defaultParams, P: 14 });

    expect(geometry.gridStep).toBe(1);
    expect(geometry.xPositions).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(geometry.yPositions).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('marks perimeter segments separately from interior segments', () => {
    const geometry = createGeometry(defaultParams);

    expect(geometry.segments.some((segment) => segment.kind === 'perimeter')).toBe(true);
    expect(geometry.segments.some((segment) => segment.kind === 'interior')).toBe(true);
  });

  it('assigns cell-side wall codes that can describe a wall as A4L style references', () => {
    const geometry = createGeometry(defaultParams);
    const leftPerimeter = geometry.segments.find((segment) => segment.id === 'y-0-0');
    const firstInteriorVertical = geometry.segments.find((segment) => segment.id === 'y-1-0');
    const firstInteriorHorizontal = geometry.segments.find((segment) => segment.id === 'x-1-0');

    expect((leftPerimeter as { code?: string } | undefined)?.code).toBe('A1L');
    expect((firstInteriorVertical as { code?: string } | undefined)?.code).toBe('A1R');
    expect((firstInteriorHorizontal as { code?: string } | undefined)?.code).toBe('A1T');
  });
});
