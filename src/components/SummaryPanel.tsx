import type { MaterialSummary } from '../domain/types';

interface SummaryPanelProps {
  summary: MaterialSummary;
  hasSelection: boolean;
  onExportCsv: () => void;
  onExportPdf: () => void;
}

function formatMetric(value: number, suffix: string) {
  return `${value.toFixed(2)} ${suffix}`;
}

export function SummaryPanel({ summary, hasSelection, onExportCsv, onExportPdf }: SummaryPanelProps) {
  return (
    <aside className="summary-panel">
      <div className="panel-card">
        <h2>Material Summary</h2>
        <div className="summary-stack">
          <div className="summary-row">Selected walls: {summary.selectedCount}</div>
          <div className="summary-row">Interior walls: {summary.interiorCount}</div>
          <div className="summary-row">Perimeter walls: {summary.perimeterCount}</div>
          <div className="summary-row">Total wall length: {formatMetric(summary.totalLength, 'm')}</div>
          <div className="summary-row">Visible fabric area: {formatMetric(summary.totalVisibleArea, 'm2')}</div>
          <div className="summary-row">Cut fabric area: {formatMetric(summary.totalCutArea, 'm2')}</div>
        </div>

        <div className="action-grid action-grid--exports">
          <button type="button" onClick={onExportCsv} disabled={!hasSelection}>
            Export CSV
          </button>
          <button type="button" onClick={onExportPdf} disabled={!hasSelection}>
            Export PDF
          </button>
        </div>
      </div>
    </aside>
  );
}
