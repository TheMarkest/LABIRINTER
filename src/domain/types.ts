export type Axis = 'x' | 'y';
export type WallKind = 'interior' | 'perimeter';

export interface Point {
  x: number;
  y: number;
}

export interface ProjectParams {
  N: number;
  K: number;
  D: number;
  H: number;
  P: number;
  innerFabricHeight: number;
  perimeterFabricHeight: number;
  bendAllowancePerEdge: number;
}

export interface LineMarker {
  id: string;
  x?: number;
  y?: number;
}

export interface WallSegment {
  id: string;
  kind: WallKind;
  axis: Axis;
  gridIndexA: number;
  gridIndexB: number;
  from: Point;
  to: Point;
  length: number;
  visibleHeight: number;
  cutWidth: number;
  cutHeight: number;
  visibleArea: number;
  cutArea: number;
}

export interface GridGeometry {
  width: number;
  height: number;
  transverseStep: number;
  transverseLines: Array<LineMarker & { x: number }>;
  longitudinalLines: Array<LineMarker & { y: number }>;
  xPositions: number[];
  yPositions: number[];
  segments: WallSegment[];
}
