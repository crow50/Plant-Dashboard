import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Leaf } from 'lucide-react';
import { PLANT_DATABASE, searchPlants } from '../data/plants';
import { PlantDbEntry } from '../types';

const CATEGORIES = ['all', 'vegetables', 'fruits', 'herbs', 'trees', 'flowers', 'other'] as const;

export default function Greenhouse() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('all');
  const [selected, setSelected] = useState<PlantDbEntry | null>(null);

  const results = (query.trim() ? searchPlants(query) : PLANT_DATABASE).filter(
    p => category === 'all' || p.category === category
  );

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🏡 Garden Center
          </h1>
          <p className="text-garden-300 text-sm">Browse plants and add them to your garden</p>
        </div>
        <Link
          to="/garden/add"
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Custom Plant
        </Link>
      </div>

      {/* Search & filter */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-garden-400" />
          <input
            className="input pl-9"
            placeholder="Search tomato, basil, rose…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === c
                  ? 'bg-garden-400 text-garden-900'
                  : 'bg-garden-700 text-garden-300 hover:bg-garden-600'
              }`}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Plant detail panel */}
      {selected && (
        <div className="card p-5 border border-garden-500 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">{selected.name}</h2>
              <p className="text-xs text-garden-400 italic">{selected.scientificName}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-garden-500 hover:text-white text-xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-garden-700 rounded-lg p-3">
              <div className="text-garden-400 text-xs mb-1">Watering</div>
              <div className="text-white">Every {selected.wateringFrequencyDays} days</div>
            </div>
            <div className="bg-garden-700 rounded-lg p-3">
              <div className="text-garden-400 text-xs mb-1">Feeding</div>
              <div className="text-white">Every {selected.feedingFrequencyDays} days</div>
            </div>
            <div className="bg-garden-700 rounded-lg p-3">
              <div className="text-garden-400 text-xs mb-1">Soil pH</div>
              <div className="text-white">{selected.phMin}–{selected.phMax}</div>
            </div>
            <div className="bg-garden-700 rounded-lg p-3">
              <div className="text-garden-400 text-xs mb-1">Sun</div>
              <div className="text-white capitalize">{selected.sunlight}</div>
            </div>
            <div className="bg-garden-700 rounded-lg p-3">
              <div className="text-garden-400 text-xs mb-1">Days to Harvest</div>
              <div className="text-white">
                {selected.daysToMaturity ? `${selected.daysToMaturity} days` : '—'}
              </div>
            </div>
            <div className="bg-garden-700 rounded-lg p-3">
              <div className="text-garden-400 text-xs mb-1">Category</div>
              <div className="text-white capitalize">{selected.category}</div>
            </div>
          </div>
          {selected.careNotes && (
            <div className="text-sm text-garden-300 bg-garden-700 rounded-lg p-3">
              <span className="text-garden-400 text-xs block mb-1">Care notes</span>
              {selected.careNotes}
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {(['in-ground', 'container', 'greenhouse', 'indoor'] as const).map(loc => (
              <Link
                key={loc}
                to="/garden/add"
                state={{ locationType: loc, plantDbId: selected.id }}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                + Add to {loc === 'in-ground' ? 'In Ground' : loc === 'greenhouse' ? 'Greenhouse' : loc.charAt(0).toUpperCase() + loc.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Results grid */}
      <div>
        <p className="text-xs text-garden-400 mb-3">{results.length} plant{results.length !== 1 ? 's' : ''} found</p>
        {results.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">🌿</div>
            <p className="text-garden-300 text-sm">No plants match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(prev => prev?.id === p.id ? null : p)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  selected?.id === p.id
                    ? 'border-garden-400 bg-garden-600'
                    : 'border-garden-600 bg-garden-700 hover:border-garden-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Leaf size={14} className="text-garden-400 flex-shrink-0" />
                  <span className="font-medium text-sm text-white truncate">{p.name}</span>
                </div>
                <div className="text-xs text-garden-400 italic truncate">{p.scientificName}</div>
                <div className="text-xs text-garden-500 mt-1 capitalize">{p.category}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
