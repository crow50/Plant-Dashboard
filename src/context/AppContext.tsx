import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AppState, GardenPlant, GardenProfile, ShedSupply, WeatherData } from '../types';

type Action =
  | { type: 'SET_PROFILE'; payload: GardenProfile }
  | { type: 'ADD_PLANT'; payload: GardenPlant }
  | { type: 'UPDATE_PLANT'; payload: GardenPlant }
  | { type: 'DELETE_PLANT'; payload: string }
  | { type: 'ADD_SUPPLY'; payload: ShedSupply }
  | { type: 'UPDATE_SUPPLY'; payload: ShedSupply }
  | { type: 'DELETE_SUPPLY'; payload: string }
  | { type: 'SET_WEATHER'; payload: WeatherData }
  | { type: 'LOAD_STATE'; payload: AppState };

const STORAGE_KEY = 'plant-dashboard-v1';

const initialState: AppState = {
  profile: null,
  plants: [],
  shedSupplies: [],
  weather: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'ADD_PLANT':
      return { ...state, plants: [...state.plants, action.payload] };
    case 'UPDATE_PLANT':
      return {
        ...state,
        plants: state.plants.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PLANT':
      return { ...state, plants: state.plants.filter(p => p.id !== action.payload) };
    case 'ADD_SUPPLY':
      return { ...state, shedSupplies: [...state.shedSupplies, action.payload] };
    case 'UPDATE_SUPPLY':
      return {
        ...state,
        shedSupplies: state.shedSupplies.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case 'DELETE_SUPPLY':
      return { ...state, shedSupplies: state.shedSupplies.filter(s => s.id !== action.payload) };
    case 'SET_WEATHER':
      return { ...state, weather: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  setProfile: (profile: GardenProfile) => void;
  addPlant: (plant: GardenPlant) => void;
  updatePlant: (plant: GardenPlant) => void;
  deletePlant: (id: string) => void;
  addSupply: (supply: ShedSupply) => void;
  updateSupply: (supply: ShedSupply) => void;
  deleteSupply: (id: string) => void;
  refreshWeather: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppState;
        dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsed, weather: null } });
      } catch {
        // ignore corrupt storage
      }
    }
  }, []);

  useEffect(() => {
    const toSave: AppState = { ...state, weather: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state]);

  const refreshWeather = useCallback(async () => {
    if (!state.profile) return;
    const { lat, lon, zipCode } = state.profile;

    let finalLat = lat;
    let finalLon = lon;

    if (!finalLat || !finalLon) {
      if (!zipCode) return;
      try {
        const geo = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=US&format=json&limit=1`,
          { headers: { 'User-Agent': 'PlantDashboard/1.0' } }
        );
        const geoData = await geo.json() as Array<{ lat: string; lon: string }>;
        if (geoData.length > 0) {
          finalLat = parseFloat(geoData[0].lat);
          finalLon = parseFloat(geoData[0].lon);
        }
      } catch {
        return;
      }
    }

    if (!finalLat || !finalLon) return;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=7`;
      const res = await fetch(url);
      const data = await res.json() as {
        current: {
          temperature_2m: number;
          relative_humidity_2m: number;
          apparent_temperature: number;
          precipitation: number;
          weather_code: number;
          wind_speed_10m: number;
          uv_index: number;
        };
        daily: {
          time: string[];
          temperature_2m_max: number[];
          temperature_2m_min: number[];
          precipitation_sum: number[];
          weather_code: number[];
        };
      };

      const c = data.current;
      const isGoodForWatering = c.precipitation < 0.1 && c.temperature_2m > 40 && c.temperature_2m < 95 && c.wind_speed_10m < 20;

      const weather: WeatherData = {
        temperature: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        description: wmoDescription(c.weather_code),
        windSpeed: Math.round(c.wind_speed_10m),
        precipitation: c.precipitation,
        uvIndex: c.uv_index,
        isGoodForWatering,
        fetchedAt: new Date().toISOString(),
        forecast: data.daily.time.slice(1, 6).map((date, i) => ({
          date,
          maxTemp: Math.round(data.daily.temperature_2m_max[i + 1]),
          minTemp: Math.round(data.daily.temperature_2m_min[i + 1]),
          precipitation: data.daily.precipitation_sum[i + 1],
          description: wmoDescription(data.daily.weather_code[i + 1]),
        })),
      };

      dispatch({ type: 'SET_WEATHER', payload: weather });
    } catch {
      // weather unavailable — non-fatal
    }
  }, [state.profile]);

  useEffect(() => {
    if (state.profile && !state.weather) {
      refreshWeather();
    }
  }, [state.profile, state.weather, refreshWeather]);

  const value: AppContextValue = {
    state,
    setProfile: p => dispatch({ type: 'SET_PROFILE', payload: p }),
    addPlant: p => dispatch({ type: 'ADD_PLANT', payload: p }),
    updatePlant: p => dispatch({ type: 'UPDATE_PLANT', payload: p }),
    deletePlant: id => dispatch({ type: 'DELETE_PLANT', payload: id }),
    addSupply: s => dispatch({ type: 'ADD_SUPPLY', payload: s }),
    updateSupply: s => dispatch({ type: 'UPDATE_SUPPLY', payload: s }),
    deleteSupply: id => dispatch({ type: 'DELETE_SUPPLY', payload: id }),
    refreshWeather,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

function wmoDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 82) return 'Rain showers';
  if (code <= 86) return 'Snow showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}
