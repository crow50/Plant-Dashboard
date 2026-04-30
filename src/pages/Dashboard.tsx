import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets, Zap, Wind, Eye, AlertTriangle,
  Clock, Sprout, Package, ChevronRight, RefreshCw,
  Sun, Cloud, CloudRain, Snowflake, Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GardenPlant } from '../types';
import {
  daysUntilWatering, daysUntilFeeding, nextWateringDate, nextFeedingDate
} from '../utils/schedules';
import { categoryEmoji, statusColor, formatStatus, locationIcon } from '../utils/plantHelpers';
import { format } from 'date-fns';

function WeatherIcon({ description, size = 20 }: { description: string; size?: number }) {
  const d = description.toLowerCase();
  if (d.includes('clear')) return <Sun size={size} className="text-yellow-400" />;
  if (d.includes('rain') || d.includes('drizzle')) return <CloudRain size={size} className="text-blue-400" />;
  if (d.includes('snow')) return <Snowflake size={size} className="text-blue-200" />;
  if (d.includes('thunder')) return <Zap size={size} className="text-yellow-400" />;
  return <Cloud size={size} className="text-gray-400" />;
}

export default function Dashboard() {
  const { state, refreshWeather } = useApp();
  const { plants, weather, profile, shedSupplies } = state;

  useEffect(() => {
    if (!weather && profile) refreshWeather();
  }, [weather, profile, refreshWeather]);

  const activePlants: GardenPlant[] = [];
  const needWater: GardenPlant[] = [];
  const needFeed: GardenPlant[] = [];
  const upcomingWater: GardenPlant[] = [];
  const upcomingFeed: GardenPlant[] = [];
  const readyToHarvest: GardenPlant[] = [];

  const now = new Date();
  for (const p of plants) {
    if (p.status !== 'harvested') {
      activePlants.push(p);

      const waterDays = daysUntilWatering(p, now);
      if (waterDays <= 0) needWater.push(p);
      else if (waterDays <= 3) upcomingWater.push(p);

      const feedDays = daysUntilFeeding(p, now);
      if (feedDays <= 0) needFeed.push(p);
      else if (feedDays <= 7) upcomingFeed.push(p);
    }

    if (p.status === 'ready-to-harvest') {
      readyToHarvest.push(p);
    }
  }

  const lowStockSupplies = shedSupplies.filter(s =>
    s.lowStockThreshold !== undefined && s.quantity <= s.lowStockThreshold
  );

  const alerts = [
    ...needWater.map(p => ({
      type: 'water' as const,
      plant: p,
      msg: `${p.name} needs watering now`,
    })),
    ...needFeed.map(p => ({
      type: 'feed' as const,
      plant: p,
      msg: `${p.name} needs feeding now`,
    })),
    ...readyToHarvest.map(p => ({
      type: 'harvest' as const,
      plant: p,
      msg: `${p.name} is ready to harvest!`,
    })),
  ];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{profile?.name}</h1>
          <p className="text-garden-300 text-sm">
            Zone {profile?.zone} · {profile?.state} · {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <button
          onClick={() => refreshWeather()}
          className="text-garden-400 hover:text-white transition-colors"
          title="Refresh weather"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Weather + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weather Card */}
        <div className="card p-5 md:col-span-2">
          {weather ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <WeatherIcon description={weather.description} size={40} />
                  <div>
                    <div className="text-4xl font-bold text-white">{weather.temperature}°F</div>
                    <div className="text-garden-300 text-sm">{weather.description}</div>
                    <div className="text-garden-400 text-xs">Feels like {weather.feelsLike}°F</div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1 text-sm text-garden-200 justify-end">
                    <Droplets size={14} className="text-blue-400" />
                    {weather.humidity}% humidity
                  </div>
                  <div className="flex items-center gap-1 text-sm text-garden-200 justify-end">
                    <Wind size={14} />
                    {weather.windSpeed} mph
                  </div>
                  <div className="flex items-center gap-1 text-sm text-garden-200 justify-end">
                    <Eye size={14} className="text-yellow-400" />
                    UV {weather.uvIndex}
                  </div>
                </div>
              </div>

              <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 mb-4 ${
                weather.isGoodForWatering
                  ? 'bg-green-900/40 text-green-300 border border-green-700'
                  : 'bg-blue-900/40 text-blue-300 border border-blue-700'
              }`}>
                <Droplets size={14} />
                {weather.isGoodForWatering
                  ? 'Good day to water outdoor plants in the evening'
                  : weather.precipitation > 0.1
                    ? 'Skip watering — rain expected today'
                    : weather.temperature > 95
                      ? 'Too hot — water early morning to prevent evaporation'
                      : 'Consider indoor watering only today'
                }
              </div>

              {/* 5-day forecast */}
              <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
                {weather.forecast.map(day => (
                  <div key={day.date} className="flex-shrink-0 text-center bg-garden-700 rounded-lg px-3 py-2 min-w-16">
                    <div className="text-xs text-garden-300 mb-1">
                      {format(new Date(day.date + 'T12:00:00'), 'EEE')}
                    </div>
                    <WeatherIcon description={day.description} size={16} />
                    <div className="text-sm font-medium text-white mt-1">{day.maxTemp}°</div>
                    <div className="text-xs text-garden-400">{day.minTemp}°</div>
                    {day.precipitation > 0.1 && (
                      <div className="text-xs text-blue-400 mt-0.5">{day.precipitation.toFixed(1)}"</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-garden-400">
              <div className="text-center">
                <Cloud size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Loading weather data…</p>
                {!profile?.zipCode && (
                  <Link to="/settings" className="text-garden-400 underline text-xs mt-1 block">
                    Add a ZIP code in Settings
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <div className="card p-4 flex items-center gap-3">
            <div className="bg-garden-600 rounded-lg p-2">
              <Sprout size={20} className="text-garden-200" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{activePlants.length}</div>
              <div className="text-xs text-garden-300">Active Plants</div>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="bg-blue-800 rounded-lg p-2">
              <Droplets size={20} className="text-blue-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{needWater.length}</div>
              <div className="text-xs text-garden-300">Need Watering</div>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="bg-amber-800 rounded-lg p-2">
              <Zap size={20} className="text-amber-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{needFeed.length}</div>
              <div className="text-xs text-garden-300">Need Feeding</div>
            </div>
          </div>
          <div className="card p-4 flex items-center gap-3">
            <div className="bg-emerald-800 rounded-lg p-2">
              <Package size={20} className="text-emerald-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{shedSupplies.length}</div>
              <div className="text-xs text-garden-300">Shed Supplies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-yellow-400" />
            Action Required
          </h2>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <Link
                key={i}
                to={`/garden/plant/${alert.plant.id}`}
                className="flex items-center gap-3 bg-garden-700 hover:bg-garden-600 rounded-lg px-4 py-3 transition-colors"
              >
                <span className="text-xl">{categoryEmoji(alert.plant.category)}</span>
                <div className="flex-1">
                  <span className="text-sm text-white">{alert.msg}</span>
                  <div className="text-xs text-garden-300">
                    {locationIcon(alert.plant.locationType)} {alert.plant.locationType}
                  </div>
                </div>
                <div className={`badge ${
                  alert.type === 'water' ? 'bg-blue-800 text-blue-200' :
                  alert.type === 'feed' ? 'bg-amber-800 text-amber-200' :
                  'bg-emerald-700 text-emerald-100'
                }`}>
                  {alert.type === 'water' ? '💧 Water' : alert.type === 'feed' ? '⚡ Feed' : '✂️ Harvest'}
                </div>
                <ChevronRight size={14} className="text-garden-400" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming schedule */}
      {(upcomingWater.length > 0 || upcomingFeed.length > 0) && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Clock size={18} className="text-garden-300" />
            Upcoming Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingWater.map(p => (
              <Link
                key={p.id}
                to={`/garden/plant/${p.id}`}
                className="flex items-center gap-3 bg-garden-700 hover:bg-garden-600 rounded-lg px-3 py-2.5 transition-colors"
              >
                <span className="text-lg">{categoryEmoji(p.category)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{p.name}</div>
                  <div className="text-xs text-garden-300">Water by {nextWateringDate(p)}</div>
                </div>
                <div className="text-xs text-blue-300 whitespace-nowrap">
                  💧 {daysUntilWatering(p)}d
                </div>
              </Link>
            ))}
            {upcomingFeed.map(p => (
              <Link
                key={p.id}
                to={`/garden/plant/${p.id}`}
                className="flex items-center gap-3 bg-garden-700 hover:bg-garden-600 rounded-lg px-3 py-2.5 transition-colors"
              >
                <span className="text-lg">{categoryEmoji(p.category)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{p.name}</div>
                  <div className="text-xs text-garden-300">Feed by {nextFeedingDate(p)}</div>
                </div>
                <div className="text-xs text-amber-300 whitespace-nowrap">
                  ⚡ {daysUntilFeeding(p)}d
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Low stock warnings */}
      {lowStockSupplies.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Package size={18} className="text-orange-400" />
            Low Shed Inventory
          </h2>
          <div className="space-y-2">
            {lowStockSupplies.map(s => (
              <Link
                key={s.id}
                to="/shed"
                className="flex items-center justify-between bg-garden-700 hover:bg-garden-600 rounded-lg px-4 py-3 transition-colors"
              >
                <span className="text-sm text-white">{s.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-orange-300">{s.quantity} {s.unit} left</span>
                  <ChevronRight size={14} className="text-garden-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Plant overview grid */}
      {activePlants.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Sprout size={18} className="text-garden-400" />
              All Plants
            </h2>
            <Link to="/garden" className="text-sm text-garden-400 hover:text-white flex items-center gap-1">
              View Garden <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {activePlants.map(p => {
              const waterDays = daysUntilWatering(p);
              const feedDays = daysUntilFeeding(p);
              return (
                <Link
                  key={p.id}
                  to={`/garden/plant/${p.id}`}
                  className="bg-garden-700 hover:bg-garden-600 rounded-lg p-3 transition-colors text-center"
                >
                  <div className="text-3xl mb-2">{categoryEmoji(p.category)}</div>
                  <div className="text-sm font-medium text-white truncate">{p.name}</div>
                  {p.variety && (
                    <div className="text-xs text-garden-400 truncate">{p.variety}</div>
                  )}
                  <div className={`badge mt-2 text-xs ${statusColor(p.status)}`}>
                    {formatStatus(p.status)}
                  </div>
                  <div className="flex justify-center gap-2 mt-2">
                    {waterDays <= 0 && <span title="Needs water" className="text-blue-400">💧</span>}
                    {feedDays <= 0 && <span title="Needs feeding" className="text-amber-400">⚡</span>}
                    {p.status === 'ready-to-harvest' && <span title="Ready to harvest">✂️</span>}
                  </div>
                </Link>
              );
            })}
            <Link
              to="/garden/add"
              className="bg-garden-700 hover:bg-garden-600 rounded-lg p-3 transition-colors text-center border-2 border-dashed border-garden-600 flex flex-col items-center justify-center gap-2"
            >
              <div className="text-2xl">+</div>
              <div className="text-xs text-garden-300">Add Plant</div>
            </Link>
          </div>
        </div>
      )}

      {/* Empty state */}
      {activePlants.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-xl font-semibold text-white mb-2">Your garden is empty</h2>
          <p className="text-garden-300 mb-6">Add your first plant to start tracking your garden.</p>
          <Link to="/garden/add" className="btn-primary inline-flex items-center gap-2">
            <Sprout size={16} />
            Add First Plant
          </Link>
        </div>
      )}

      {/* Temperature warnings */}
      {weather && (
        <>
          {weather.temperature > 100 && (
            <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 flex items-center gap-3">
              <Flame size={20} className="text-red-400 flex-shrink-0" />
              <div>
                <div className="font-medium text-red-300">Extreme Heat Warning</div>
                <div className="text-sm text-red-400">
                  Plants may be stressed. Water early morning, provide shade if possible, and check soil moisture frequently.
                </div>
              </div>
            </div>
          )}
          {weather.temperature < 32 && (
            <div className="bg-blue-900/40 border border-blue-700 rounded-xl p-4 flex items-center gap-3">
              <Snowflake size={20} className="text-blue-400 flex-shrink-0" />
              <div>
                <div className="font-medium text-blue-300">Frost Warning</div>
                <div className="text-sm text-blue-400">
                  Protect sensitive plants. Consider covering outdoor plants and moving containers inside.
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Garden Center & Shed quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/shed" className="card p-5 hover:bg-garden-700 transition-colors group">
          <div className="text-4xl mb-2">🏚️</div>
          <div className="font-semibold text-white">Shed</div>
          <div className="text-sm text-garden-300">{shedSupplies.length} supplies</div>
          {lowStockSupplies.length > 0 && (
            <div className="mt-2 text-xs text-orange-400 flex items-center gap-1">
              <AlertTriangle size={12} />
              {lowStockSupplies.length} running low
            </div>
          )}
        </Link>
        <Link to="/garden-center" className="card p-5 hover:bg-garden-700 transition-colors group">
          <div className="text-4xl mb-2">🏡</div>
          <div className="font-semibold text-white">Garden Center</div>
          <div className="text-sm text-garden-300">Browse plant catalog</div>
          <div className="mt-2">
            <span className="text-xs text-garden-400">Search &amp; add to your garden</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
