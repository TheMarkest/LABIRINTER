# LABIRINTER Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working LABIRINTER GitHub Pages prototype with parameterized maze geometry, SVG wall editing, fabric calculations, and PDF/CSV export.

**Architecture:** A renderer-agnostic domain layer computes geometry, segment metadata, calculations, and export rows from project parameters. React renders a styled SVG planning console around that domain model, while export helpers reuse the same scene data for CSV and PDF output. Styling follows a retro production-tool aesthetic inspired by classic GDevelop and `Black Mirror: Bandersnatch`.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, jsPDF

---

## File Structure

- `package.json`
  - project scripts and dependencies
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
  - TypeScript configuration
- `vite.config.ts`
  - Vite config with GitHub Pages base path and Vitest setup
- `index.html`
  - app shell
- `src/main.tsx`
  - React entrypoint
- `src/App.tsx`
  - app composition and state orchestration
- `src/styles.css`
  - global visual system and responsive layout
- `src/domain/params.ts`
  - defaults, validation, numeric helpers
- `src/domain/geometry.ts`
  - scene generation and segment coordinate model
- `src/domain/calculations.ts`
  - summary metrics and export row mapping
- `src/domain/exports.ts`
  - CSV and PDF generation helpers
- `src/domain/types.ts`
  - shared domain types
- `src/domain/*.test.ts`
  - deterministic unit tests
- `src/components/ParameterPanel.tsx`
  - form and quick actions
- `src/components/MazeCanvas.tsx`
  - SVG rendering and wall toggling
- `src/components/SummaryPanel.tsx`
  - totals and export actions
- `src/components/AppHeader.tsx`
  - branded presentation header
- `src/test/setup.ts`
  - test environment setup

