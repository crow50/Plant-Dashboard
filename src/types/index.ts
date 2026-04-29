export type PlantCategory = 'fruits' | 'vegetables' | 'herbs' | 'trees' | 'flowers' | 'other';
export type LocationType = 'in-ground' | 'container' | 'greenhouse' | 'indoor';
export type SoilType = 'sandy' | 'silty' | 'clay' | 'loamy' | 'chalky' | 'peaty';
export type PlantStatus = 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'dormant' | 'ready-to-harvest' | 'harvested';
export type SunRequirement = 'full-sun' | 'partial-shade' | 'full-shade';
export type SupplyCategory = 'soil' | 'fertilizer' | 'amendment' | 'pesticide' | 'tool' | 'container' | 'other';

export interface NutrientLevels {
  nitrogen: number;   // ppm
  phosphorus: number; // ppm
  potassium: number;  // ppm
  calcium: number;    // ppm
  magnesium: number;  // ppm
  sulfur: number;     // ppm
  iron: number;       // ppm
  manganese: number;  // ppm
  zinc: number;       // ppm
  copper: number;     // ppm
  boron: number;      // ppm
  salt: number;       // EC ms/cm
}

export interface SoilMix {
  type: SoilType;
  sandPercent: number;
  siltPercent: number;
  clayPercent: number;
  organicMatter: number; // percent
  perlite?: number;      // percent
  compost?: number;      // percent
}

export interface Amendment {
  id: string;
  date: string;
  product: string;
  amount: string;
  unit: string;
  purpose: string;
  notes?: string;
}

export interface FertilizerEntry {
  id: string;
  date: string;
  product: string;
  npk: string;
  amount: string;
  unit: string;
  method: 'soil-drench' | 'foliar' | 'top-dress' | 'side-dress' | 'fertigation';
  notes?: string;
}

export interface WateringEntry {
  id: string;
  date: string;
  amount: string;
  unit: 'gallons' | 'liters' | 'inches';
  method: 'hand' | 'drip' | 'sprinkler' | 'rain';
  notes?: string;
}

export interface Schedule {
  frequencyDays: number;
  lastDate?: string;
  nextDate?: string;
  notes?: string;
}

export interface GardenPlant {
  id: string;
  plantDbId: string;
  name: string;
  variety?: string;
  category: PlantCategory;
  locationType: LocationType;
  plantedDate: string;
  containerSize?: string;      // e.g., "5 gallon", "10 gallon"
  containerMaterial?: string;
  plotSize?: string;           // e.g., "4x4 ft", "raised bed"
  soilMix: Partial<SoilMix>;
  soilPh: number;
  nutrients: Partial<NutrientLevels>;
  amendments: Amendment[];
  fertilizerHistory: FertilizerEntry[];
  wateringHistory: WateringEntry[];
  wateringSchedule: Schedule;
  feedingSchedule: Schedule;
  amendmentSchedule?: Schedule;
  notes: string;
  status: PlantStatus;
  imageUrl?: string;
  estimatedHarvestDate?: string;
  lastInspected?: string;
  tags: string[];
}

export interface PlantDbEntry {
  id: string;
  name: string;
  scientificName: string;
  category: PlantCategory;
  commonNames: string[];
  zones: string[];           // e.g., ["6a","6b","7a","7b","8a","8b","9a","9b"]
  wateringFrequencyDays: number;
  nutrientNeeds: {
    nitrogen: 'low' | 'medium' | 'high';
    phosphorus: 'low' | 'medium' | 'high';
    potassium: 'low' | 'medium' | 'high';
    calcium: 'low' | 'medium' | 'high';
    magnesium: 'low' | 'medium' | 'high';
  };
  feedingFrequencyDays: number;
  phMin: number;
  phMax: number;
  sunRequirement: SunRequirement;
  spacingInches: number;
  chillHours?: number;
  daysToMaturity: number;
  seasons: string[];         // ['spring','summer','fall','winter']
  maxTempF: number;
  minTempF: number;
  description: string;
  careNotes: string;
  commonIssues: string[];
  companionPlants: string[];
}

export interface ShedSupply {
  id: string;
  name: string;
  category: SupplyCategory;
  brand?: string;
  quantity: number;
  unit: string;
  npk?: string;             // for fertilizers e.g. "10-10-10"
  purchaseDate?: string;
  expiryDate?: string;
  notes?: string;
  lowStockThreshold?: number;
}

export interface GardenProfile {
  id: string;
  name: string;
  zone: string;
  state: string;
  zipCode: string;
  lat?: number;
  lon?: number;
  soilType: SoilType;
  basePh: number;
  baseNutrients: Partial<NutrientLevels>;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  isGoodForWatering: boolean;
  forecast: WeatherForecastDay[];
  fetchedAt: string;
}

export interface WeatherForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  description: string;
}

export interface AppState {
  profile: GardenProfile | null;
  plants: GardenPlant[];
  shedSupplies: ShedSupply[];
  weather: WeatherData | null;
}
