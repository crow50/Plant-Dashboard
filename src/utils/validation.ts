import { AppState, GardenPlant, GardenProfile, ShedSupply } from '../types';

export function validateProfile(data: any): GardenProfile | null {
  if (!data || typeof data !== 'object') return null;

  if (
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.zone === 'string' &&
    typeof data.state === 'string' &&
    typeof data.zipCode === 'string' &&
    typeof data.soilType === 'string' &&
    typeof data.basePh === 'number' &&
    typeof data.createdAt === 'string' &&
    typeof data.updatedAt === 'string'
  ) {
    return {
      id: data.id,
      name: data.name,
      zone: data.zone,
      state: data.state,
      zipCode: data.zipCode,
      lat: typeof data.lat === 'number' ? data.lat : undefined,
      lon: typeof data.lon === 'number' ? data.lon : undefined,
      soilType: data.soilType,
      basePh: data.basePh,
      baseNutrients: typeof data.baseNutrients === 'object' ? data.baseNutrients : {},
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
  return null;
}

export function validatePlant(data: any): GardenPlant | null {
  if (!data || typeof data !== 'object') return null;

  if (
    typeof data.id === 'string' &&
    typeof data.plantDbId === 'string' &&
    typeof data.name === 'string' &&
    typeof data.category === 'string' &&
    typeof data.locationType === 'string' &&
    typeof data.plantedDate === 'string' &&
    typeof data.status === 'string'
  ) {
    return {
      id: data.id,
      plantDbId: data.plantDbId,
      name: data.name,
      variety: typeof data.variety === 'string' ? data.variety : undefined,
      category: data.category,
      locationType: data.locationType,
      plantedDate: data.plantedDate,
      containerSize: typeof data.containerSize === 'string' ? data.containerSize : undefined,
      containerMaterial: typeof data.containerMaterial === 'string' ? data.containerMaterial : undefined,
      plotSize: typeof data.plotSize === 'string' ? data.plotSize : undefined,
      soilMix: typeof data.soilMix === 'object' ? data.soilMix : {},
      soilPh: typeof data.soilPh === 'number' ? data.soilPh : 7.0,
      nutrients: typeof data.nutrients === 'object' ? data.nutrients : {},
      amendments: Array.isArray(data.amendments) ? data.amendments : [],
      fertilizerHistory: Array.isArray(data.fertilizerHistory) ? data.fertilizerHistory : [],
      wateringHistory: Array.isArray(data.wateringHistory) ? data.wateringHistory : [],
      wateringSchedule: typeof data.wateringSchedule === 'object' ? data.wateringSchedule : { frequencyDays: 7 },
      feedingSchedule: typeof data.feedingSchedule === 'object' ? data.feedingSchedule : { frequencyDays: 30 },
      amendmentSchedule: typeof data.amendmentSchedule === 'object' ? data.amendmentSchedule : undefined,
      notes: typeof data.notes === 'string' ? data.notes : '',
      status: data.status,
      imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
      estimatedHarvestDate: typeof data.estimatedHarvestDate === 'string' ? data.estimatedHarvestDate : undefined,
      lastInspected: typeof data.lastInspected === 'string' ? data.lastInspected : undefined,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  }
  return null;
}

export function validateSupply(data: any): ShedSupply | null {
  if (!data || typeof data !== 'object') return null;

  if (
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.category === 'string' &&
    typeof data.quantity === 'number' &&
    typeof data.unit === 'string'
  ) {
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      brand: typeof data.brand === 'string' ? data.brand : undefined,
      quantity: data.quantity,
      unit: data.unit,
      npk: typeof data.npk === 'string' ? data.npk : undefined,
      purchaseDate: typeof data.purchaseDate === 'string' ? data.purchaseDate : undefined,
      expiryDate: typeof data.expiryDate === 'string' ? data.expiryDate : undefined,
      notes: typeof data.notes === 'string' ? data.notes : undefined,
      lowStockThreshold: typeof data.lowStockThreshold === 'number' ? data.lowStockThreshold : undefined,
    };
  }
  return null;
}

export function validateAppState(data: any): AppState {
  const defaultState: AppState = {
    profile: null,
    plants: [],
    shedSupplies: [],
    weather: null,
  };

  if (!data || typeof data !== 'object') return defaultState;

  return {
    profile: validateProfile(data.profile),
    plants: Array.isArray(data.plants)
      ? data.plants.map(validatePlant).filter((p: any): p is GardenPlant => p !== null)
      : [],
    shedSupplies: Array.isArray(data.shedSupplies)
      ? data.shedSupplies.map(validateSupply).filter((s: any): s is ShedSupply => s !== null)
      : [],
    weather: null,
  };
}
