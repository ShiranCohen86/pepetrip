import { describe, it, expect } from 'vitest';
import { BREAKPOINTS, DEVICE_TYPES, getDeviceType, minWidth } from './breakpoints.js';

describe('breakpoints', () => {
  it('classifies device bands at the right boundaries', () => {
    expect(getDeviceType(0)).toBe(DEVICE_TYPES.MOBILE);
    expect(getDeviceType(767)).toBe(DEVICE_TYPES.MOBILE);
    expect(getDeviceType(768)).toBe(DEVICE_TYPES.TABLET);
    expect(getDeviceType(1023)).toBe(DEVICE_TYPES.TABLET);
    expect(getDeviceType(1024)).toBe(DEVICE_TYPES.DESKTOP);
    expect(getDeviceType(1535)).toBe(DEVICE_TYPES.DESKTOP);
    expect(getDeviceType(1536)).toBe(DEVICE_TYPES.LARGE_DESKTOP);
    expect(getDeviceType(3840)).toBe(DEVICE_TYPES.LARGE_DESKTOP);
  });

  it('builds min-width queries from the named scale', () => {
    expect(minWidth('md')).toBe(`(min-width: ${BREAKPOINTS.md}px)`);
    expect(minWidth('lg')).toBe('(min-width: 1024px)');
  });

  it('keeps the scale monotonically increasing', () => {
    const values = Object.values(BREAKPOINTS);
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });
});
