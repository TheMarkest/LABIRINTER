import { describe, expect, it } from 'vitest';
import { buildExportRows, buildSelectionSummary } from './calculations';
import { createGeometry } from './geometry';
import { defaultParams } from './params';

describe('buildSelectionSummary', () => {
  it('calculates visible and cut area from selected segments', () => {
    const geometry = createGeometry(defaultParams);
    const perimeterSegment = geometry.segments.find((segment) => segment.kind === 'perimeter');
    const interiorSegment = geometry.segments.find((segment) => segment.kind === 'interior');

    expect(perimeterSegment).toBeDefined();
    expect(interiorSegment).toBeDefined();

    const selectedIds = new Set([perimeterSegment!.id, interiorSegment!.id]);
    const summary = buildSelectionSummary(geometry, selectedIds);

    expect(summary.selectedCount).toBe(2);
    expect(summary.perimeterCount).toBe(1);
    expect(summary.interiorCount).toBe(1);
    expect(summary.totalLength).toBeGreaterThan(0);
    expect(summary.totalVisibleArea).toBeGreaterThan(0);
    expect(summary.totalCutArea).toBeGreaterThan(summary.totalVisibleArea);
  });
});

describe('buildExportRows', () => {
  it('returns flattened coordinate rows for selected segments', () => {
    const geometry = createGeometry(defaultParams);
    const segment = geometry.segments[0];
    const rows = buildExportRows(geometry, new Set([segment.id]));

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: segment.id,
      kind: segment.kind,
      axis: segment.axis,
      startX: segment.from.x,
      startY: segment.from.y,
      endX: segment.to.x,
      endY: segment.to.y,
    });
  });
});
