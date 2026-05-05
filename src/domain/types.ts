export type Axis = 'x' | 'y';
export type WallKind = 'interior' | 'perimeter';
export type WallSide = 'L' | 'R' | 'T' | 'B';

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
  code: string;
  cell: string;
  side: WallSide;
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
  gridStep: number;
  transverseStep: number;
  transverseLines: Array<LineMarker & { x: number }>;
  longitudinalLines: Array<LineMarker & { y: number }>;
  majorXPositions: number[];
  majorYPositions: number[];
  xPositions: number[];
  yPositions: number[];
  segments: WallSegment[];
}

export interface MaterialSummary {
  selectedCount: number;
  interiorCount: number;
  perimeterCount: number;
  totalLength: number;
  totalVisibleArea: number;
  totalCutArea: number;
}

export interface ExportRow {
  id: string;
  code: string;
  cell: string;
  side: WallSide;
  kind: WallKind;
  axis: Axis;
  gridIndexA: number;
  gridIndexB: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  length: number;
  visibleHeight: number;
  cutWidth: number;
  cutHeight: number;
  visibleArea: number;
  cutArea: number;
}

export interface ExportScene {
  schemeTitle: string;
  params: ProjectParams;
  geometry: GridGeometry;
  summary: MaterialSummary;
  rows: ExportRow[];
}

export interface CsvSchemeDocument {
  schemeTitle: string;
  params: ProjectParams;
  rows: ExportRow[];
}

export interface ImportedSchemeDocument extends CsvSchemeDocument {
  selectedIds: string[];
}
