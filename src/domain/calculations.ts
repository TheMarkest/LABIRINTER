import type { ExportRow, GridGeometry, MaterialSummary } from './types';

function roundMetric(value: number) {
  return Number(value.toFixed(4));
}

export function buildSelectionSummary(geometry: GridGeometry, selectedIds: Set<string>): MaterialSummary {
  const selectedSegments = geometry.segments.filter((segment) => selectedIds.has(segment.id));

  return selectedSegments.reduce<MaterialSummary>(
    (summary, segment) => {
      summary.selectedCount += 1;
      summary.totalLength = roundMetric(summary.totalLength + segment.length);
      summary.totalVisibleArea = roundMetric(summary.totalVisibleArea + segment.visibleArea);
      summary.totalCutArea = roundMetric(summary.totalCutArea + segment.cutArea);

      if (segment.kind === 'perimeter') {
        summary.perimeterCount += 1;
      } else {
        summary.interiorCount += 1;
      }

      return summary;
    },
    {
      selectedCount: 0,
      interiorCount: 0,
      perimeterCount: 0,
      totalLength: 0,
      totalVisibleArea: 0,
      totalCutArea: 0,
    },
  );
}

export function buildExportRows(geometry: GridGeometry, selectedIds: Set<string>): ExportRow[] {
  return geometry.segments
    .filter((segment) => selectedIds.has(segment.id))
    .map((segment) => ({
      id: segment.id,
      kind: segment.kind,
      axis: segment.axis,
      gridIndexA: segment.gridIndexA,
      gridIndexB: segment.gridIndexB,
      startX: segment.from.x,
      startY: segment.from.y,
      endX: segment.to.x,
      endY: segment.to.y,
      length: segment.length,
      visibleHeight: segment.visibleHeight,
      cutWidth: segment.cutWidth,
      cutHeight: segment.cutHeight,
      visibleArea: segment.visibleArea,
      cutArea: segment.cutArea,
    }));
}
