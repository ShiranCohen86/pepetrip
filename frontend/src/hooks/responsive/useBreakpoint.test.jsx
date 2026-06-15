import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useBreakpoint } from './useBreakpoint.js';

function Probe() {
  const bp = useBreakpoint();
  const bands = [bp.isMobile, bp.isTablet, bp.isDesktop, bp.isLargeDesktop];
  return (
    <div>
      <span data-testid="type">{bp.type}</span>
      <span data-testid="active-bands">{bands.filter(Boolean).length}</span>
      <span data-testid="up-lg">{String(bp.atLeast('lg'))}</span>
    </div>
  );
}

describe('useBreakpoint', () => {
  it('exposes a single active band and a working atLeast()', () => {
    render(<Probe />);
    // Exactly one device band is ever true at a time.
    expect(screen.getByTestId('active-bands').textContent).toBe('1');
    // jsdom has no matchMedia → store uses its SSR fallback (desktop @ 1024).
    expect(screen.getByTestId('type').textContent).toBe('desktop');
    expect(screen.getByTestId('up-lg').textContent).toBe('true');
  });
});
