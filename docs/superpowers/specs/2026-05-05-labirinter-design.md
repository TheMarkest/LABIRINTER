# LABIRINTER First Prototype Design

## Summary

This document defines the first full prototype for `LABIRINTER`, a static GitHub Pages application for planning a fabric maze on a rectangular grid of wooden poles and ropes.

The prototype must allow the user to:

- enter geometric and material parameters for the maze structure
- interactively place wall segments on a 2D plan
- calculate required fabric quantities
- export a PDF scheme with specification
- export a wall list as a table

The first version is designed around an SVG editor backed by a renderer-agnostic geometry core so the project can later gain a `Three.js` 3D view without rewriting the domain model.

## Goals

- Run as a fully static frontend deployable on GitHub Pages
- Model a rectangular maze framework defined by `N`, `K`, `D`, `H`, and `P`
- Support separate fabric heights for interior walls and perimeter walls
- Support a single bend allowance value applied per fabric edge for fastening
- Let the user toggle individual wall segments on a grid
- Generate deterministic calculations and exports from a single shared scene model
- Present a visual style inspired by classic GDevelop tools and `Black Mirror: Bandersnatch`

## Non-Goals For Version 1

- No 3D renderer yet
- No irregular site geometry
- No per-wall custom fabric type
- No door or gate semantics
- No multi-user or server-backed persistence
- No production nesting or cutting optimization

## Domain Interpretation

### Structure

- `N * K` poles are placed on a rectangular grid
- adjacent poles are spaced by `D` meters in both grid directions
- total site dimensions are:
  - width: `(K - 1) * D`
  - height: `(N - 1) * D`
- `N` longitudinal thick ropes run across the width
- `P` internal transverse thin ropes are placed inside the width span
- `P` is interpreted as the number of internal transverse lines, excluding the outer perimeter

### Wall Model

The smallest editable unit is a segment.

- interior wall segment: a segment between two adjacent structural lines inside the maze
- perimeter wall segment: a segment on the outer boundary

Perimeter segments are editable and may use a different fabric height than interior segments.

## User Inputs

### Structural Parameters

- `N`: number of longitudinal rope rows / pole rows
- `K`: number of pole columns
- `D`: spacing between poles in meters
- `H`: pole height
- `P`: number of internal transverse lines

### Fabric Parameters

- `innerFabricHeight`: useful height of interior wall fabric
- `perimeterFabricHeight`: useful height of perimeter wall fabric
- `bendAllowancePerEdge`: one fastening bend allowance value in meters

### Derived Spacing

Internal transverse line spacing is:

`transverseStep = ((K - 1) * D) / (P + 1)`

This places `P` lines evenly inside the width, leaving the two outer boundaries separate.

## Geometry Model

The system centers on a renderer-independent scene model.

### Core Entities

- `ProjectParams`
  - stores all user-entered parameters
- `GridGeometry`
  - stores world-space coordinates for poles, rope lines, outer perimeter, and all legal wall segments
- `WallSegment`
  - immutable description of a single editable segment
- `WallSelection`
  - set of selected segment ids
- `MaterialSummary`
  - totals for lengths, visible areas, cut areas, and counts
- `ExportRow`
  - flattened table row for CSV and PDF specification

### WallSegment Shape

Each segment contains:

- `id`
- `kind`: `interior` or `perimeter`
- `axis`: `x` or `y`
- `gridIndexA`
- `gridIndexB`
- `from`
- `to`
- `length`
- `visibleHeight`
- `cutWidth`
- `cutHeight`
- `visibleArea`
- `cutArea`

### Coordinate System

- origin is the south-west project corner at `(0, 0)`
- `x` grows to the east / right
- `y` grows to the north / up in domain coordinates
- coordinates are stored in meters
- exports include both grid indices and metric coordinates

The SVG renderer may invert the vertical axis for display, but all calculations and exports must use the south-west origin convention.

## Calculation Rules

### Geometric Length

Wall length is the metric distance between segment start and end.

