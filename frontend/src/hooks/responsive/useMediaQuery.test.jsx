import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery.js';

// jsdom has no matchMedia; install a controllable mock.
function installMatchMedia(initialMatches = false) {
  const listeners = new Set();
  const mql = {
    matches: initialMatches,
    media: '',
    addEventListener: (_, cb) => listeners.add(cb),
    removeEventListener: (_, cb) => listeners.delete(cb),
    dispatch(next) {
      mql.matches = next;
      listeners.forEach((cb) => cb({ matches: next }));
    },
  };
  window.matchMedia = vi.fn(() => mql);
  return mql;
}

function Probe({ query }) {
  const matches = useMediaQuery(query);
  return <span>{matches ? 'yes' : 'no'}</span>;
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('reflects the initial match state', () => {
    installMatchMedia(true);
    render(<Probe query="(min-width: 1024px)" />);
    expect(screen.getByText('yes')).toBeTruthy();
  });

  it('updates when the query result changes', () => {
    const mql = installMatchMedia(false);
    render(<Probe query="(min-width: 1024px)" />);
    expect(screen.getByText('no')).toBeTruthy();

    act(() => mql.dispatch(true));
    expect(screen.getByText('yes')).toBeTruthy();
  });
});
