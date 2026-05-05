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

          {geometry.longitudinalLines.map((line) => (
            <line
              key={line.id}
              x1={toSvgX(0)}
              y1={toSvgY(line.y)}
              x2={toSvgX(geometry.width)}
              y2={toSvgY(line.y)}
              className="maze-canvas__guide maze-canvas__guide--major"
            />
          ))}

          {geometry.xPositions.map((x, index) => (
            <line
              key={`vertical-${index}`}
              x1={toSvgX(x)}
              y1={toSvgY(0)}
              x2={toSvgX(x)}
              y2={toSvgY(geometry.height)}
              className={index === 0 || index === geometry.xPositions.length - 1 ? 'maze-canvas__guide maze-canvas__guide--major' : 'maze-canvas__guide'}
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

          {geometry.longitudinalLines.map((line, index) => (
            <text
              key={`label-y-${line.id}`}
              x={12}
              y={toSvgY(line.y) + 4}
              className="maze-canvas__label"
            >
              Y{index}: {line.y}m
            </text>
          ))}

          {geometry.xPositions.map((x, index) => (
            <text
              key={`label-x-${index}`}
              x={toSvgX(x)}
              y={height - 12}
              textAnchor="middle"
              className="maze-canvas__label"
            >
              X{index}: {x}m
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