### Visible Fabric Area

- interior segment visible area: `length * innerFabricHeight`
- perimeter segment visible area: `length * perimeterFabricHeight`

### Cut Size With Bend Allowance

The bend allowance affects the fabric piece size, not the wall geometry.

- `cutWidth = length + 2 * bendAllowancePerEdge`
- `cutHeight = segmentVisibleHeight + 2 * bendAllowancePerEdge`
- `cutArea = cutWidth * cutHeight`

This assumes one allowance per edge on all four sides in version 1.

### Summary Totals

The app must show:

- selected interior segment count
- selected perimeter segment count
- total wall length
- total visible fabric area
- total cut fabric area including bend allowance

## Interaction Design

### Layout

- left panel: parameters, summary, export actions
- main panel: SVG plan editor

### Editing Behavior

- click a segment to toggle it on or off
- selected and unselected states must be visually obvious
- interior and perimeter segments must be distinguishable

### Helper Actions

Version 1 should include:

- clear all
- select perimeter
- clear perimeter
- select interior

Optional if implementation cost stays low:

- drag or paint selection along a line

## Visual Direction

The first prototype should avoid generic dashboard styling.

- palette: muted amber, brass, soot, parchment, and oxidized gold accents
- mood: editorial, analog control room, retro-futurist production interface
- typography: strong display heading paired with readable condensed or humanist UI text
- surfaces: layered panels, grain, subtle gradients, framed editor region
- signals: selected segments should feel illuminated and intentional rather than default blue
- overall feel: part level editor, part production planning console

The result should feel closer to an old creative tool or experimental film interface than a standard admin panel.

## Rendering Approach

### SVG First

The first renderer is SVG.

Reasons:

- precise hit-testing
- easy labeling of coordinates and segment states
- good compatibility with PDF export pipelines
- fast implementation for GitHub Pages

### Future 3D Compatibility

The geometry core must not depend on SVG-specific concepts.

Future `Three.js` support should reuse the same `GridGeometry` and `WallSegment` data to extrude vertical planes or panels in 3D.

## Export Design

### CSV

One row per selected wall segment with:

- `id`
- `kind`
- `axis`
- grid indices
- metric start coordinates
- metric end coordinates
- length
- visible height
- cut width
- cut height
- visible area
- cut area

### PDF

Version 1 PDF contains:

- page 1: project parameters, totals, and maze plan
- page 2: wall specification table

The PDF scheme should visually match the editor by rendering from the same scene data used by the SVG plan.

## Validation Rules

The app must reject or guard against:

- `N < 2`
- `K < 2`
- `D <= 0`
- `H <= 0`
- `P < 0`
- negative fabric heights
- negative bend allowance

The UI should show clear inline validation and preserve the last valid scene when possible.

## Technical Architecture

### Stack

- `Vite`
- `React`
- `TypeScript`
- `SVG` for the 2D editor
- `jsPDF` for PDF export

CSV export can be generated directly from the scene model without a heavy spreadsheet dependency.

### Suggested Module Boundaries

- `src/domain/params.ts`
- `src/domain/geometry.ts`
- `src/domain/calculations.ts`
- `src/domain/exports.ts`
- `src/components/parameter-form/*`
- `src/components/maze-editor/*`
- `src/components/summary/*`

The exact filenames can evolve, but the separation between geometry core, calculations, rendering, and exports should remain.

## Testing Strategy

Version 1 should include:

- unit tests for geometry generation
- unit tests for material calculations
- smoke tests for parameter entry, wall toggling, and export triggers

Priority should go to deterministic coverage of the domain calculations, since renderer changes must not alter numeric outputs.

## Delivery Scope For The First Prototype

The first full prototype is complete when it can:

1. accept all agreed parameters
2. render the full editable segment grid in SVG
3. let the user toggle interior and perimeter segments
4. show summary calculations including bend allowance
5. export a PDF scheme with specification
6. export a CSV wall list with coordinates
7. build cleanly for GitHub Pages deployment
