import { Link } from 'react-router-dom';
import { Plus, Thermometer, Droplets, Zap, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categoryEmoji, statusColor, formatStatus } from '../utils/plantHelpers';
import { daysUntilWatering, daysUntilFeeding, nextWateringDate, nextFeedingDate } from '../utils/schedules';

export default function Greenhouse() {
  const { state } = useApp();
  const greenhousePlants = state.plants.filter(p => p.locationType === 'greenhouse');
  const weather = state.weather;

  const needWater = greenhousePlants.filter(p => daysUntilWatering(p) <= 0 && p.status !== 'harvested');
  const needFeed = greenhousePlants.filter(p => daysUntilFeeding(p) <= 0 && p.status !== 'harvested');

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🏡 Greenhouse
          </h1>
          <p className="text-garden-300 text-sm">{greenhousePlants.length} plants in controlled environment</p>
        </div>
        <Link
          to="/garden/add"
          state={{ locationType: 'greenhouse' }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Plant
        </Link>
      </div>

      {/* Conditions card */}
      {weather && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">Outside Conditions</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                <Thermometer size={18} />
              </div>
              <div className="text-2xl font-bold text-white">{weather.temperature}°F</div>
              <div className="text-xs text-garden-300">Outside Temp</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <Droplets size={18} />
              </div>
              <div className="text-2xl font-bold text-white">{weather.humidity}%</div>
              <div className="text-xs text-garden-300">Humidity</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                <Zap size={18} />
              </div>
              <div className="text-2xl font-bold text-white">{weather.uvIndex}</div>
              <div className="text-xs text-garden-300">UV Index</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-garden-700 rounded-lg p-3">
              <div className="text-garden-400 text-xs mb-1">Greenhouse Benefit</div>
              <div className="text-garden-200">
                {weather.temperature < 32
                  ? '✓ Protecting plants from frost'
                  : weather.temperature < 50
                    ? '✓ Extending growing season'
                    : weather.temperature > 95
                      ? '⚠ May need ventilation — hot outside'
                      : '✓ Controlled environment active'}
              </div>
            </div>
            <div className="bg-garden-700 rounded-lg p-3">
              <div className="text-garden-400 text-xs mb-1">Watering Today</div>
              <div className="text-garden-200">
                {weather.isGoodForWatering
                  ? '✓ Good day for watering — low humidity'
                  : '⚠ High humidity — check soil before watering'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {(needWater.length > 0 || needFeed.length > 0) && (
        <div className="card p-4">
          <h2 className="font-semibold text-white mb-3">Action Needed</h2>
          <div className="space-y-2">
            {needWater.map(p => (
              <Link
                key={p.id}
                to={`/garden/plant/${p.id}`}
                className="flex items-center gap-3 bg-blue-900/30 border border-blue-800 rounded-lg px-4 py-3 hover:bg-blue-900/50 transition-colors"
              >
                <span className="text-xl">{categoryEmoji(p.category)}</span>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{p.name}</div>
                  <div className="text-blue-300 text-xs">💧 Needs watering</div>
                </div>
                <ChevronRight size={14} className="text-garden-400" />
              </Link>
            ))}
            {needFeed.map(p => (
              <Link
                key={p.id}
                to={`/garden/plant/${p.id}`}
                className="flex items-center gap-3 bg-amber-900/30 border border-amber-800 rounded-lg px-4 py-3 hover:bg-amber-900/50 transition-colors"
              >
                <span className="text-xl">{categoryEmoji(p.category)}</span>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{p.name}</div>
                  <div className="text-amber-300 text-xs">⚡ Needs feeding</div>
                </div>
                <ChevronRight size={14} className="text-garden-400" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Plant grid */}
      {greenhousePlants.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-3">🌿</div>
          <h2 className="text-lg font-semibold text-white mb-2">No greenhouse plants yet</h2>
          <p className="text-garden-300 text-sm mb-4">
            Add plants and set their location to "Greenhouse" to see them here.
          </p>
          <Link to="/garden/add" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Add Greenhouse Plant
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="font-semibold text-white mb-3">Greenhouse Plants ({greenhousePlants.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {greenhousePlants.map(p => {
              const waterDays = daysUntilWatering(p);
              const feedDays = daysUntilFeeding(p);
              return (
                <Link
                  key={p.id}
                  to={`/garden/plant/${p.id}`}
                  className="card-sm p-4 hover:bg-garden-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{categoryEmoji(p.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{p.name}</div>
                      {p.variety && <div className="text-xs text-garden-400">{p.variety}</div>}
                      <div className={`badge ${statusColor(p.status)} mt-1 inline-block`}>
                        {formatStatus(p.status)}
                      </div>
                      <div className="flex gap-3 mt-2">
                        <div className={`flex items-center gap-1 text-xs ${waterDays <= 0 ? 'text-blue-400 font-medium' : 'text-garden-400'}`}>
                          <Droplets size={11} />
                          {waterDays <= 0 ? 'Now!' : nextWateringDate(p)}
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${feedDays <= 0 ? 'text-amber-400 font-medium' : 'text-garden-400'}`}>
                          <Zap size={11} />
                          {feedDays <= 0 ? 'Now!' : nextFeedingDate(p)}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-garden-400 flex-shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-3">Greenhouse Tips</h2>
        <div className="space-y-2 text-sm text-garden-300">
          <p>• Ventilate when outside temperature exceeds 70°F to prevent overheating.</p>
          <p>• Monitor humidity — high humidity in enclosed spaces promotes fungal disease.</p>
          <p>• Use shade cloth in summer to reduce UV intensity and heat buildup.</p>
          <p>• Water in the morning so foliage dries before cooler evenings.</p>
          <p>• Check for pests regularly — enclosed environments can harbor populations quickly.</p>
        </div>
      </div>
    </div>
  );
}
