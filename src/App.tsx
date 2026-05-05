import { useEffect, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { MazeCanvas } from './components/MazeCanvas';
import { ParameterPanel } from './components/ParameterPanel';
import { SummaryPanel } from './components/SummaryPanel';
import { UsageDialog } from './components/UsageDialog';
import { appUsageSections } from './content/instructions';
import { buildExportRows, buildSelectionSummary } from './domain/calculations';
import { createGeometry } from './domain/geometry';
import { defaultParams } from './domain/params';
import type { ImportedSchemeDocument, ProjectParams, WallKind } from './domain/types';

const integerParamKeys = new Set<keyof ProjectParams>(['N', 'K', 'P']);

function coerceParamValue(key: keyof ProjectParams, rawValue: number) {
  if (integerParamKeys.has(key)) {
    return Math.max(0, Math.round(rawValue));
  }

  return Number(rawValue.toFixed(4));
}

export default function App() {
  const [params, setParams] = useState<ProjectParams>(defaultParams);
  const [schemeTitle, setSchemeTitle] = useState('Main montage scheme');
  const [importNotice, setImportNotice] = useState<string | null>(null);
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const geometry = createGeometry(params);
  const summary = buildSelectionSummary(geometry, selectedIds);
  const exportRows = buildExportRows(geometry, selectedIds);

  useEffect(() => {
    const validIds = new Set(geometry.segments.map((segment) => segment.id));

    setSelectedIds((current) => {
      const next = new Set([...current].filter((segmentId) => validIds.has(segmentId)));
      return next.size === current.size ? current : next;
    });
  }, [geometry.segments]);

  function applyImportedScheme(scheme: ImportedSchemeDocument) {
    const nextGeometry = createGeometry(scheme.params);
    const validIds = new Set(nextGeometry.segments.map((segment) => segment.id));
    const nextSelectedIds = scheme.selectedIds.filter((segmentId) => validIds.has(segmentId));

    setParams(scheme.params);
    setSchemeTitle(scheme.schemeTitle);
    setSelectedIds(new Set(nextSelectedIds));
    setImportNotice(`Imported "${scheme.schemeTitle}" from CSV.`);
  }

  function handleParamChange(key: keyof ProjectParams, rawValue: number) {
    if (!Number.isFinite(rawValue)) {
      return;
    }

    setParams((current) => ({
      ...current,
      [key]: coerceParamValue(key, rawValue),
    }));
  }

  function toggleSegment(segmentId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(segmentId)) {
        next.delete(segmentId);
      } else {
        next.add(segmentId);
      }

      return next;
    });
  }

  function setSelectionByKind(kind: WallKind) {
    setSelectedIds((current) => {
      const next = new Set(current);

      geometry.segments.forEach((segment) => {
        if (segment.kind === kind) {
          next.add(segment.id);
        }
      });

      return next;
    });
  }

  function clearSelectionByKind(kind: WallKind) {
    setSelectedIds((current) => {
      const next = new Set(current);

      geometry.segments.forEach((segment) => {
        if (segment.kind === kind) {
          next.delete(segment.id);
        }
      });

      return next;
    });
  }

  function clearAll() {
    setSelectedIds(new Set());
  }

  async function handleExportCsv() {
    const { downloadCsvFile } = await import('./domain/exports');
    downloadCsvFile({
      schemeTitle,
      params,
      rows: exportRows,
    });
  }

  async function handleExportPdf() {
    const { exportPdf } = await import('./domain/exports');
    exportPdf({
      schemeTitle,
      params,
      geometry,
      summary,
      rows: exportRows,
    });
  }

  async function handleImportCsv(file: File) {
    try {
      const { parseCsvContent } = await import('./domain/exports');
      const content = await file.text();
      const importedScheme = parseCsvContent(content);

      applyImportedScheme(importedScheme);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not import CSV scheme.';
      setImportNotice(message);
    }
  }

  return (
    <div className="app-shell">
      <AppHeader schemeTitle={schemeTitle} onOpenInstructions={() => setIsUsageDialogOpen(true)} />
      {isUsageDialogOpen ? (
        <UsageDialog sections={appUsageSections} onClose={() => setIsUsageDialogOpen(false)} />
      ) : null}
      <div className="app-layout">
        <ParameterPanel
          params={params}
          schemeTitle={schemeTitle}
          importNotice={importNotice}
          onChange={handleParamChange}
          onSchemeTitleChange={(value) => {
            setSchemeTitle(value);
            setImportNotice(null);
          }}
          onImportCsv={handleImportCsv}
          onSelectPerimeter={() => setSelectionByKind('perimeter')}
          onClearPerimeter={() => clearSelectionByKind('perimeter')}
          onSelectInterior={() => setSelectionByKind('interior')}
          onClearAll={clearAll}
        />
        <MazeCanvas geometry={geometry} selectedIds={selectedIds} onToggle={toggleSegment} />
        <SummaryPanel
          summary={summary}
          hasSelection={summary.selectedCount > 0}
          onExportCsv={handleExportCsv}
          onExportPdf={handleExportPdf}
        />
      </div>
    </div>
  );
}
