import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('shows the LABIRINTER header', () => {
    render(<App />);
    expect(screen.getByText(/LABIRINTER/i)).toBeInTheDocument();
  });
});
