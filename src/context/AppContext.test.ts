import { describe, it, expect } from 'vitest';
import { reducer } from './AppContext';
import { AppState, GardenPlant, GardenProfile, ShedSupply } from '../types';

const emptyState: AppState = {
  profile: null,
  plants: [],
  shedSupplies: [],
  weather: null,
};

const profile: GardenProfile = {
  id: 'prof-1',
  name: 'Test Garden',
  zone: '7a',
  state: 'Virginia',
  zipCode: '22030',
  soilType: 'loamy',
  basePh: 6.5,
  baseNutrients: {},
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const plant: GardenPlant = {
  id: 'plant-1',
  plantDbId: 'db-tomato',
  name: 'Tomato',
  category: 'vegetables',
  locationType: 'in-ground',
  plantedDate: '2024-04-01T00:00:00Z',
  status: 'vegetative',
  soilMix: {},
  soilPh: 6.5,
  nutrients: {},
  amendments: [],
  fertilizerHistory: [],
  wateringHistory: [],
  wateringSchedule: { frequencyDays: 3 },
  feedingSchedule: { frequencyDays: 14 },
  notes: '',
  tags: [],
};

const plant2: GardenPlant = { ...plant, id: 'plant-2', name: 'Basil' };

const supply: ShedSupply = {
  id: 'supply-1',
  name: 'Bone Meal',
  category: 'fertilizer',
  quantity: 5,
  unit: 'lbs',
};

const supply2: ShedSupply = { ...supply, id: 'supply-2', name: 'Perlite' };

describe('AppContext reducer', () => {
  describe('LOAD_STATE', () => {
    it('replaces the entire state', () => {
      const newState: AppState = { profile, plants: [plant], shedSupplies: [supply], weather: null };
      const result = reducer(emptyState, { type: 'LOAD_STATE', payload: newState });
      expect(result).toEqual(newState);
    });
  });

  describe('SET_PROFILE', () => {
    it('sets the profile while preserving plants and supplies', () => {
      const stateWithPlants = { ...emptyState, plants: [plant] };
      const result = reducer(stateWithPlants, { type: 'SET_PROFILE', payload: profile });
      expect(result.profile).toEqual(profile);
      expect(result.plants).toEqual([plant]);
    });
  });

  describe('ADD_PLANT', () => {
    it('appends a new plant to the plants array', () => {
      const result = reducer(emptyState, { type: 'ADD_PLANT', payload: plant });
      expect(result.plants).toHaveLength(1);
      expect(result.plants[0]).toEqual(plant);
    });

    it('preserves existing plants when adding a new one', () => {
      const stateWithOne = { ...emptyState, plants: [plant] };
      const result = reducer(stateWithOne, { type: 'ADD_PLANT', payload: plant2 });
      expect(result.plants).toHaveLength(2);
      expect(result.plants.map(p => p.id)).toEqual(['plant-1', 'plant-2']);
    });
  });

  describe('UPDATE_PLANT', () => {
    it('updates the matching plant in place', () => {
      const stateWithTwo = { ...emptyState, plants: [plant, plant2] };
      const updated = { ...plant, name: 'Cherry Tomato' };
      const result = reducer(stateWithTwo, { type: 'UPDATE_PLANT', payload: updated });
      expect(result.plants).toHaveLength(2);
      expect(result.plants.find(p => p.id === 'plant-1')!.name).toBe('Cherry Tomato');
      expect(result.plants.find(p => p.id === 'plant-2')!.name).toBe('Basil');
    });
  });

  describe('DELETE_PLANT', () => {
    it('removes the plant with the given id', () => {
      const stateWithTwo = { ...emptyState, plants: [plant, plant2] };
      const result = reducer(stateWithTwo, { type: 'DELETE_PLANT', payload: 'plant-1' });
      expect(result.plants).toHaveLength(1);
      expect(result.plants[0].id).toBe('plant-2');
    });

    it('leaves the state unchanged if the id does not exist', () => {
      const stateWithOne = { ...emptyState, plants: [plant] };
      const result = reducer(stateWithOne, { type: 'DELETE_PLANT', payload: 'no-such-id' });
      expect(result.plants).toHaveLength(1);
    });
  });

  describe('ADD_SUPPLY', () => {
    it('appends a new supply to shedSupplies', () => {
      const result = reducer(emptyState, { type: 'ADD_SUPPLY', payload: supply });
      expect(result.shedSupplies).toHaveLength(1);
      expect(result.shedSupplies[0]).toEqual(supply);
    });
  });

  describe('UPDATE_SUPPLY', () => {
    it('updates the matching supply in place', () => {
      const stateWithTwo = { ...emptyState, shedSupplies: [supply, supply2] };
      const updated = { ...supply, quantity: 10 };
      const result = reducer(stateWithTwo, { type: 'UPDATE_SUPPLY', payload: updated });
      expect(result.shedSupplies.find(s => s.id === 'supply-1')!.quantity).toBe(10);
      expect(result.shedSupplies.find(s => s.id === 'supply-2')!.quantity).toBe(5);
    });
  });

  describe('DELETE_SUPPLY', () => {
    it('removes the supply with the given id', () => {
      const stateWithTwo = { ...emptyState, shedSupplies: [supply, supply2] };
      const result = reducer(stateWithTwo, { type: 'DELETE_SUPPLY', payload: 'supply-1' });
      expect(result.shedSupplies).toHaveLength(1);
      expect(result.shedSupplies[0].id).toBe('supply-2');
    });
  });

  describe('SET_WEATHER', () => {
    it('sets the weather field', () => {
      const weather = {
        temperature: 72,
        feelsLike: 70,
        humidity: 55,
        description: 'Clear sky',
        windSpeed: 5,
        precipitation: 0,
        uvIndex: 4,
        isGoodForWatering: true,
        fetchedAt: '2024-05-01T12:00:00Z',
        forecast: [],
      };
      const result = reducer(emptyState, { type: 'SET_WEATHER', payload: weather });
      expect(result.weather).toEqual(weather);
      expect(result.plants).toEqual([]);
    });
  });
});
