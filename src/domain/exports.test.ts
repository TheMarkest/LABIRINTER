import { describe, expect, it } from 'vitest';
import type { ExportRow } from './types';
import { buildCsvContent } from './exports';

describe('buildCsvContent', () => {
  it('includes coordinate and area columns', () => {
    const rows: ExportRow[] = [
      {
        id: 'seg-1',
        kind: 'interior',
        axis: 'x',
        gridIndexA: 1,
        gridIndexB: 2,
        startX: 0,
        startY: 5,
        endX: 5,
        endY: 5,
        length: 5,
        visibleHeight: 2.1,
        cutWidth: 5.2,
        cutHeight: 2.3,
        visibleArea: 10.5,
        cutArea: 11.96,
      },
    ];

    const csv = buildCsvContent(rows);

    expect(csv).toContain(
      'id,kind,axis,gridIndexA,gridIndexB,startX,startY,endX,endY,length,visibleHeight,cutWidth,cutHeight,visibleArea,cutArea',
    );
    expect(csv).toContain('seg-1');
    expect(csv).toContain('11.96');
  });
});
