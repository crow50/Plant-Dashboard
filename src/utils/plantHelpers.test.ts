import { describe, it, expect } from 'vitest';
import {
  phColor,
  categoryColor,
  statusColor,
  formatLocation,
  locationIcon,
  categoryEmoji,
  formatStatus,
  formatCategory,
} from './plantHelpers';
import { PlantCategory, PlantStatus, LocationType } from '../types';

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

describe('categoryColor', () => {
  it('returns the correct CSS class for each category', () => {
    expect(categoryColor('fruits' as PlantCategory)).toBe('bg-red-700 text-red-100');
    expect(categoryColor('vegetables' as PlantCategory)).toBe('bg-green-700 text-green-100');
    expect(categoryColor('herbs' as PlantCategory)).toBe('bg-teal-700 text-teal-100');
    expect(categoryColor('trees' as PlantCategory)).toBe('bg-amber-700 text-amber-100');
    expect(categoryColor('flowers' as PlantCategory)).toBe('bg-pink-700 text-pink-100');
    expect(categoryColor('other' as PlantCategory)).toBe('bg-gray-600 text-gray-100');
  });
});

describe('statusColor', () => {
  it('returns the correct CSS class for each plant status', () => {
    expect(statusColor('seedling' as PlantStatus)).toBe('bg-yellow-600 text-yellow-100');
    expect(statusColor('vegetative' as PlantStatus)).toBe('bg-green-600 text-green-100');
    expect(statusColor('flowering' as PlantStatus)).toBe('bg-pink-600 text-pink-100');
    expect(statusColor('fruiting' as PlantStatus)).toBe('bg-orange-600 text-orange-100');
    expect(statusColor('dormant' as PlantStatus)).toBe('bg-gray-600 text-gray-100');
    expect(statusColor('ready-to-harvest' as PlantStatus)).toBe('bg-emerald-500 text-white');
    expect(statusColor('harvested' as PlantStatus)).toBe('bg-gray-700 text-gray-300');
  });
});

describe('formatLocation', () => {
  it('returns a human-readable label for each location type', () => {
    expect(formatLocation('in-ground' as LocationType)).toBe('In Ground');
    expect(formatLocation('container' as LocationType)).toBe('Container');
    expect(formatLocation('greenhouse' as LocationType)).toBe('Greenhouse');
    expect(formatLocation('indoor' as LocationType)).toBe('Indoor');
  });
});

describe('locationIcon', () => {
  it('returns the correct emoji for each location type', () => {
    expect(locationIcon('in-ground' as LocationType)).toBe('🌍');
    expect(locationIcon('container' as LocationType)).toBe('🪴');
    expect(locationIcon('greenhouse' as LocationType)).toBe('🏡');
    expect(locationIcon('indoor' as LocationType)).toBe('🪟');
  });
});

describe('categoryEmoji', () => {
  it('returns the correct emoji for each category', () => {
    expect(categoryEmoji('fruits' as PlantCategory)).toBe('🍓');
    expect(categoryEmoji('vegetables' as PlantCategory)).toBe('🥦');
    expect(categoryEmoji('herbs' as PlantCategory)).toBe('🌿');
    expect(categoryEmoji('trees' as PlantCategory)).toBe('🌳');
    expect(categoryEmoji('flowers' as PlantCategory)).toBe('🌸');
    expect(categoryEmoji('other' as PlantCategory)).toBe('🌱');
  });
});

describe('formatStatus', () => {
  it('capitalizes single-word statuses', () => {
    expect(formatStatus('seedling' as PlantStatus)).toBe('Seedling');
    expect(formatStatus('vegetative' as PlantStatus)).toBe('Vegetative');
    expect(formatStatus('harvested' as PlantStatus)).toBe('Harvested');
  });

  it('replaces hyphens with spaces and title-cases hyphenated statuses', () => {
    expect(formatStatus('ready-to-harvest' as PlantStatus)).toBe('Ready To Harvest');
  });
});

describe('formatCategory', () => {
  it('capitalizes the first letter of each category', () => {
    expect(formatCategory('fruits' as PlantCategory)).toBe('Fruits');
    expect(formatCategory('vegetables' as PlantCategory)).toBe('Vegetables');
    expect(formatCategory('other' as PlantCategory)).toBe('Other');
  });
});
