import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronRight, Droplets, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GardenPlant, PlantCategory, LocationType } from '../types';
import {
  categoryEmoji, categoryColor, statusColor, formatStatus, locationIcon, formatCategory
} from '../utils/plantHelpers';
import { daysUntilWatering, daysUntilFeeding } from '../utils/schedules';

const CATEGORY_TABS: { value: PlantCategory | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All', emoji: '🌿' },
  { value: 'fruits', label: 'Fruits', emoji: '🍓' },
  { value: 'vegetables', label: 'Veggies', emoji: '🥦' },
  { value: 'herbs', label: 'Herbs', emoji: '🌿' },
  { value: 'trees', label: 'Trees', emoji: '🌳' },
  { value: 'flowers', label: 'Flowers', emoji: '🌸' },
  { value: 'other', label: 'Other', emoji: '🌱' },
];

const LOCATION_TABS: { value: LocationType | 'all'; label: string; emoji: string }[] = [
  { value: 'all', label: 'All Locations', emoji: '🏡' },
  { value: 'in-ground', label: 'In Ground', emoji: '🌍' },
  { value: 'container', label: 'Containers', emoji: '🪴' },
  { value: 'indoor', label: 'Indoor', emoji: '🪟' },
  { value: 'greenhouse', label: 'Greenhouse', emoji: '🏠' },
];

function PlantCard({ plant }: { plant: GardenPlant }) {
  const waterDays = daysUntilWatering(plant);
  const feedDays = daysUntilFeeding(plant);

  return (
    <Link
      to={`/garden/plant/${plant.id}`}
      className="card-sm p-4 hover:bg-garden-700 transition-colors block"
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{categoryEmoji(plant.category)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-white truncate">{plant.name}</div>
              {plant.variety && (
                <div className="text-xs text-garden-300">{plant.variety}</div>
              )}
            </div>
            <ChevronRight size={16} className="text-garden-400 flex-shrink-0 mt-0.5" />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`badge ${statusColor(plant.status)}`}>
              {formatStatus(plant.status)}
            </span>
            <span className={`badge ${categoryColor(plant.category)}`}>
              {formatCategory(plant.category)}
            </span>
            <span className="badge bg-garden-600 text-garden-200">
              {locationIcon(plant.locationType)} {plant.locationType}
            </span>
          </div>
          <div className="flex gap-3 mt-2">
            <div className={`flex items-center gap-1 text-xs ${waterDays <= 0 ? 'text-blue-400 font-medium' : 'text-garden-400'}`}>
              <Droplets size={11} />
              {waterDays <= 0 ? 'Water now' : `Water in ${waterDays}d`}
            </div>
            <div className={`flex items-center gap-1 text-xs ${feedDays <= 0 ? 'text-amber-400 font-medium' : 'text-garden-400'}`}>
              <Zap size={11} />
              {feedDays <= 0 ? 'Feed now' : `Feed in ${feedDays}d`}
            </div>
          </div>
          {plant.soilPh > 0 && (
            <div className="text-xs text-garden-400 mt-1">pH {plant.soilPh.toFixed(1)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}

function CategorySection({ title, emoji, plants }: { title: string; emoji: string; plants: GardenPlant[] }) {
  if (plants.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-garden-300 uppercase tracking-wide mb-2 flex items-center gap-2">
        <span>{emoji}</span> {title} <span className="text-garden-500 font-normal">({plants.length})</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {plants.map(p => <PlantCard key={p.id} plant={p} />)}
      </div>
    </div>
  );
}

export default function Garden() {
  const { state } = useApp();
  const { plants } = state;
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PlantCategory | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<LocationType | 'all'>('all');
  const [showHarvested, setShowHarvested] = useState(false);

  const filtered = plants.filter(p => {
    if (!showHarvested && p.status === 'harvested') return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (locationFilter !== 'all' && p.locationType !== locationFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.variety?.toLowerCase().includes(q);
    }
    return true;
  });

  const byCategory: Record<PlantCategory, GardenPlant[]> = {
    fruits: [],
    vegetables: [],
    herbs: [],
    trees: [],
    flowers: [],
    other: [],
  };
  filtered.forEach(p => byCategory[p.category].push(p));

  const byLocation: Record<LocationType, GardenPlant[]> = {
    'in-ground': [],
    container: [],
    greenhouse: [],
    indoor: [],
  };
  filtered.forEach(p => byLocation[p.locationType].push(p));

  const [viewMode, setViewMode] = useState<'category' | 'location' | 'list'>('category');

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Garden</h1>
          <p className="text-garden-300 text-sm">{plants.filter(p => p.status !== 'harvested').length} active plants</p>
        </div>
        <Link to="/garden/add" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Plant
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-garden-400" />
          <input
            className="input pl-9"
            placeholder="Search plants…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value as PlantCategory | 'all')}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === tab.value
                  ? 'bg-garden-500 text-white'
                  : 'bg-garden-700 text-garden-300 hover:bg-garden-600'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Location tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {LOCATION_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setLocationFilter(tab.value as LocationType | 'all')}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                locationFilter === tab.value
                  ? 'bg-garden-500 text-white'
                  : 'bg-garden-700 text-garden-300 hover:bg-garden-600'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['category', 'location', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded text-sm transition-colors capitalize ${
                  viewMode === mode ? 'bg-garden-600 text-white' : 'text-garden-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-garden-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showHarvested}
              onChange={e => setShowHarvested(e.target.checked)}
              className="accent-garden-400"
            />
            Show harvested
          </label>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🌿</div>
          <h2 className="text-lg font-semibold text-white mb-2">No plants found</h2>
          <p className="text-garden-300 text-sm mb-4">
            {plants.length === 0
              ? "Add your first plant to get started"
              : "Try adjusting your filters"}
          </p>
          <Link to="/garden/add" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Add Plant
          </Link>
        </div>
      )}

      {/* Category view */}
      {viewMode === 'category' && filtered.length > 0 && (
        <div className="space-y-6">
          {CATEGORY_TABS.filter(t => t.value !== 'all').map(tab => (
            <CategorySection
              key={tab.value}
              title={tab.label}
              emoji={tab.emoji}
              plants={byCategory[tab.value as PlantCategory]}
            />
          ))}
        </div>
      )}

      {/* Location view */}
      {viewMode === 'location' && filtered.length > 0 && (
        <div className="space-y-6">
          {LOCATION_TABS.filter(t => t.value !== 'all').map(tab => (
            <CategorySection
              key={tab.value}
              title={tab.label}
              emoji={tab.emoji}
              plants={byLocation[tab.value as LocationType]}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(p => <PlantCard key={p.id} plant={p} />)}
        </div>
      )}
    </div>
  );
}
