import type { KeyboardEvent } from 'react';
import type { GridGeometry } from '../domain/types';

interface MazeCanvasProps {
  geometry: GridGeometry;
  selectedIds: Set<string>;
  onToggle: (segmentId: string) => void;
}

function handleKeyboardToggle(event: KeyboardEvent<SVGGElement>, onToggle: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onToggle();
  }
}

export function MazeCanvas({ geometry, selectedIds, onToggle }: MazeCanvasProps) {
  const scale = 32;
  const padding = 44;
  const width = geometry.width * scale + padding * 2;
  const height = geometry.height * scale + padding * 2;
  const xLabelStride = geometry.gridStep > 0 ? Math.max(1, Math.ceil(72 / (geometry.gridStep * scale))) : 1;
  const yLabelStride = geometry.gridStep > 0 ? Math.max(1, Math.ceil(56 / (geometry.gridStep * scale))) : 1;
  const toSvgX = (x: number) => padding + x * scale;
  const toSvgY = (y: number) => height - padding - y * scale;

  return (
    <section className="editor-panel">
      <div className="panel-card panel-card--editor">
        <div className="editor-meta">
          <div>
            <span>Maze field</span>
            <strong>
              {geometry.width}m x {geometry.height}m
            </strong>
          </div>
          <div>
            <span>Segments</span>
            <strong>{geometry.segments.length}</strong>
          </div>
        </div>

        <svg
          className="maze-canvas"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Maze editor"
        >
          <rect x="0" y="0" width={width} height={height} rx="18" className="maze-canvas__frame" />

          {geometry.yPositions.map((y, index) => (
            <line
              key={`horizontal-${index}`}
              x1={toSvgX(0)}
              y1={toSvgY(y)}
              x2={toSvgX(geometry.width)}
              y2={toSvgY(y)}
              className="maze-canvas__guide"
            />
          ))}

          {geometry.xPositions.map((x, index) => (
            <line
              key={`vertical-${index}`}
              x1={toSvgX(x)}
              y1={toSvgY(0)}
              x2={toSvgX(x)}
              y2={toSvgY(geometry.height)}
              className="maze-canvas__guide"
            />
          ))}

          {geometry.majorYPositions.map((y, index) => (
            <line
              key={`major-horizontal-${index}`}
              x1={toSvgX(0)}
              y1={toSvgY(y)}
              x2={toSvgX(geometry.width)}
              y2={toSvgY(y)}
              className="maze-canvas__guide maze-canvas__guide--major"
            />
          ))}

          {geometry.majorXPositions.map((x, index) => (
            <line
              key={`major-vertical-${index}`}
              x1={toSvgX(x)}
              y1={toSvgY(0)}
              x2={toSvgX(x)}
              y2={toSvgY(geometry.height)}
              className="maze-canvas__guide maze-canvas__guide--major"
            />
          ))}

          {geometry.segments.map((segment) => {
            const selected = selectedIds.has(segment.id);

            return (
              <g
                key={segment.id}
                role="button"
                tabIndex={0}
                aria-label={`segment ${segment.id}`}
                className={`maze-segment ${selected ? 'maze-segment--selected' : ''} maze-segment--${segment.kind}`}
                onClick={() => onToggle(segment.id)}
                onKeyDown={(event) => handleKeyboardToggle(event, () => onToggle(segment.id))}
              >
                <line
                  x1={toSvgX(segment.from.x)}
                  y1={toSvgY(segment.from.y)}
                  x2={toSvgX(segment.to.x)}
                  y2={toSvgY(segment.to.y)}
                  className="maze-segment__stroke"
                />
              </g>
            );
          })}

          {geometry.yPositions.map((y, index) =>
            index === 0 || index === geometry.yPositions.length - 1 || index % yLabelStride === 0 ? (
              <text
                key={`label-y-${index}`}
                x={14}
                y={toSvgY(y) + 4}
                className="maze-canvas__label"
              >
                Y{index}: {y}m
              </text>
            ) : null,
          )}

          {geometry.xPositions.map((x, index) =>
            index === 0 || index === geometry.xPositions.length - 1 || index % xLabelStride === 0 ? (
              <text
                key={`label-x-${index}`}
                x={toSvgX(x)}
                y={height - 12}
                textAnchor="end"
                transform={`rotate(-35 ${toSvgX(x)} ${height - 12})`}
                className="maze-canvas__label"
              >
                X{index}: {x}m
              </text>
            ) : null,
          )}
        </svg>
      </div>
    </section>
  );
}
