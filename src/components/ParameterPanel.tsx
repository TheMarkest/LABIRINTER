import type { ProjectParams } from '../domain/types';

interface ParameterPanelProps {
  params: ProjectParams;
  onChange: (key: keyof ProjectParams, value: number) => void;
  onSelectPerimeter: () => void;
  onClearPerimeter: () => void;
  onSelectInterior: () => void;
  onClearAll: () => void;
}

const parameterFields: Array<{
  key: keyof ProjectParams;
  label: string;
  step: number;
  min: number;
}> = [
  { key: 'N', label: 'Rows N', step: 1, min: 2 },
  { key: 'K', label: 'Columns K', step: 1, min: 2 },
  { key: 'D', label: 'Pole spacing D (m)', step: 0.1, min: 0.1 },
  { key: 'H', label: 'Pole height H (m)', step: 0.1, min: 0.1 },
  { key: 'P', label: 'Inner transverse lines P', step: 1, min: 0 },
  { key: 'innerFabricHeight', label: 'Inner fabric height (m)', step: 0.1, min: 0 },
  { key: 'perimeterFabricHeight', label: 'Perimeter height (m)', step: 0.1, min: 0 },
  { key: 'bendAllowancePerEdge', label: 'Bend per edge (m)', step: 0.01, min: 0 },
];

export function ParameterPanel({
  params,
  onChange,
  onSelectPerimeter,
  onClearPerimeter,
  onSelectInterior,
  onClearAll,
}: ParameterPanelProps) {
  return (
    <aside className="control-panel">
      <div className="panel-card">
        <h2>Structure</h2>
        <div className="field-grid">
          {parameterFields.map((field) => (
            <label key={field.key} className="field">
              <span>{field.label}</span>
              <input
                type="number"
                min={field.min}
                step={field.step}
                value={params[field.key]}
                onChange={(event) => onChange(field.key, Number(event.target.value))}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="panel-card">
        <h2>Selection Tools</h2>
        <div className="action-grid">
          <button type="button" onClick={onSelectPerimeter}>
            Select perimeter
          </button>
          <button type="button" onClick={onClearPerimeter}>
            Clear perimeter
          </button>
          <button type="button" onClick={onSelectInterior}>
            Select interior
          </button>
          <button type="button" onClick={onClearAll}>
            Clear all
          </button>
        </div>
      </div>
    </aside>
  );
}
