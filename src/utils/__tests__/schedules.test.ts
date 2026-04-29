import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPlantsNeedingWater } from '../schedules';
import { GardenPlant } from '../../types';

describe('getPlantsNeedingWater', () => {
  const mockDate = new Date('2023-10-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockPlant = (overrides: Partial<GardenPlant> = {}): GardenPlant => ({
    id: 'test-plant',
    plantDbId: 'db-test',
    name: 'Test Plant',
    category: 'vegetables',
    locationType: 'in-ground',
    plantedDate: '2023-10-01T00:00:00Z',
    soilMix: {},
    soilPh: 6.5,
    nutrients: {},
    amendments: [],
    fertilizerHistory: [],
    wateringHistory: [],
    wateringSchedule: { frequencyDays: 7 },
    feedingSchedule: { frequencyDays: 14 },
    notes: '',
    status: 'vegetative',
    tags: [],
    ...overrides,
  });

  it('should return plants that need watering (daysUntilWatering <= 0)', () => {
    // Planted on 10-01, frequency 7 days, so next water date is 10-08
    // Current mock date is 10-15. Needs water since 10-08 <= 10-15
    const plant = createMockPlant({
      plantedDate: '2023-10-01T00:00:00Z',
      wateringSchedule: { frequencyDays: 7 },
    });

    const result = getPlantsNeedingWater([plant]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-plant');
  });

  it('should not return plants that do not need watering yet (daysUntilWatering > 0)', () => {
    // Planted on 10-10, frequency 7 days, so next water date is 10-17
    // Current mock date is 10-15. Does not need water yet.
    const plant = createMockPlant({
      plantedDate: '2023-10-10T00:00:00Z',
      wateringSchedule: { frequencyDays: 7 },
    });

    const result = getPlantsNeedingWater([plant]);
    expect(result).toHaveLength(0);
  });

  it('should return a plant needing water exactly today (daysUntilWatering === 0)', () => {
    // Planted on 10-08, frequency 7 days, next water date is 10-15
    // Current mock date is 10-15. Needs water today.
    const plant = createMockPlant({
      plantedDate: '2023-10-08T00:00:00Z',
      wateringSchedule: { frequencyDays: 7 },
    });

    const result = getPlantsNeedingWater([plant]);
    expect(result).toHaveLength(1);
  });

  it('should consider the last watering date from wateringHistory', () => {
    const plant = createMockPlant({
      plantedDate: '2023-10-01T00:00:00Z',
      wateringSchedule: { frequencyDays: 7 },
      wateringHistory: [
        { id: '1', date: '2023-10-10T00:00:00Z', amount: '1', unit: 'gallons', method: 'hand' }
      ]
    });
    // Next water date is 10-17. Current mock date is 10-15.
    const result = getPlantsNeedingWater([plant]);
    expect(result).toHaveLength(0);
  });

  it('should ignore plants with "harvested" status even if they need water', () => {
    const plant = createMockPlant({
      plantedDate: '2023-10-01T00:00:00Z',
      wateringSchedule: { frequencyDays: 7 },
      status: 'harvested'
    });

    const result = getPlantsNeedingWater([plant]);
    expect(result).toHaveLength(0);
  });

  it('should handle an array with multiple plants and return only the ones needing water', () => {
    const plantNeedingWater = createMockPlant({
      id: 'needs-water',
      plantedDate: '2023-10-01T00:00:00Z',
      wateringSchedule: { frequencyDays: 7 }
    });
    const plantNotNeedingWater = createMockPlant({
      id: 'does-not-need-water',
      plantedDate: '2023-10-10T00:00:00Z',
      wateringSchedule: { frequencyDays: 7 }
    });
    const plantHarvested = createMockPlant({
      id: 'harvested',
      plantedDate: '2023-10-01T00:00:00Z',
      wateringSchedule: { frequencyDays: 7 },
      status: 'harvested'
    });

    const result = getPlantsNeedingWater([plantNeedingWater, plantNotNeedingWater, plantHarvested]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('needs-water');
  });
});
