import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createGeometry } from '../domain/geometry';
import type { ProjectParams } from '../domain/types';
import { MazeCanvas } from './MazeCanvas';

const denseParams: ProjectParams = {
  N: 4,
  K: 4,
  D: 5,
  H: 2.5,
  P: 14,
  innerFabricHeight: 2.1,
  perimeterFabricHeight: 2.5,
  bendAllowancePerEdge: 0.1,
};

describe('MazeCanvas', () => {
  it('renders cell address labels with dim metric values and no rotated x labels', () => {
    const geometry = createGeometry(denseParams);
    const { container } = render(<MazeCanvas geometry={geometry} selectedIds={new Set()} onToggle={() => undefined} />);

    const xLabels = Array.from(container.querySelectorAll('.maze-canvas__axis-label--x'));
    const yLabels = Array.from(container.querySelectorAll('.maze-canvas__axis-label--y'));
    const metricLabels = Array.from(container.querySelectorAll('.maze-canvas__axis-metric'));

    expect(xLabels).toHaveLength(geometry.xPositions.length - 1);
    expect(yLabels).toHaveLength(geometry.yPositions.length - 1);
    expect(metricLabels).toHaveLength((geometry.xPositions.length - 1) + (geometry.yPositions.length - 1));
    expect(xLabels[0]).toHaveTextContent('A(0m)');
    expect(xLabels[1]).toHaveTextContent('B(1m)');
    expect(yLabels[0]).toHaveTextContent('1(0m)');
    expect(yLabels[1]).toHaveTextContent('2(1m)');

    xLabels.forEach((label) => {
      expect(label).not.toHaveAttribute('transform');
    });
  });
});
