import { describe, it, expect, vi, afterEach } from 'vitest';
import { inferZoneFromState, lookupZoneFromZip } from './zoneUtils';

describe('inferZoneFromState', () => {
  it('returns the correct zone for a known state', () => {
    expect(inferZoneFromState('California')).toBe('9b');
    expect(inferZoneFromState('Virginia')).toBe('7a');
    expect(inferZoneFromState('Alaska')).toBe('3b');
    expect(inferZoneFromState('Hawaii')).toBe('12a');
    expect(inferZoneFromState('Texas')).toBe('8b');
  });

  it('returns the fallback zone "6b" for an unknown state', () => {
    expect(inferZoneFromState('Nonexistent')).toBe('6b');
    expect(inferZoneFromState('')).toBe('6b');
  });

  it('returns the correct zone for District of Columbia', () => {
    expect(inferZoneFromState('District of Columbia')).toBe('7a');
  });
});

describe('lookupZoneFromZip', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the zone string on a successful API response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ zone: '7a' }),
    }));

    const result = await lookupZoneFromZip('22030');
    expect(result).toBe('7a');
  });

  it('returns null when the API response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }));

    const result = await lookupZoneFromZip('00000');
    expect(result).toBeNull();
  });

  it('returns null when the response has no zone field', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }));

    const result = await lookupZoneFromZip('12345');
    expect(result).toBeNull();
  });

  it('returns null on a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));

    const result = await lookupZoneFromZip('99999');
    expect(result).toBeNull();
  });
});
