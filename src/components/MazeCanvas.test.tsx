import { render, screen } from '@testing-library/react';
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
  it('renders axis labels for every grid position without rotated x labels', () => {
    const geometry = createGeometry(denseParams);

    render(<MazeCanvas geometry={geometry} selectedIds={new Set()} onToggle={() => undefined} />);

    const xLabels = geometry.xPositions.map((x, index) => screen.getByText(`X${index}: ${x}m`));
    const yLabels = geometry.yPositions.map((y, index) => screen.getByText(`Y${index}: ${y}m`));

    expect(xLabels).toHaveLength(geometry.xPositions.length);
    expect(yLabels).toHaveLength(geometry.yPositions.length);

    xLabels.forEach((label) => {
      expect(label).not.toHaveAttribute('transform');
    });
  });
});
