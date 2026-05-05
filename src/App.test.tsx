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
});