### Task 1: Scaffold the app shell and test harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Write the failing smoke test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('shows the LABIRINTER header', () => {
    render(<App />);
    expect(screen.getByText(/LABIRINTER/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/App.test.tsx`
Expected: FAIL because `src/App.tsx` or the test toolchain does not exist yet.

- [ ] **Step 3: Write minimal implementation and toolchain**

```json
{
  "name": "labirinter",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

```tsx
export default function App() {
  return <h1>LABIRINTER</h1>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/App.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html src/main.tsx src/App.tsx src/styles.css src/test/setup.ts src/App.test.tsx
git commit -m "feat: scaffold LABIRINTER frontend shell"
```

### Task 2: Build and test the geometry core

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/params.ts`
- Create: `src/domain/geometry.ts`
- Create: `src/domain/geometry.test.ts`

- [ ] **Step 1: Write the failing geometry tests**

```ts
import { describe, expect, it } from 'vitest';
import { createGeometry } from './geometry';
import { defaultParams } from './params';

describe('createGeometry', () => {
  it('creates a 4x4 default site with 15m width and height', () => {
    const geometry = createGeometry(defaultParams);
    expect(geometry.width).toBe(15);
    expect(geometry.height).toBe(15);
  });

  it('creates evenly spaced internal transverse lines', () => {
    const geometry = createGeometry({ ...defaultParams, K: 4, D: 5, P: 2 });
    expect(geometry.transverseLines.map((line) => line.x)).toEqual([5, 10]);
  });

  it('marks perimeter segments separately from interior segments', () => {
    const geometry = createGeometry(defaultParams);
    expect(geometry.segments.some((segment) => segment.kind === 'perimeter')).toBe(true);
    expect(geometry.segments.some((segment) => segment.kind === 'interior')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/domain/geometry.test.ts`
Expected: FAIL because the domain files and `createGeometry` do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export type WallKind = 'interior' | 'perimeter';

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
```

```ts
export const defaultParams = {
  N: 4,
  K: 4,
  D: 5,
  H: 2.5,
  P: 2,
  innerFabricHeight: 2.1,
  perimeterFabricHeight: 2.3,
  bendAllowancePerEdge: 0.1,
} satisfies ProjectParams;
```

```ts
export function createGeometry(params: ProjectParams) {
  const width = (params.K - 1) * params.D;
  const height = (params.N - 1) * params.D;
  const transverseStep = width / (params.P + 1);
  const transverseLines = Array.from({ length: params.P }, (_, index) => ({
    id: `t-${index}`,
    x: Number(((index + 1) * transverseStep).toFixed(4)),
  }));

  return {
    width,
    height,
    transverseLines,
    segments: buildSegments(params, width, height, transverseLines),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/domain/geometry.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/domain/types.ts src/domain/params.ts src/domain/geometry.ts src/domain/geometry.test.ts
git commit -m "feat: add LABIRINTER geometry core"
```

### Task 3: Add calculations and export row mapping

**Files:**
- Create: `src/domain/calculations.ts`
- Create: `src/domain/calculations.test.ts`

- [ ] **Step 1: Write the failing calculation tests**

```ts
import { describe, expect, it } from 'vitest';
import { buildSelectionSummary, buildExportRows } from './calculations';
import { createGeometry } from './geometry';
import { defaultParams } from './params';

describe('buildSelectionSummary', () => {
  it('calculates visible and cut area from selected segments', () => {
    const geometry = createGeometry(defaultParams);
    const selectedIds = new Set(geometry.segments.slice(0, 2).map((segment) => segment.id));
    const summary = buildSelectionSummary(defaultParams, geometry, selectedIds);
    expect(summary.totalLength).toBeGreaterThan(0);
    expect(summary.totalVisibleArea).toBeGreaterThan(0);
    expect(summary.totalCutArea).toBeGreaterThan(summary.totalVisibleArea);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/domain/calculations.test.ts`
Expected: FAIL because calculation helpers do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export function buildSelectionSummary(params: ProjectParams, geometry: GridGeometry, selectedIds: Set<string>) {
  const selectedSegments = geometry.segments.filter((segment) => selectedIds.has(segment.id));

  return selectedSegments.reduce(
    (summary, segment) => {
      summary.totalLength += segment.length;
      summary.totalVisibleArea += segment.visibleArea;
      summary.totalCutArea += segment.cutArea;
      summary[segment.kind === 'perimeter' ? 'perimeterCount' : 'interiorCount'] += 1;
      return summary;
    },
    { interiorCount: 0, perimeterCount: 0, totalLength: 0, totalVisibleArea: 0, totalCutArea: 0 },
  );
}
```

```ts
export function buildExportRows(geometry: GridGeometry, selectedIds: Set<string>) {
  return geometry.segments.filter((segment) => selectedIds.has(segment.id));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/domain/calculations.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/domain/calculations.ts src/domain/calculations.test.ts
git commit -m "feat: add material calculations"
```

### Task 4: Build the interactive editor UI

**Files:**
- Create: `src/components/AppHeader.tsx`
- Create: `src/components/ParameterPanel.tsx`
- Create: `src/components/MazeCanvas.tsx`
- Create: `src/components/SummaryPanel.tsx`
- Modify: `src/App.tsx`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write the failing UI interaction tests**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('LABIRINTER UI', () => {
  it('recomputes totals when a wall segment is toggled', () => {
    render(<App />);
    const segment = screen.getAllByRole('button', { name: /segment/i })[0];
    fireEvent.click(segment);
    expect(screen.getByText(/Selected walls/i)).toHaveTextContent('1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/App.test.tsx`
Expected: FAIL because the interactive UI and accessible SVG controls are not implemented yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

function toggleSegment(segmentId: string) {
  setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(segmentId)) next.delete(segmentId);
    else next.add(segmentId);
    return next;
  });
}
```

```tsx
<button type="button" aria-label={`segment ${segment.id}`} onClick={() => onToggle(segment.id)}>
  <line ... />
</button>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/App.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/AppHeader.tsx src/components/ParameterPanel.tsx src/components/MazeCanvas.tsx src/components/SummaryPanel.tsx src/App.tsx src/App.test.tsx
git commit -m "feat: add interactive maze editor"
```

### Task 5: Add CSV and PDF export

**Files:**
- Create: `src/domain/exports.ts`
- Create: `src/domain/exports.test.ts`
- Modify: `src/components/SummaryPanel.tsx`

- [ ] **Step 1: Write the failing export tests**

```ts
import { describe, expect, it } from 'vitest';
import { buildCsvContent } from './exports';

describe('buildCsvContent', () => {
  it('includes coordinate and area columns', () => {
    const csv = buildCsvContent([
      {
        id: 'seg-1',
        kind: 'interior',
        axis: 'x',
        length: 5,
        visibleHeight: 2.1,
        cutWidth: 5.2,
        cutHeight: 2.3,
        visibleArea: 10.5,
        cutArea: 11.96,
      },
    ]);

    expect(csv).toContain('id,kind,axis');
    expect(csv).toContain('seg-1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/domain/exports.test.ts`
Expected: FAIL because export helpers do not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export function buildCsvContent(rows: ExportRow[]) {
  const header = ['id', 'kind', 'axis', 'length', 'visibleHeight', 'cutWidth', 'cutHeight', 'visibleArea', 'cutArea'];
  const body = rows.map((row) => header.map((key) => String(row[key as keyof ExportRow] ?? '')).join(','));
  return [header.join(','), ...body].join('\n');
}
```

```ts
export function exportPdf(scene: ExportScene) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  drawPlanPage(doc, scene);
  doc.addPage();
  drawSpecificationPage(doc, scene);
  doc.save('labirinter-scheme.pdf');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/domain/exports.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/domain/exports.ts src/domain/exports.test.ts src/components/SummaryPanel.tsx
git commit -m "feat: add PDF and CSV exports"
```

### Task 6: Apply the visual system and verify GitHub Pages build

**Files:**
- Modify: `src/styles.css`
- Modify: `src/components/AppHeader.tsx`
- Modify: `src/components/ParameterPanel.tsx`
- Modify: `src/components/MazeCanvas.tsx`
- Modify: `src/components/SummaryPanel.tsx`
- Modify: `vite.config.ts`

- [ ] **Step 1: Write the failing presentation test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('visual shell', () => {
  it('shows the planning console subtitle', () => {
    render(<App />);
    expect(screen.getByText(/fabric maze planning console/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/App.test.tsx`
Expected: FAIL because the branded visual shell copy is not rendered yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
<p className="app-header__eyebrow">Fabric Maze Planning Console</p>
```

```ts
export default defineConfig({
  base: '/LABIRINTER/',
});
```

```css
:root {
  --bg: #11100d;
  --panel: #1f1a14;
  --panel-alt: #2b2318;
  --ink: #f2dfb8;
  --accent: #f0ae43;
}
```

- [ ] **Step 4: Run test and build to verify success**

Run: `npm run test`
Expected: PASS

Run: `npm run build`
Expected: PASS with generated `dist/` output for GitHub Pages.

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/components/AppHeader.tsx src/components/ParameterPanel.tsx src/components/MazeCanvas.tsx src/components/SummaryPanel.tsx vite.config.ts
git commit -m "feat: style the LABIRINTER planning console"
```
