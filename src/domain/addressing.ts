import type { WallSegment, WallSide } from './types';

export interface AxisBandLabel {
  index: number;
  primary: string;
  metric: string;
  start: number;
  end: number;
  center: number;
}

function trimMetric(value: number) {
  return Number(value.toFixed(2)).toString();
}

export function formatMetricLabel(value: number) {
  return `${trimMetric(value)}m`;
}

export function formatBandMetricLabel(start: number) {
  return `(${formatMetricLabel(start)})`;
}

export function toColumnLabel(index: number) {
  let value = index;
  let label = '';

  do {
    label = String.fromCharCode(65 + (value % 26)) + label;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);

  return label;
}

export function buildColumnBandLabels(xPositions: number[]): AxisBandLabel[] {
  return xPositions.slice(0, -1).map((start, index) => {
    const end = xPositions[index + 1];

    return {
      index,
      primary: toColumnLabel(index),
      metric: formatBandMetricLabel(start),
      start,
      end,
      center: Number(((start + end) / 2).toFixed(4)),
    };
  });
}

export function buildRowBandLabels(yPositions: number[]): AxisBandLabel[] {
  return yPositions.slice(0, -1).map((start, index) => {
    const end = yPositions[index + 1];

    return {
      index,
      primary: String(index + 1),
      metric: formatBandMetricLabel(start),
      start,
      end,
      center: Number(((start + end) / 2).toFixed(4)),
    };
  });
}

function buildCellCode(columnIndex: number, rowIndex: number) {
  return `${toColumnLabel(columnIndex)}${rowIndex + 1}`;
}

export function getWallAddress(segment: WallSegment) {
  let columnIndex = 0;
  let rowIndex = 0;
  let side: WallSide = 'L';

  if (segment.axis === 'x') {
    columnIndex = segment.gridIndexB;
    rowIndex = Math.max(0, segment.gridIndexA - 1);
    side = segment.gridIndexA === 0 ? 'B' : 'T';
  } else {
    columnIndex = Math.max(0, segment.gridIndexA - 1);
    rowIndex = segment.gridIndexB;
    side = segment.gridIndexA === 0 ? 'L' : 'R';
  }

  const cell = buildCellCode(columnIndex, rowIndex);

  return {
    cell,
    side,
    code: `${cell}${side}`,
  };
}
