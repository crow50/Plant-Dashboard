import { describe, it, expect } from 'vitest';
import { validateProfile, validatePlant, validateSupply, validateAppState } from './validation';

const validProfile = {
  id: 'p1',
  name: 'My Garden',
  zone: '7a',
  state: 'Virginia',
  zipCode: '22030',
  soilType: 'loam',
  basePh: 6.5,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const validPlant = {
  id: 'plant-1',
  plantDbId: 'db-tomato',
  name: 'Tomato',
  category: 'vegetables',
  locationType: 'in-ground',
  plantedDate: '2024-04-01T00:00:00Z',
  status: 'vegetative',
};

const validSupply = {
  id: 's1',
  name: 'Bone Meal',
  category: 'fertilizer',
  quantity: 5,
  unit: 'lbs',
};

describe('validateProfile', () => {
  it('returns a valid profile from a complete object', () => {
    const result = validateProfile(validProfile);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('p1');
    expect(result!.name).toBe('My Garden');
    expect(result!.basePh).toBe(6.5);
  });

  it('returns null for null input', () => {
    expect(validateProfile(null)).toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(validateProfile('string')).toBeNull();
    expect(validateProfile(42)).toBeNull();
  });

  it('returns null when a required string field is missing', () => {
    const { id: _id, ...withoutId } = validProfile;
    expect(validateProfile(withoutId)).toBeNull();

    const { zone: _zone, ...withoutZone } = validProfile;
    expect(validateProfile(withoutZone)).toBeNull();
  });

  it('returns null when basePh is not a number', () => {
    expect(validateProfile({ ...validProfile, basePh: '6.5' })).toBeNull();
  });

  it('includes optional lat/lon when they are numbers', () => {
    const result = validateProfile({ ...validProfile, lat: 38.9, lon: -77.0 });
    expect(result!.lat).toBe(38.9);
    expect(result!.lon).toBe(-77.0);
  });

  it('omits lat/lon when they are not numbers', () => {
    const result = validateProfile({ ...validProfile, lat: 'north', lon: null });
    expect(result!.lat).toBeUndefined();
    expect(result!.lon).toBeUndefined();
  });

  it('defaults baseNutrients to {} when not an object', () => {
    const result = validateProfile({ ...validProfile, baseNutrients: 'bad' });
    expect(result!.baseNutrients).toEqual({});
  });
});

describe('validatePlant', () => {
  it('returns a valid plant from a minimal object', () => {
    const result = validatePlant(validPlant);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('plant-1');
    expect(result!.name).toBe('Tomato');
  });

  it('returns null for null input', () => {
    expect(validatePlant(null)).toBeNull();
  });

  it('returns null when a required field is missing', () => {
    const { id: _id, ...withoutId } = validPlant;
    expect(validatePlant(withoutId)).toBeNull();

    const { status: _status, ...withoutStatus } = validPlant;
    expect(validatePlant(withoutStatus)).toBeNull();
  });

  it('defaults soilPh to 7.0 when absent', () => {
    const result = validatePlant(validPlant);
    expect(result!.soilPh).toBe(7.0);
  });

  it('uses provided soilPh when it is a number', () => {
    const result = validatePlant({ ...validPlant, soilPh: 6.2 });
    expect(result!.soilPh).toBe(6.2);
  });

  it('defaults wateringSchedule when absent', () => {
    const result = validatePlant(validPlant);
    expect(result!.wateringSchedule).toEqual({ frequencyDays: 7 });
  });

  it('defaults feedingSchedule when absent', () => {
    const result = validatePlant(validPlant);
    expect(result!.feedingSchedule).toEqual({ frequencyDays: 30 });
  });

  it('defaults arrays (amendments, fertilizerHistory, wateringHistory, tags) to []', () => {
    const result = validatePlant(validPlant);
    expect(result!.amendments).toEqual([]);
    expect(result!.fertilizerHistory).toEqual([]);
    expect(result!.wateringHistory).toEqual([]);
    expect(result!.tags).toEqual([]);
  });

  it('preserves provided arrays', () => {
    const wateringHistory = [{ id: 'w1', date: '2024-05-01', amount: '1', unit: 'gallons', method: 'hand' }];
    const result = validatePlant({ ...validPlant, wateringHistory });
    expect(result!.wateringHistory).toEqual(wateringHistory);
  });

  it('includes optional variety when it is a string', () => {
    const result = validatePlant({ ...validPlant, variety: 'Cherry' });
    expect(result!.variety).toBe('Cherry');
  });

  it('omits optional variety when not a string', () => {
    const result = validatePlant({ ...validPlant, variety: 123 });
    expect(result!.variety).toBeUndefined();
  });
});

describe('validateSupply', () => {
  it('returns a valid supply from a minimal object', () => {
    const result = validateSupply(validSupply);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('s1');
    expect(result!.quantity).toBe(5);
  });

  it('returns null for null input', () => {
    expect(validateSupply(null)).toBeNull();
  });

  it('returns null when quantity is not a number', () => {
    expect(validateSupply({ ...validSupply, quantity: '5' })).toBeNull();
  });

  it('returns null when a required string field is missing', () => {
    const { name: _name, ...withoutName } = validSupply;
    expect(validateSupply(withoutName)).toBeNull();
  });

  it('includes optional npk when it is a string', () => {
    const result = validateSupply({ ...validSupply, npk: '5-10-5' });
    expect(result!.npk).toBe('5-10-5');
  });

  it('omits optional fields when absent', () => {
    const result = validateSupply(validSupply);
    expect(result!.brand).toBeUndefined();
    expect(result!.npk).toBeUndefined();
    expect(result!.notes).toBeUndefined();
    expect(result!.lowStockThreshold).toBeUndefined();
  });
});

describe('validateAppState', () => {
  it('returns default state for null input', () => {
    const result = validateAppState(null);
    expect(result.profile).toBeNull();
    expect(result.plants).toEqual([]);
    expect(result.shedSupplies).toEqual([]);
    expect(result.weather).toBeNull();
  });

  it('returns default state for non-object input', () => {
    expect(validateAppState('bad').profile).toBeNull();
  });

  it('validates and returns a full state object', () => {
    const input = {
      profile: validProfile,
      plants: [validPlant],
      shedSupplies: [validSupply],
      weather: { temperature: 72 },
    };
    const result = validateAppState(input);
    expect(result.profile).not.toBeNull();
    expect(result.plants).toHaveLength(1);
    expect(result.shedSupplies).toHaveLength(1);
  });

  it('always resets weather to null', () => {
    const input = { profile: null, plants: [], shedSupplies: [], weather: { temperature: 72 } };
    expect(validateAppState(input).weather).toBeNull();
  });

  it('filters out invalid plants from the array', () => {
    const input = {
      profile: null,
      plants: [validPlant, { bad: 'data' }, { id: 'x', plantDbId: 'y', name: 'ok', category: 'herbs', locationType: 'indoor', plantedDate: '2024-01-01', status: 'seedling' }],
      shedSupplies: [],
    };
    const result = validateAppState(input);
    expect(result.plants).toHaveLength(2);
  });

  it('filters out invalid supplies from the array', () => {
    const input = {
      profile: null,
      plants: [],
      shedSupplies: [validSupply, { missing: 'fields' }],
    };
    const result = validateAppState(input);
    expect(result.shedSupplies).toHaveLength(1);
  });

  it('returns empty arrays when plants/shedSupplies are not arrays', () => {
    const result = validateAppState({ profile: null, plants: 'bad', shedSupplies: null });
    expect(result.plants).toEqual([]);
    expect(result.shedSupplies).toEqual([]);
  });
});
