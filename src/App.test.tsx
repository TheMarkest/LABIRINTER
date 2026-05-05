import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('shows the LABIRINTER header', () => {
    render(<App />);
    expect(screen.getByText(/LABIRINTER/i)).toBeInTheDocument();
  });

  it('recomputes totals when a wall segment is toggled', () => {
    render(<App />);

    const segment = screen.getAllByRole('button', { name: /segment/i })[0];
    fireEvent.click(segment);

    expect(screen.getByText(/Selected walls/i)).toHaveTextContent('1');
  });

  it('shows the planning console subtitle', () => {
    render(<App />);
    expect(screen.getByText(/fabric maze planning console/i)).toBeInTheDocument();
  });

  it('shows controls for scheme title and csv import', () => {
    render(<App />);

    expect(screen.getByLabelText(/scheme title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import csv/i })).toBeInTheDocument();
  });

  it('adds perimeter selection to existing selected walls', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /segment a1t/i }));
    fireEvent.click(screen.getByRole('button', { name: /select perimeter/i }));

    expect(screen.getByText(/Selected walls/i)).toHaveTextContent('13');
    expect(screen.getByText(/Interior walls/i)).toHaveTextContent('1');
    expect(screen.getByText(/Perimeter walls/i)).toHaveTextContent('12');
  });
});
