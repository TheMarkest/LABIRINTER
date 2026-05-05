import { getWallAddress } from './addressing';
import type { GridGeometry, Point, ProjectParams, WallKind, WallSegment } from './types';

function roundMetric(value: number) {
  return Number(value.toFixed(4));
}

function createPoint(x: number, y: number): Point {
  return {
    x: roundMetric(x),
    y: roundMetric(y),
  };
}

function buildAxisPositions(length: number, step: number) {
  if (length <= 0) {
    return [0];
  }

  if (step <= 0) {
    return [0, roundMetric(length)];
  }

  const positions = [0];

  for (let current = step; current < length; current += step) {
    const rounded = roundMetric(current);
    const lastPosition = positions[positions.length - 1];

    if (rounded > lastPosition) {
      positions.push(rounded);
    }
  }

  const roundedLength = roundMetric(length);

  if (positions[positions.length - 1] !== roundedLength) {
    positions.push(roundedLength);
  }

  return positions;
}

function createSegment(params: ProjectParams, axis: 'x' | 'y', kind: WallKind, gridIndexA: number, gridIndexB: number, from: Point, to: Point): WallSegment {
  const length = axis === 'x' ? Math.abs(to.x - from.x) : Math.abs(to.y - from.y);
  const visibleHeight = kind === 'perimeter' ? params.perimeterFabricHeight : params.innerFabricHeight;
  const cutWidth = roundMetric(length + params.bendAllowancePerEdge * 2);
  const cutHeight = roundMetric(visibleHeight + params.bendAllowancePerEdge * 2);
  const visibleArea = roundMetric(length * visibleHeight);
  const cutArea = roundMetric(cutWidth * cutHeight);
  const id = `${axis}-${gridIndexA}-${gridIndexB}`;
  const address = getWallAddress({
    id,
    axis,
    kind,
    gridIndexA,
    gridIndexB,
    from,
    to,
    length: roundMetric(length),
    visibleHeight: roundMetric(visibleHeight),
    cutWidth,
    cutHeight,
    visibleArea,
    cutArea,
  } as WallSegment);

  return {
    id,
    code: address.code,
    cell: address.cell,
    side: address.side,
    kind,
    axis,
    gridIndexA,
    gridIndexB,
    from,
    to,
    length: roundMetric(length),
    visibleHeight: roundMetric(visibleHeight),
    cutWidth,
    cutHeight,
    visibleArea,
    cutArea,
  };
}

function buildHorizontalSegments(params: ProjectParams, xPositions: number[], yPositions: number[], height: number) {
  const segments: WallSegment[] = [];

  yPositions.forEach((y, lineIndex) => {
    for (let spanIndex = 0; spanIndex < xPositions.length - 1; spanIndex += 1) {
      const startX = xPositions[spanIndex];
      const endX = xPositions[spanIndex + 1];
      const kind: WallKind = y === 0 || y === height ? 'perimeter' : 'interior';

      segments.push(
        createSegment(
          params,
          'x',
          kind,
          lineIndex,
          spanIndex,
          createPoint(startX, y),
          createPoint(endX, y),
        ),
      );
    }
  });

  return segments;
}

function buildVerticalSegments(params: ProjectParams, xPositions: number[], yPositions: number[], width: number) {
  const segments: WallSegment[] = [];

  xPositions.forEach((x, lineIndex) => {
    for (let spanIndex = 0; spanIndex < yPositions.length - 1; spanIndex += 1) {
      const startY = yPositions[spanIndex];
      const endY = yPositions[spanIndex + 1];
      const kind: WallKind = x === 0 || x === width ? 'perimeter' : 'interior';

      segments.push(
        createSegment(
          params,
          'y',
          kind,
          lineIndex,
          spanIndex,
          createPoint(x, startY),
          createPoint(x, endY),
        ),
      );
    }
  });

  return segments;
}

export function createGeometry(params: ProjectParams): GridGeometry {
  const width = roundMetric((params.K - 1) * params.D);
  const height = roundMetric((params.N - 1) * params.D);
  const gridStep = params.P > 0 ? roundMetric(width / (params.P + 1)) : roundMetric(width);
  const transverseStep = params.P > 0 ? gridStep : 0;
  const majorXPositions = Array.from({ length: params.K }, (_, index) => roundMetric(index * params.D));
  const majorYPositions = Array.from({ length: params.N }, (_, index) => roundMetric(index * params.D));
  const xPositions = buildAxisPositions(width, gridStep);
  const yPositions = buildAxisPositions(height, gridStep);

  const transverseLines = xPositions.slice(1, -1).map((x, index) => ({
    id: `transverse-${index}`,
    x,
  }));

  const longitudinalLines = yPositions.map((y, index) => ({
    id: `longitudinal-${index}`,
    y,
  }));

  const segments = [
    ...buildHorizontalSegments(params, xPositions, yPositions, height),
    ...buildVerticalSegments(params, xPositions, yPositions, width),
  ];

  return {
    width,
    height,
    gridStep,
    transverseStep,
    transverseLines,
    longitudinalLines,
    majorXPositions,
    majorYPositions,
    xPositions,
    yPositions,
    segments,
  };
}
