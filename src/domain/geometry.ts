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

function createSegment(params: ProjectParams, axis: 'x' | 'y', kind: WallKind, gridIndexA: number, gridIndexB: number, from: Point, to: Point): WallSegment {
  const length = axis === 'x' ? Math.abs(to.x - from.x) : Math.abs(to.y - from.y);
  const visibleHeight = kind === 'perimeter' ? params.perimeterFabricHeight : params.innerFabricHeight;
  const cutWidth = roundMetric(length + params.bendAllowancePerEdge * 2);
  const cutHeight = roundMetric(visibleHeight + params.bendAllowancePerEdge * 2);
  const visibleArea = roundMetric(length * visibleHeight);
  const cutArea = roundMetric(cutWidth * cutHeight);

  return {
    id: `${axis}-${gridIndexA}-${gridIndexB}`,
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
  const transverseStep = params.P > 0 ? roundMetric(width / (params.P + 1)) : 0;

  const transverseLines = Array.from({ length: params.P }, (_, index) => ({
    id: `transverse-${index}`,
    x: roundMetric(transverseStep * (index + 1)),
  }));

  const longitudinalLines = Array.from({ length: params.N }, (_, index) => ({
    id: `longitudinal-${index}`,
    y: roundMetric(index * params.D),
  }));

  const xPositions = [0, ...transverseLines.map((line) => line.x), width];
  const yPositions = longitudinalLines.map((line) => line.y);
  const segments = [
    ...buildHorizontalSegments(params, xPositions, yPositions, height),
    ...buildVerticalSegments(params, xPositions, yPositions, width),
  ];

  return {
    width,
    height,
    transverseStep,
    transverseLines,
    longitudinalLines,
    xPositions,
    yPositions,
    segments,
  };
}
