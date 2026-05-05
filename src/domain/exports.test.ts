import { describe, expect, it } from 'vitest';
import type { ExportRow } from './types';
import { buildCsvContent, buildPdfPlanLayout, getPdfPalette, getTableInstructionSections, parseCsvContent } from './exports';
import { createGeometry } from './geometry';
import { defaultParams } from './params';

describe('buildCsvContent', () => {
  it('includes coordinate and area columns', () => {
    const rows: ExportRow[] = [
      {
        code: 'A2T',
        id: 'seg-1',
        cell: 'A2',
        side: 'T',
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

    const csv = buildCsvContent({
      schemeTitle: 'North Maze',
      params: defaultParams,
      rows,
    });

    expect(csv).toContain(
      'code,id,cell,side,kind,axis,gridIndexA,gridIndexB,startX,startY,endX,endY,length,visibleHeight,cutWidth,cutHeight,visibleArea,cutArea',
    );
    expect(csv).toContain('meta,schemeTitle,North Maze');
    expect(csv).toContain('A2T');
    expect(csv).toContain('seg-1');
    expect(csv).toContain('11.96');
  });

  it('round-trips scheme title, params, and selected rows from csv', () => {
    const rows: ExportRow[] = [
      {
        code: 'A2T',
        id: 'seg-1',
        cell: 'A2',
        side: 'T',
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

    const csv = buildCsvContent({
      schemeTitle: 'North Maze',
      params: { ...defaultParams, P: 14 },
      rows,
    });
    const parsed = parseCsvContent(csv);

    expect(parsed.schemeTitle).toBe('North Maze');
    expect(parsed.params).toMatchObject({ ...defaultParams, P: 14 });
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.selectedIds).toEqual(['seg-1']);
  });

  it('keeps the PDF plan grid inside the plan frame after reserving axis gutters', () => {
    const geometry = createGeometry({ ...defaultParams, P: 14 });
    const layout = buildPdfPlanLayout(geometry);

    expect(layout.plotLeft).toBeGreaterThan(layout.frame.left);
    expect(layout.plotTop).toBeGreaterThan(layout.frame.top);
    expect(layout.plotRight).toBeLessThan(layout.frame.left + layout.frame.width);
    expect(layout.plotBottom).toBeLessThan(layout.frame.top + layout.frame.height);
    expect(layout.toPdfY(0)).toBe(layout.plotBottom);
    expect(layout.toPdfY(geometry.height)).toBe(layout.plotTop);
  });

  it('provides bilingual table instructions and a grayscale print palette for pdf export', () => {
    const instructions = getTableInstructionSections();
    const palette = getPdfPalette();

    expect(instructions).toHaveLength(2);
    expect(instructions[0].title).toMatch(/\u041a\u0430\u043a \u0447\u0438\u0442\u0430\u0442\u044c \u0442\u0430\u0431\u043b\u0438\u0446\u0443/i);
    expect(instructions[0].lines.join(' ')).toContain('A4L');
    expect(instructions[1].title).toMatch(/How to read the table/i);

    Object.values(palette).forEach((tone) => {
      expect(tone[0]).toBe(tone[1]);
      expect(tone[1]).toBe(tone[2]);
    });
  });
});
