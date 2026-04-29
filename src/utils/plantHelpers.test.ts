import { describe, it, expect } from 'vitest';
import { phColor } from './plantHelpers';

describe('phColor', () => {
  it('returns text-red-400 for pH less than 5', () => {
    expect(phColor(4.9)).toBe('text-red-400');
    expect(phColor(0)).toBe('text-red-400');
    expect(phColor(-1)).toBe('text-red-400');
  });

  it('returns text-orange-400 for pH equal to 5', () => {
    expect(phColor(5)).toBe('text-orange-400');
  });

  it('returns text-orange-400 for pH between 5 and less than 6', () => {
    expect(phColor(5.1)).toBe('text-orange-400');
    expect(phColor(5.9)).toBe('text-orange-400');
  });

  it('returns text-yellow-400 for pH equal to 6', () => {
    expect(phColor(6)).toBe('text-yellow-400');
  });

  it('returns text-yellow-400 for pH between 6 and less than 6.5', () => {
    expect(phColor(6.1)).toBe('text-yellow-400');
    expect(phColor(6.4)).toBe('text-yellow-400');
  });

  it('returns text-green-400 for pH equal to 6.5', () => {
    expect(phColor(6.5)).toBe('text-green-400');
  });

  it('returns text-green-400 for pH between 6.5 and less than or equal to 7', () => {
    expect(phColor(6.6)).toBe('text-green-400');
    expect(phColor(6.9)).toBe('text-green-400');
    expect(phColor(7)).toBe('text-green-400');
  });

  it('returns text-blue-400 for pH greater than 7 and less than or equal to 7.5', () => {
    expect(phColor(7.1)).toBe('text-blue-400');
    expect(phColor(7.4)).toBe('text-blue-400');
    expect(phColor(7.5)).toBe('text-blue-400');
  });

  it('returns text-purple-400 for pH greater than 7.5', () => {
    expect(phColor(7.6)).toBe('text-purple-400');
    expect(phColor(8)).toBe('text-purple-400');
    expect(phColor(14)).toBe('text-purple-400');
  });
});
