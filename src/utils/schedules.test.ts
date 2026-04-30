import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  daysUntilWatering,
  daysUntilFeeding,
  nextWateringDate,
  nextFeedingDate,
  daysGrown,
  getPlantsNeedingWater,
  getPlantsNeedingFeeding,
  getUpcomingWatering,
  getUpcomingFeeding,
} from './schedules';
import { GardenPlant, PlantStatus, PlantCategory, LocationType } from '../types';

describe('schedules utils', () => {
  const createDummyPlant = (overrides: Partial<GardenPlant> = {}): GardenPlant => {
    return {
      id: 'p1',
      plantDbId: 'db1',
      name: 'Tomato',
      category: 'vegetables' as PlantCategory,
      locationType: 'in-ground' as LocationType,
      plantedDate: '2023-05-01T12:00:00Z',
      soilMix: {},
      soilPh: 6.5,
      nutrients: {},
      amendments: [],
      fertilizerHistory: [],
      wateringHistory: [],
      wateringSchedule: { frequencyDays: 3 },
      feedingSchedule: { frequencyDays: 14 },
      notes: '',
      status: 'vegetative' as PlantStatus,
      tags: [],
      ...overrides,
    };
  };

  const NOW = new Date('2023-05-10T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('daysUntilWatering', () => {
    it('calculates based on plantedDate if no watering history', () => {
      const plant = createDummyPlant({ plantedDate: '2023-05-01T12:00:00Z' });
      // Next date = 2023-05-01 + 3 days = 2023-05-04
      // NOW = 2023-05-10. diff = 04 - 10 = -6
      expect(daysUntilWatering(plant)).toBe(-6);
    });

    it('calculates based on the last watering history date', () => {
      const plant = createDummyPlant({
        wateringHistory: [
          { id: 'w1', date: '2023-05-08T12:00:00Z', amount: '1', unit: 'gallons', method: 'hand' },
        ],
      });
      // Next date = 2023-05-08 + 3 days = 2023-05-11
      // NOW = 2023-05-10. diff = 11 - 10 = 1
      expect(daysUntilWatering(plant)).toBe(1);
    });

    it('uses the most recent watering history date when multiple exist', () => {
      const plant = createDummyPlant({
        wateringHistory: [
          { id: 'w1', date: '2023-05-06T12:00:00Z', amount: '1', unit: 'gallons', method: 'hand' },
          { id: 'w2', date: '2023-05-07T12:00:00Z', amount: '1', unit: 'gallons', method: 'hand' },
          { id: 'w3', date: '2023-05-09T12:00:00Z', amount: '1', unit: 'gallons', method: 'hand' },
        ],
      });
      // Next date = 2023-05-09 + 3 days = 2023-05-12
      // NOW = 2023-05-10. diff = 12 - 10 = 2
      expect(daysUntilWatering(plant)).toBe(2);
    });

    it('respects an explicitly provided "now" date', () => {
      const plant = createDummyPlant({
        wateringHistory: [
          { id: 'w1', date: '2023-05-08T12:00:00Z', amount: '1', unit: 'gallons', method: 'hand' },
        ],
      });
      // Next date = 2023-05-08 + 3 days = 2023-05-11
      // Explicit NOW = 2023-05-12. diff = 11 - 12 = -1
      const explicitNow = new Date('2023-05-12T12:00:00Z');
      expect(daysUntilWatering(plant, explicitNow)).toBe(-1);
    });

    it('handles frequencyDays of 0', () => {
      const plant = createDummyPlant({
        wateringSchedule: { frequencyDays: 0 },
        wateringHistory: [
          { id: 'w1', date: '2023-05-08T12:00:00Z', amount: '1', unit: 'gallons', method: 'hand' },
        ],
      });
      // Next date = 2023-05-08 + 0 days = 2023-05-08
      // NOW = 2023-05-10. diff = 08 - 10 = -2
      expect(daysUntilWatering(plant)).toBe(-2);
    });

    it('returns 0 when the next watering date is exactly today', () => {
      const plant = createDummyPlant({
        wateringSchedule: { frequencyDays: 2 },
        wateringHistory: [
          { id: 'w1', date: '2023-05-08T12:00:00Z', amount: '1', unit: 'gallons', method: 'hand' },
        ],
      });
      // Next date = 2023-05-08 + 2 days = 2023-05-10
      // NOW = 2023-05-10. diff = 10 - 10 = 0
      expect(daysUntilWatering(plant)).toBe(0);
    });
  });

  describe('daysUntilFeeding', () => {
    it('calculates based on plantedDate if no fertilizer history', () => {
      const plant = createDummyPlant({ plantedDate: '2023-05-01T12:00:00Z' });
      // Next date = 2023-05-01 + 14 days = 2023-05-15
      // NOW = 2023-05-10. diff = 15 - 10 = 5
      expect(daysUntilFeeding(plant)).toBe(5);
    });

    it('calculates based on the last fertilizer history date', () => {
      const plant = createDummyPlant({
        fertilizerHistory: [
          { id: 'f1', date: '2023-05-05T12:00:00Z', product: 'Fertilizer', npk: '10-10-10', amount: '1', unit: 'cup', method: 'top-dress' },
        ],
      });
      // Next date = 2023-05-05 + 14 days = 2023-05-19
      // NOW = 2023-05-10. diff = 19 - 10 = 9
      expect(daysUntilFeeding(plant)).toBe(9);
    });
  });

  describe('nextWateringDate', () => {
    it('returns the formatted date string', () => {
      const plant = createDummyPlant({
        wateringHistory: [
          { id: 'w1', date: '2023-05-08T12:00:00Z', amount: '1', unit: 'gallons', method: 'hand' },
        ],
      });
      // 2023-05-08 + 3 days = 2023-05-11 -> "May 11"
      expect(nextWateringDate(plant)).toBe('May 11');
    });
  });

  describe('nextFeedingDate', () => {
    it('returns the formatted date string', () => {
      const plant = createDummyPlant({
        fertilizerHistory: [
          { id: 'f1', date: '2023-05-05T12:00:00Z', product: 'Fertilizer', npk: '10-10-10', amount: '1', unit: 'cup', method: 'top-dress' },
        ],
      });
      // 2023-05-05 + 14 days = 2023-05-19 -> "May 19"
      expect(nextFeedingDate(plant)).toBe('May 19');
    });
  });

  describe('daysGrown', () => {
    it('calculates the number of days grown based on plantedDate', () => {
      const plant = createDummyPlant({ plantedDate: '2023-05-01T12:00:00Z' });
      // NOW = 2023-05-10. diff = 10 - 01 = 9
      expect(daysGrown(plant)).toBe(9);
    });
  });

  describe('getPlantsNeedingWater', () => {
    it('returns plants whose daysUntilWatering is <= 0 and are not harvested', () => {
      const needsWater1 = createDummyPlant({ id: 'p1', plantedDate: '2023-05-01T12:00:00Z' }); // diff = -6
      const needsWater2 = createDummyPlant({
        id: 'p2',
        wateringHistory: [{ id: 'w1', date: '2023-05-07T12:00:00Z', amount: '1', unit: 'gallons', method: 'hand' }],
      }); // next = 10th. diff = 0
      const okPlant = createDummyPlant({
        id: 'p3',
        wateringHistory: [{ id: 'w2', date: '2023-05-08T12:00:00Z', amount: '1', unit: 'gallons', method: 'hand' }],
      }); // next = 11th. diff = 1
      const harvestedPlant = createDummyPlant({
        id: 'p4',
        plantedDate: '2023-05-01T12:00:00Z',
        status: 'harvested' as PlantStatus,
      }); // diff = -6, but harvested

      const result = getPlantsNeedingWater([needsWater1, needsWater2, okPlant, harvestedPlant]);
      expect(result.map(p => p.id)).toEqual(['p1', 'p2']);
    });
  });

  describe('getPlantsNeedingFeeding', () => {
    it('returns plants whose daysUntilFeeding is <= 0 and are not harvested', () => {
      const needsFeeding1 = createDummyPlant({
        id: 'p1',
        fertilizerHistory: [{ id: 'f1', date: '2023-04-26T12:00:00Z', product: 'A', npk: '', amount: '1', unit: '', method: 'foliar' }]
      }); // next = May 10th. diff = 0
      const okPlant = createDummyPlant({
        id: 'p2',
        fertilizerHistory: [{ id: 'f2', date: '2023-05-05T12:00:00Z', product: 'A', npk: '', amount: '1', unit: '', method: 'foliar' }]
      }); // next = May 19th. diff = 9
      const harvestedPlant = createDummyPlant({
        id: 'p3',
        plantedDate: '2023-04-01T12:00:00Z',
        status: 'harvested' as PlantStatus,
      });

      const result = getPlantsNeedingFeeding([needsFeeding1, okPlant, harvestedPlant]);
      expect(result.map(p => p.id)).toEqual(['p1']);
    });
  });

  describe('getUpcomingWatering', () => {
    it('returns plants that need watering within the specified days (> 0 and <= days), not harvested', () => {
      const needsWaterNow = createDummyPlant({ id: 'p1', plantedDate: '2023-05-01T12:00:00Z' }); // diff = -6
      const upcoming1 = createDummyPlant({
        id: 'p2',
        wateringHistory: [{ id: 'w1', date: '2023-05-08T12:00:00Z', amount: '', unit: 'gallons', method: 'hand' }],
      }); // next = 11th. diff = 1
      const upcoming3 = createDummyPlant({
        id: 'p3',
        wateringHistory: [{ id: 'w2', date: '2023-05-10T12:00:00Z', amount: '', unit: 'gallons', method: 'hand' }],
      }); // next = 13th. diff = 3
      const farFuture = createDummyPlant({
        id: 'p4',
        wateringHistory: [{ id: 'w3', date: '2023-05-11T12:00:00Z', amount: '', unit: 'gallons', method: 'hand' }],
      }); // next = 14th. diff = 4
      const harvested = createDummyPlant({
        id: 'p5',
        wateringHistory: [{ id: 'w4', date: '2023-05-08T12:00:00Z', amount: '', unit: 'gallons', method: 'hand' }],
        status: 'harvested' as PlantStatus,
      });

      // Default is 3 days
      const result = getUpcomingWatering([needsWaterNow, upcoming1, upcoming3, farFuture, harvested]);
      expect(result.map(p => p.id)).toEqual(['p2', 'p3']);
    });
  });

  describe('getUpcomingFeeding', () => {
    it('returns plants that need feeding within the specified days (> 0 and <= days), not harvested', () => {
      const needsFeedingNow = createDummyPlant({
        id: 'p1',
        fertilizerHistory: [{ id: 'f1', date: '2023-04-26T12:00:00Z', product: '', npk: '', amount: '', unit: '', method: 'foliar' }]
      }); // diff = 0
      const upcoming1 = createDummyPlant({
        id: 'p2',
        fertilizerHistory: [{ id: 'f2', date: '2023-04-27T12:00:00Z', product: '', npk: '', amount: '', unit: '', method: 'foliar' }]
      }); // next = May 11th. diff = 1
      const upcoming7 = createDummyPlant({
        id: 'p3',
        fertilizerHistory: [{ id: 'f3', date: '2023-05-03T12:00:00Z', product: '', npk: '', amount: '', unit: '', method: 'foliar' }]
      }); // next = May 17th. diff = 7
      const farFuture = createDummyPlant({
        id: 'p4',
        fertilizerHistory: [{ id: 'f4', date: '2023-05-05T12:00:00Z', product: '', npk: '', amount: '', unit: '', method: 'foliar' }]
      }); // next = May 19th. diff = 9
      const harvested = createDummyPlant({
        id: 'p5',
        fertilizerHistory: [{ id: 'f5', date: '2023-04-27T12:00:00Z', product: '', npk: '', amount: '', unit: '', method: 'foliar' }],
        status: 'harvested' as PlantStatus,
      });

      // Default is 7 days
      const result = getUpcomingFeeding([needsFeedingNow, upcoming1, upcoming7, farFuture, harvested]);
      expect(result.map(p => p.id)).toEqual(['p2', 'p3']);
    });
  });
});
