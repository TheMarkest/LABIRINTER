import type { KeyboardEvent } from 'react';
import type { GridGeometry } from '../domain/types';

interface MazeCanvasProps {
  geometry: GridGeometry;
  selectedIds: Set<string>;
  onToggle: (segmentId: string) => void;
}

function getAxisTextAnchor(index: number, total: number) {
  if (index === 0) {
    return 'start';
  }

  if (index === total - 1) {
    return 'end';
  }

  return 'middle';
}

function handleKeyboardToggle(event: KeyboardEvent<SVGGElement>, onToggle: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onToggle();
  }
}

export function MazeCanvas({ geometry, selectedIds, onToggle }: MazeCanvasProps) {
  const scale = 32;
  const padding = {
    top: 22,
    right: 40,
    bottom: 54,
    left: 58,
  };
  const width = geometry.width * scale + padding.left + padding.right;
  const height = geometry.height * scale + padding.top + padding.bottom;
  const toSvgX = (x: number) => padding.left + x * scale;
  const toSvgY = (y: number) => height - padding.bottom - y * scale;

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

          {geometry.yPositions.map((y, index) => (
            <text
              key={`label-y-${index}`}
              x={padding.left - 10}
              y={toSvgY(y)}
              textAnchor="end"
              dominantBaseline="middle"
              className="maze-canvas__label maze-canvas__label--y"
            >
              Y{index}: {y}m
            </text>
          ))}

          {geometry.xPositions.map((x, index) => (
            <text
              key={`label-x-${index}`}
              x={toSvgX(x)}
              y={height - 18}
              textAnchor={getAxisTextAnchor(index, geometry.xPositions.length)}
              className="maze-canvas__label maze-canvas__label--x"
            >
              X{index}: {x}m
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
