import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Edit, Trash2, Droplets, Zap, Plus,
  Leaf, FlaskConical, Clock, AlertTriangle, CheckCircle2, Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPlantById } from '../data/plants';
import {
  categoryEmoji, statusColor, formatStatus, categoryColor,
  formatCategory, phColor, locationIcon
} from '../utils/plantHelpers';
import { daysUntilWatering, daysUntilFeeding, daysGrown, nextWateringDate, nextFeedingDate } from '../utils/schedules';
import { Amendment, FertilizerEntry, WateringEntry, PlantStatus } from '../types';
import { format } from 'date-fns';

type Tab = 'overview' | 'soil' | 'history' | 'schedule' | 'info';

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, updatePlant, deletePlant } = useApp();
  const plant = state.plants.find(p => p.id === id);
  const [tab, setTab] = useState<Tab>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Log watering modal
  const [showWaterForm, setShowWaterForm] = useState(false);
  const [waterAmount, setWaterAmount] = useState('');
  const [waterNote, setWaterNote] = useState('');

  // Log feeding modal
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [feedProduct, setFeedProduct] = useState('');
  const [feedNpk, setFeedNpk] = useState('');
  const [feedAmount, setFeedAmount] = useState('');
  const [feedNote, setFeedNote] = useState('');

  // Log amendment modal
  const [showAmendForm, setShowAmendForm] = useState(false);
  const [amendProduct, setAmendProduct] = useState('');
  const [amendAmount, setAmendAmount] = useState('');
  const [amendPurpose, setAmendPurpose] = useState('');

  if (!plant) {
    return (
      <div className="py-4 text-center">
        <p className="text-garden-300">Plant not found.</p>
        <Link to="/garden" className="btn-secondary mt-4 inline-block">← Back to Garden</Link>
      </div>
    );
  }

  const dbPlant = plant.plantDbId ? getPlantById(plant.plantDbId) : undefined;
  const waterDays = daysUntilWatering(plant);
  const feedDays = daysUntilFeeding(plant);
  const grown = daysGrown(plant);

  function logWatering() {
    const entry: WateringEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      amount: waterAmount || '1',
      unit: 'gallons',
      method: 'hand',
      notes: waterNote || undefined,
    };
    updatePlant({ ...plant!, wateringHistory: [...plant!.wateringHistory, entry] });
    setShowWaterForm(false);
    setWaterAmount('');
    setWaterNote('');
  }

  function logFeeding() {
    const entry: FertilizerEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      product: feedProduct,
      npk: feedNpk,
      amount: feedAmount || '1',
      unit: 'tbsp',
      method: 'soil-drench',
      notes: feedNote || undefined,
    };
    updatePlant({ ...plant!, fertilizerHistory: [...plant!.fertilizerHistory, entry] });
    setShowFeedForm(false);
    setFeedProduct('');
    setFeedNpk('');
    setFeedAmount('');
    setFeedNote('');
  }

  function logAmendment() {
    const entry: Amendment = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      product: amendProduct,
      amount: amendAmount || '1',
      unit: 'cup',
      purpose: amendPurpose,
    };
    updatePlant({ ...plant!, amendments: [...plant!.amendments, entry] });
    setShowAmendForm(false);
    setAmendProduct('');
    setAmendAmount('');
    setAmendPurpose('');
  }

  function updateStatus(status: PlantStatus) {
    updatePlant({ ...plant!, status });
  }

  function handleDelete() {
    deletePlant(plant!.id);
    navigate('/garden');
  }

  const STATUS_OPTIONS: PlantStatus[] = ['seedling', 'vegetative', 'flowering', 'fruiting', 'dormant', 'ready-to-harvest', 'harvested'];

  const TABS: { value: Tab; label: string }[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'soil', label: 'Soil' },
    { value: 'history', label: 'History' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'info', label: 'Info' },
  ];

  return (
    <div className="py-4 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/garden')} className="text-garden-400 hover:text-white transition-colors mt-1">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{categoryEmoji(plant.category)}</span>
            <div>
              <h1 className="text-2xl font-bold text-white">{plant.name}</h1>
              {plant.variety && <p className="text-garden-300">{plant.variety}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`badge ${statusColor(plant.status)}`}>{formatStatus(plant.status)}</span>
            <span className={`badge ${categoryColor(plant.category)}`}>{formatCategory(plant.category)}</span>
            <span className="badge bg-garden-600 text-garden-200">
              {locationIcon(plant.locationType)} {plant.locationType}
            </span>
            {plant.tags.map(tag => (
              <span key={tag} className="badge bg-garden-700 text-garden-300">#{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/garden/edit/${plant.id}`} className="btn-secondary p-2">
            <Edit size={16} />
          </Link>
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger p-2">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-4">
          <p className="text-red-300 mb-3">Are you sure you want to delete {plant.name}?</p>
          <div className="flex gap-3">
            <button className="btn-danger flex-1" onClick={handleDelete}>Yes, Delete</button>
            <button className="btn-secondary flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Quick action buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setShowWaterForm(true)}
          className={`p-3 rounded-xl border-2 text-center transition-colors ${
            waterDays <= 0
              ? 'border-blue-500 bg-blue-900/30 text-blue-300'
              : 'border-garden-600 bg-garden-700 text-garden-300 hover:border-garden-500'
          }`}
        >
          <Droplets size={20} className="mx-auto mb-1" />
          <div className="text-sm font-medium">
            {waterDays <= 0 ? 'Water Now' : `Water in ${waterDays}d`}
          </div>
          <div className="text-xs text-garden-400">Next: {nextWateringDate(plant)}</div>
        </button>
        <button
          onClick={() => setShowFeedForm(true)}
          className={`p-3 rounded-xl border-2 text-center transition-colors ${
            feedDays <= 0
              ? 'border-amber-500 bg-amber-900/30 text-amber-300'
              : 'border-garden-600 bg-garden-700 text-garden-300 hover:border-garden-500'
          }`}
        >
          <Zap size={20} className="mx-auto mb-1" />
          <div className="text-sm font-medium">
            {feedDays <= 0 ? 'Feed Now' : `Feed in ${feedDays}d`}
          </div>
          <div className="text-xs text-garden-400">Next: {nextFeedingDate(plant)}</div>
        </button>
        <button
          onClick={() => setShowAmendForm(true)}
          className="p-3 rounded-xl border-2 border-garden-600 bg-garden-700 text-garden-300 hover:border-garden-500 text-center transition-colors"
        >
          <FlaskConical size={20} className="mx-auto mb-1" />
          <div className="text-sm font-medium">Amend</div>
          <div className="text-xs text-garden-400">Add amendment</div>
        </button>
      </div>

      {/* Watering modal */}
      {showWaterForm && (
        <div className="card p-4 border-blue-700 space-y-3">
          <h3 className="font-semibold text-blue-300 flex items-center gap-2">
            <Droplets size={16} /> Log Watering
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (gallons)</label>
              <input className="input" type="number" value={waterAmount} onChange={e => setWaterAmount(e.target.value)} placeholder="1" />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <input className="input" value={waterNote} onChange={e => setWaterNote(e.target.value)} placeholder="Looked healthy" />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={logWatering}>Log Watering</button>
            <button className="btn-secondary flex-1" onClick={() => setShowWaterForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Feeding modal */}
      {showFeedForm && (
        <div className="card p-4 border-amber-700 space-y-3">
          <h3 className="font-semibold text-amber-300 flex items-center gap-2">
            <Zap size={16} /> Log Fertilizer
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Product</label>
              <input className="input" value={feedProduct} onChange={e => setFeedProduct(e.target.value)} placeholder="Fox Farm Big Bloom" />
            </div>
            <div>
              <label className="label">NPK (e.g. 5-1-1)</label>
              <input className="input" value={feedNpk} onChange={e => setFeedNpk(e.target.value)} placeholder="5-1-1" />
            </div>
            <div>
              <label className="label">Amount (tbsp)</label>
              <input className="input" type="number" value={feedAmount} onChange={e => setFeedAmount(e.target.value)} placeholder="1" />
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" value={feedNote} onChange={e => setFeedNote(e.target.value)} placeholder="Half strength" />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={logFeeding} disabled={!feedProduct}>Log Feeding</button>
            <button className="btn-secondary flex-1" onClick={() => setShowFeedForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Amendment modal */}
      {showAmendForm && (
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold text-garden-200 flex items-center gap-2">
            <FlaskConical size={16} /> Log Amendment
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Product</label>
              <input className="input" value={amendProduct} onChange={e => setAmendProduct(e.target.value)} placeholder="Lime, sulfur, Epsom salt…" />
            </div>
            <div>
              <label className="label">Amount</label>
              <input className="input" value={amendAmount} onChange={e => setAmendAmount(e.target.value)} placeholder="1 cup" />
            </div>
            <div className="col-span-2">
              <label className="label">Purpose</label>
              <input className="input" value={amendPurpose} onChange={e => setAmendPurpose(e.target.value)} placeholder="Raise pH, add magnesium…" />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary flex-1" onClick={logAmendment} disabled={!amendProduct}>Log Amendment</button>
            <button className="btn-secondary flex-1" onClick={() => setShowAmendForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Status update */}
      <div className="card p-4">
        <label className="label mb-2 block">Update Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`badge cursor-pointer transition-opacity ${statusColor(s)} ${
                plant.status === s ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {formatStatus(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-garden-700">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.value
                ? 'border-garden-400 text-white'
                : 'border-transparent text-garden-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-sm p-3 text-center">
              <div className="text-2xl font-bold text-white">{grown}</div>
              <div className="text-xs text-garden-300">Days Growing</div>
            </div>
            <div className="card-sm p-3 text-center">
              <div className={`text-2xl font-bold ${phColor(plant.soilPh)}`}>{plant.soilPh.toFixed(1)}</div>
              <div className="text-xs text-garden-300">Soil pH</div>
            </div>
            <div className="card-sm p-3 text-center">
              <div className="text-2xl font-bold text-white">{plant.wateringHistory.length}</div>
              <div className="text-xs text-garden-300">Times Watered</div>
            </div>
            <div className="card-sm p-3 text-center">
              <div className="text-2xl font-bold text-white">{plant.fertilizerHistory.length}</div>
              <div className="text-xs text-garden-300">Times Fed</div>
            </div>
          </div>

          {plant.notes && (
            <div className="card p-4">
              <h3 className="font-medium text-garden-200 mb-2 flex items-center gap-2">
                <Info size={16} /> Notes
              </h3>
              <p className="text-garden-300 text-sm">{plant.notes}</p>
            </div>
          )}

          {dbPlant && (
            <div className="card p-4">
              <h3 className="font-medium text-garden-200 mb-3 flex items-center gap-2">
                <Leaf size={16} /> Care Guide
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-garden-300">{dbPlant.description}</p>
                <div className="flex flex-wrap gap-4 text-garden-400">
                  <span>☀️ {dbPlant.sunRequirement.replace(/-/g,' ')}</span>
                  <span>📐 {dbPlant.spacingInches}" spacing</span>
                  <span>📅 {dbPlant.daysToMaturity} days to harvest</span>
                  {dbPlant.chillHours && <span>❄️ {dbPlant.chillHours} chill hours needed</span>}
                </div>
                <p className="text-garden-300 border-t border-garden-700 pt-2 mt-2">{dbPlant.careNotes}</p>
              </div>
            </div>
          )}

          {dbPlant && dbPlant.commonIssues.length > 0 && (
            <div className="card p-4">
              <h3 className="font-medium text-garden-200 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-400" /> Watch For
              </h3>
              <div className="flex flex-wrap gap-2">
                {dbPlant.commonIssues.map(issue => (
                  <span key={issue} className="badge bg-yellow-900/40 text-yellow-300 border border-yellow-800">
                    {issue}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dbPlant && dbPlant.companionPlants.length > 0 && (
            <div className="card p-4">
              <h3 className="font-medium text-garden-200 mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" /> Good Companions
              </h3>
              <div className="flex flex-wrap gap-2">
                {dbPlant.companionPlants.map(cp => (
                  <span key={cp} className="badge bg-green-900/40 text-green-300 border border-green-800">
                    🌿 {cp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Soil */}
      {tab === 'soil' && (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-medium text-garden-200 mb-3">Soil Composition</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-garden-300">Sand</span>
                  <span className="text-white">{plant.soilMix.sandPercent ?? 0}%</span>
                </div>
                <div className="h-2 bg-garden-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: `${plant.soilMix.sandPercent ?? 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-garden-300">Silt</span>
                  <span className="text-white">{plant.soilMix.siltPercent ?? 0}%</span>
                </div>
                <div className="h-2 bg-garden-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-700 rounded-full" style={{ width: `${plant.soilMix.siltPercent ?? 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-garden-300">Clay</span>
                  <span className="text-white">{plant.soilMix.clayPercent ?? 0}%</span>
                </div>
                <div className="h-2 bg-garden-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-800 rounded-full" style={{ width: `${plant.soilMix.clayPercent ?? 0}%` }} />
                </div>
              </div>
              {(plant.soilMix.perlite ?? 0) > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-garden-300">Perlite</span>
                    <span className="text-white">{plant.soilMix.perlite}%</span>
                  </div>
                  <div className="h-2 bg-garden-700 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 rounded-full" style={{ width: `${plant.soilMix.perlite}%` }} />
                  </div>
                </div>
              )}
              {(plant.soilMix.compost ?? 0) > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-garden-300">Compost</span>
                    <span className="text-white">{plant.soilMix.compost}%</span>
                  </div>
                  <div className="h-2 bg-garden-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-800 rounded-full" style={{ width: `${plant.soilMix.compost}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="card-sm p-4 text-center">
              <div className={`text-3xl font-bold ${phColor(plant.soilPh)}`}>{plant.soilPh.toFixed(1)}</div>
              <div className="text-sm text-garden-300 mt-1">Soil pH</div>
              {dbPlant && (
                <div className={`text-xs mt-1 ${
                  plant.soilPh >= dbPlant.phMin && plant.soilPh <= dbPlant.phMax
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }`}>
                  {plant.soilPh >= dbPlant.phMin && plant.soilPh <= dbPlant.phMax
                    ? '✓ Optimal range'
                    : `⚠ Target: ${dbPlant.phMin}–${dbPlant.phMax}`
                  }
                </div>
              )}
            </div>
            <div className="card-sm p-4 text-center">
              <div className="text-3xl font-bold text-white capitalize">{plant.soilMix.type ?? 'Unknown'}</div>
              <div className="text-sm text-garden-300 mt-1">Soil Type</div>
            </div>
          </div>

          {plant.amendments.length > 0 && (
            <div className="card p-4">
              <h3 className="font-medium text-garden-200 mb-3 flex items-center gap-2">
                <FlaskConical size={16} /> Amendment History
              </h3>
              <div className="space-y-2">
                {[...plant.amendments].reverse().map(a => (
                  <div key={a.id} className="flex items-center gap-3 bg-garden-700 rounded-lg px-3 py-2 text-sm">
                    <div className="flex-1">
                      <div className="text-white font-medium">{a.product}</div>
                      <div className="text-garden-400 text-xs">{a.purpose}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-garden-300">{a.amount} {a.unit}</div>
                      <div className="text-garden-500 text-xs">{a.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {tab === 'history' && (
        <div className="space-y-4">
          {/* Watering history */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-garden-200 flex items-center gap-2">
                <Droplets size={16} className="text-blue-400" /> Watering Log
              </h3>
              <button onClick={() => setShowWaterForm(true)} className="text-xs text-garden-400 hover:text-white flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            {plant.wateringHistory.length === 0 ? (
              <p className="text-garden-400 text-sm text-center py-4">No watering logged yet</p>
            ) : (
              <div className="space-y-2">
                {[...plant.wateringHistory].reverse().slice(0, 10).map(w => (
                  <div key={w.id} className="flex items-center gap-3 bg-garden-700 rounded-lg px-3 py-2 text-sm">
                    <Droplets size={14} className="text-blue-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white">{w.amount} {w.unit}</div>
                      {w.notes && <div className="text-garden-400 text-xs">{w.notes}</div>}
                    </div>
                    <div className="text-garden-500 text-xs">{w.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fertilizer history */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-garden-200 flex items-center gap-2">
                <Zap size={16} className="text-amber-400" /> Fertilizer Log
              </h3>
              <button onClick={() => setShowFeedForm(true)} className="text-xs text-garden-400 hover:text-white flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            {plant.fertilizerHistory.length === 0 ? (
              <p className="text-garden-400 text-sm text-center py-4">No fertilizer logged yet</p>
            ) : (
              <div className="space-y-2">
                {[...plant.fertilizerHistory].reverse().slice(0, 10).map(f => (
                  <div key={f.id} className="flex items-center gap-3 bg-garden-700 rounded-lg px-3 py-2 text-sm">
                    <Zap size={14} className="text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-white">{f.product} {f.npk && <span className="text-garden-400 text-xs">({f.npk})</span>}</div>
                      <div className="text-garden-400 text-xs">{f.amount} {f.unit} · {f.method}</div>
                      {f.notes && <div className="text-garden-500 text-xs">{f.notes}</div>}
                    </div>
                    <div className="text-garden-500 text-xs">{f.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Schedule */}
      {tab === 'schedule' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <h3 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                <Droplets size={16} /> Watering
              </h3>
              <div className="text-2xl font-bold text-white mb-1">
                Every {plant.wateringSchedule.frequencyDays} days
              </div>
              <div className={`text-sm ${waterDays <= 0 ? 'text-blue-400 font-medium' : 'text-garden-300'}`}>
                {waterDays <= 0 ? '⚠ Overdue!' : `Next: ${nextWateringDate(plant)}`}
              </div>
              <div className="text-xs text-garden-400 mt-1">
                {plant.wateringHistory.length > 0
                  ? `Last: ${plant.wateringHistory.at(-1)?.date}`
                  : 'Never watered'}
              </div>
            </div>
            <div className="card p-4">
              <h3 className="font-medium text-amber-300 mb-3 flex items-center gap-2">
                <Zap size={16} /> Feeding
              </h3>
              <div className="text-2xl font-bold text-white mb-1">
                Every {plant.feedingSchedule.frequencyDays} days
              </div>
              <div className={`text-sm ${feedDays <= 0 ? 'text-amber-400 font-medium' : 'text-garden-300'}`}>
                {feedDays <= 0 ? '⚠ Overdue!' : `Next: ${nextFeedingDate(plant)}`}
              </div>
              <div className="text-xs text-garden-400 mt-1">
                {plant.fertilizerHistory.length > 0
                  ? `Last: ${plant.fertilizerHistory.at(-1)?.date}`
                  : 'Never fed'}
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-medium text-garden-200 mb-3 flex items-center gap-2">
              <Clock size={16} /> Timeline
            </h3>
            <div className="text-sm text-garden-300 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-garden-400 flex-shrink-0" />
                <span>Planted: {format(new Date(plant.plantedDate), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span>Growing for {grown} days</span>
              </div>
              {dbPlant && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span>Expected maturity: ~{dbPlant.daysToMaturity} days from planting</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Info */}
      {tab === 'info' && dbPlant && (
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-medium text-garden-200 mb-3">Plant Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-garden-400 text-xs">Scientific Name</div>
                <div className="text-white italic">{dbPlant.scientificName}</div>
              </div>
              <div>
                <div className="text-garden-400 text-xs">Hardiness Zones</div>
                <div className="text-white">{dbPlant.zones.slice(0,4).join(', ')}{dbPlant.zones.length > 4 ? '…' : ''}</div>
              </div>
              <div>
                <div className="text-garden-400 text-xs">Optimal pH</div>
                <div className="text-white">{dbPlant.phMin}–{dbPlant.phMax}</div>
              </div>
              <div>
                <div className="text-garden-400 text-xs">Sun Needs</div>
                <div className="text-white capitalize">{dbPlant.sunRequirement.replace(/-/g,' ')}</div>
              </div>
              <div>
                <div className="text-garden-400 text-xs">Temperature Range</div>
                <div className="text-white">{dbPlant.minTempF}°F – {dbPlant.maxTempF}°F</div>
              </div>
              <div>
                <div className="text-garden-400 text-xs">Days to Maturity</div>
                <div className="text-white">{dbPlant.daysToMaturity} days</div>
              </div>
              {dbPlant.chillHours && (
                <div>
                  <div className="text-garden-400 text-xs">Chill Hours Needed</div>
                  <div className="text-white">{dbPlant.chillHours} hours</div>
                </div>
              )}
              <div>
                <div className="text-garden-400 text-xs">Plant Spacing</div>
                <div className="text-white">{dbPlant.spacingInches} inches</div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-medium text-garden-200 mb-2">Nutrient Needs</h3>
            <div className="space-y-2">
              {Object.entries(dbPlant.nutrientNeeds).map(([nutrient, level]) => (
                <div key={nutrient} className="flex items-center gap-3">
                  <span className="text-garden-300 text-sm w-24 capitalize">{nutrient}</span>
                  <div className="flex gap-1">
                    {(['low','medium','high'] as const).map(l => (
                      <div
                        key={l}
                        className={`w-4 h-4 rounded-sm ${
                          level === 'low' && l === 'low' ? 'bg-green-500' :
                          level === 'medium' && (l === 'low' || l === 'medium') ? 'bg-yellow-500' :
                          level === 'high' ? 'bg-red-500' :
                          'bg-garden-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs capitalize ${
                    level === 'high' ? 'text-red-400' :
                    level === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>{level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'info' && !dbPlant && (
        <div className="card p-8 text-center">
          <Leaf size={32} className="mx-auto text-garden-400 mb-3" />
          <p className="text-garden-300">No database entry for this plant.</p>
          <p className="text-garden-400 text-sm mt-1">Edit the plant and select from the database for detailed info.</p>
        </div>
      )}
    </div>
  );
}
