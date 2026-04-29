import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Search, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GardenPlant, PlantCategory, LocationType, PlantStatus, SoilType } from '../types';
import { PLANT_DATABASE, searchPlants } from '../data/plants';
import { getPlantById } from '../data/plants';
import { format } from 'date-fns';

const STEP_LABELS = ['Plant', 'Location', 'Soil', 'Schedule', 'Review'];

const CONTAINER_SIZES = ['1 gallon', '2 gallon', '3 gallon', '5 gallon', '7 gallon', '10 gallon', '15 gallon', '20 gallon', '25 gallon', '30 gallon', 'Half whiskey barrel', 'Window box', 'Raised bed', 'Custom'];
const SOIL_TYPES: SoilType[] = ['loamy', 'sandy', 'clay', 'silty', 'chalky', 'peaty'];
const STATUS_OPTIONS: PlantStatus[] = ['seedling', 'vegetative', 'flowering', 'fruiting', 'dormant', 'ready-to-harvest', 'harvested'];

interface FormData {
  plantDbId: string;
  name: string;
  variety: string;
  category: PlantCategory;
  locationType: LocationType;
  status: PlantStatus;
  plantedDate: string;
  containerSize: string;
  plotSize: string;
  soilType: SoilType;
  soilPh: number;
  sandPercent: number;
  siltPercent: number;
  clayPercent: number;
  organicMatter: number;
  perlite: number;
  compost: number;
  wateringFrequencyDays: number;
  feedingFrequencyDays: number;
  notes: string;
  tags: string;
}

function defaultForm(): FormData {
  return {
    plantDbId: '',
    name: '',
    variety: '',
    category: 'vegetables',
    locationType: 'in-ground',
    status: 'seedling',
    plantedDate: format(new Date(), 'yyyy-MM-dd'),
    containerSize: '5 gallon',
    plotSize: '4x4 ft',
    soilType: 'loamy',
    soilPh: 6.5,
    sandPercent: 40,
    siltPercent: 40,
    clayPercent: 20,
    organicMatter: 5,
    perlite: 0,
    compost: 0,
    wateringFrequencyDays: 3,
    feedingFrequencyDays: 14,
    notes: '',
    tags: '',
  };
}

export default function AddEditPlant() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { locationType?: LocationType; plantDbId?: string } | null;
  const { state, addPlant, updatePlant } = useApp();
  const isEdit = !!id;
  const existing = isEdit ? state.plants.find(p => p.id === id) : undefined;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(() => {
    const base = defaultForm();
    if (!isEdit && navState?.locationType) base.locationType = navState.locationType;
    return base;
  });
  const [dbSearch, setDbSearch] = useState('');
  const [searchResults, setSearchResults] = useState(PLANT_DATABASE.slice(0, 8));

  // Tracks whether the plant is in-ground or container-based (drives the two-stage location UI)
  type PlantMedium = 'in-ground' | 'container';
  function mediumFrom(lt: LocationType): PlantMedium {
    return lt === 'in-ground' ? 'in-ground' : 'container';
  }
  const [plantMedium, setPlantMedium] = useState<PlantMedium | null>(() => {
    if (isEdit && existing) return mediumFrom(existing.locationType);
    if (navState?.locationType) return mediumFrom(navState.locationType);
    return null;
  });

  useEffect(() => {
    if (!isEdit && navState?.plantDbId) {
      selectDbPlant(navState.plantDbId);
    }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (existing) {
      setPlantMedium(mediumFrom(existing.locationType));
      setForm({
        plantDbId: existing.plantDbId,
        name: existing.name,
        variety: existing.variety ?? '',
        category: existing.category,
        locationType: existing.locationType,
        status: existing.status,
        plantedDate: existing.plantedDate,
        containerSize: existing.containerSize ?? '5 gallon',
        plotSize: existing.plotSize ?? '4x4 ft',
        soilType: (existing.soilMix.type as SoilType) ?? 'loamy',
        soilPh: existing.soilPh,
        sandPercent: existing.soilMix.sandPercent ?? 40,
        siltPercent: existing.soilMix.siltPercent ?? 40,
        clayPercent: existing.soilMix.clayPercent ?? 20,
        organicMatter: existing.soilMix.organicMatter ?? 5,
        perlite: existing.soilMix.perlite ?? 0,
        compost: existing.soilMix.compost ?? 0,
        wateringFrequencyDays: existing.wateringSchedule.frequencyDays,
        feedingFrequencyDays: existing.feedingSchedule.frequencyDays,
        notes: existing.notes,
        tags: existing.tags.join(', '),
      });
    }
  }, [existing]);

  useEffect(() => {
    if (dbSearch.trim()) {
      setSearchResults(searchPlants(dbSearch).slice(0, 8));
    } else {
      setSearchResults(PLANT_DATABASE.slice(0, 8));
    }
  }, [dbSearch]);

  function selectDbPlant(plantId: string) {
    const p = getPlantById(plantId);
    if (!p) return;
    setForm(f => ({
      ...f,
      plantDbId: p.id,
      name: p.name,
      category: p.category,
      soilPh: (p.phMin + p.phMax) / 2,
      wateringFrequencyDays: p.wateringFrequencyDays,
      feedingFrequencyDays: p.feedingFrequencyDays,
    }));
  }

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit() {
    const plant: GardenPlant = {
      id: existing?.id ?? crypto.randomUUID(),
      plantDbId: form.plantDbId,
      name: form.name,
      variety: form.variety || undefined,
      category: form.category,
      locationType: form.locationType,
      status: form.status,
      plantedDate: form.plantedDate,
      containerSize: form.locationType !== 'in-ground' ? form.containerSize : undefined,
      plotSize: form.locationType === 'in-ground' ? form.plotSize : undefined,
      soilMix: {
        type: form.soilType,
        sandPercent: form.sandPercent,
        siltPercent: form.siltPercent,
        clayPercent: form.clayPercent,
        organicMatter: form.organicMatter,
        perlite: form.perlite,
        compost: form.compost,
      },
      soilPh: form.soilPh,
      nutrients: {},
      amendments: existing?.amendments ?? [],
      fertilizerHistory: existing?.fertilizerHistory ?? [],
      wateringHistory: existing?.wateringHistory ?? [],
      wateringSchedule: { frequencyDays: form.wateringFrequencyDays },
      feedingSchedule: { frequencyDays: form.feedingFrequencyDays },
      notes: form.notes,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (isEdit) {
      updatePlant(plant);
    } else {
      addPlant(plant);
    }
    navigate(`/garden/plant/${plant.id}`);
  }

  const dbPlant = form.plantDbId ? getPlantById(form.plantDbId) : undefined;

  return (
    <div className="py-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-garden-400 hover:text-white transition-colors" aria-label="Go back" title="Go back">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-white">
          {isEdit ? `Edit ${existing?.name}` : 'Add New Plant'}
        </h1>
      </div>

      {/* Step progress */}
      <div className="flex gap-1 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex-1 text-center">
            <div
              className={`h-1.5 rounded-full mb-1.5 transition-colors ${
                i + 1 < step ? 'bg-garden-400' : i + 1 === step ? 'bg-garden-300' : 'bg-garden-700'
              }`}
            />
            <span className={`text-xs ${i + 1 === step ? 'text-garden-200 font-medium' : 'text-garden-500'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="card p-6 space-y-5">
        {/* Step 1: Plant Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">What are you planting?</h2>

            {/* Database search */}
            <div>
              <label className="label">Search plant database</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-garden-400" />
                <input
                  className="input pl-9"
                  placeholder="Search tomato, basil, apple…"
                  value={dbSearch}
                  onChange={e => setDbSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-56 overflow-y-auto scrollbar-thin">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectDbPlant(p.id)}
                    className={`text-left p-2.5 rounded-lg border text-sm transition-colors ${
                      form.plantDbId === p.id
                        ? 'border-garden-400 bg-garden-600'
                        : 'border-garden-600 bg-garden-700 hover:border-garden-500'
                    }`}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-garden-400">{p.scientificName}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-garden-700 pt-4">
              <p className="text-sm text-garden-400 mb-3">Or enter a custom plant name:</p>
              <div>
                <label className="label">Plant Name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Cherokee Purple Tomato"
                />
              </div>
              <div className="mt-3">
                <label className="label">Variety (optional)</label>
                <input
                  className="input"
                  value={form.variety}
                  onChange={e => set('variety', e.target.value)}
                  placeholder="e.g. Cherokee Purple"
                />
              </div>
              <div className="mt-3">
                <label className="label">Category</label>
                <select className="select" value={form.category} onChange={e => set('category', e.target.value as PlantCategory)}>
                  {(['fruits','vegetables','herbs','trees','flowers','other'] as PlantCategory[]).map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <label className="label">Status</label>
                <select className="select" value={form.status} onChange={e => set('status', e.target.value as PlantStatus)}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3">
                <label className="label">Date Planted</label>
                <input
                  type="date"
                  className="input"
                  value={form.plantedDate}
                  onChange={e => set('plantedDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-white">Where is it planted?</h2>

            {/* Stage A: In Ground or Container */}
            <div>
              <label className="label">Planting Method</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'in-ground' as const, emoji: '🌍', label: 'In Ground', desc: 'Directly in the earth or a raised bed' },
                  { value: 'container' as const, emoji: '🪴', label: 'Container / Pot', desc: 'Pot, bucket, grow bag, or box' },
                ]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setPlantMedium(opt.value);
                      if (opt.value === 'in-ground') {
                        set('locationType', 'in-ground');
                      } else {
                        // default container environment to outdoors
                        set('locationType', 'container');
                      }
                    }}
                    className={`text-left p-4 rounded-lg border transition-colors ${
                      plantMedium === opt.value
                        ? 'border-garden-400 bg-garden-600'
                        : 'border-garden-600 bg-garden-700 hover:border-garden-500'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{opt.emoji}</div>
                    <div className="font-medium text-sm text-white">{opt.label}</div>
                    <div className="text-xs text-garden-300 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stage B: Environment — only for container plants */}
            {plantMedium === 'container' && (
              <div>
                <label className="label">Where will it live?</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'container' as const, emoji: '🌤', label: 'Outdoors', desc: 'Outside in open air' },
                    { value: 'indoor' as const, emoji: '🏠', label: 'Indoors', desc: 'Inside the house' },
                    { value: 'greenhouse' as const, emoji: '🏡', label: 'Greenhouse', desc: 'Temp-controlled space' },
                  ] as { value: LocationType; emoji: string; label: string; desc: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => set('locationType', opt.value)}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        form.locationType === opt.value
                          ? 'border-garden-400 bg-garden-600'
                          : 'border-garden-600 bg-garden-700 hover:border-garden-500'
                      }`}
                    >
                      <div className="text-xl mb-1">{opt.emoji}</div>
                      <div className="font-medium text-sm text-white">{opt.label}</div>
                      <div className="text-xs text-garden-300">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* In-ground: outdoors is assumed */}
            {plantMedium === 'in-ground' && (
              <div className="bg-garden-700 rounded-lg p-3 text-sm text-garden-300 flex items-center gap-2">
                <span>🌤</span> Outdoors — assumed for in-ground plantings
              </div>
            )}

            {/* Follow-up: plot size for in-ground */}
            {form.locationType === 'in-ground' && (
              <div>
                <label className="label">Plot / Bed Size</label>
                <input
                  className="input"
                  value={form.plotSize}
                  onChange={e => set('plotSize', e.target.value)}
                  placeholder="e.g. 4x8 ft raised bed"
                />
              </div>
            )}

            {/* Follow-up: container size for all container-based locations */}
            {plantMedium === 'container' && (
              <div>
                <label className="label">Container Size</label>
                <select className="select" value={form.containerSize} onChange={e => set('containerSize', e.target.value)}>
                  {CONTAINER_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="text-xs text-garden-400 mt-1">
                  Container size affects watering frequency and nutrient needs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Soil */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Soil Profile</h2>
            {dbPlant && (
              <div className="bg-garden-700 rounded-lg p-3 text-sm">
                <span className="text-garden-300 font-medium">{dbPlant.name}</span> prefers pH {dbPlant.phMin}–{dbPlant.phMax}
              </div>
            )}

            <div>
              <label className="label">Soil Type</label>
              <select className="select" value={form.soilType} onChange={e => set('soilType', e.target.value as SoilType)}>
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Soil pH: {form.soilPh.toFixed(1)}</label>
              <input
                type="range" min="4" max="9" step="0.1"
                value={form.soilPh}
                onChange={e => set('soilPh', parseFloat(e.target.value))}
                className="w-full accent-garden-400"
              />
              <div className="flex justify-between text-xs text-garden-400 mt-1">
                <span>4.0 Acidic</span>
                <span>7.0 Neutral</span>
                <span>9.0 Alkaline</span>
              </div>
              {dbPlant && (form.soilPh < dbPlant.phMin || form.soilPh > dbPlant.phMax) && (
                <p className="text-xs text-yellow-400 mt-1">
                  ⚠️ pH is outside optimal range ({dbPlant.phMin}–{dbPlant.phMax}) for {dbPlant.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Sand %</label>
                <input type="number" className="input" min="0" max="100"
                  value={form.sandPercent} onChange={e => set('sandPercent', +e.target.value)} />
              </div>
              <div>
                <label className="label">Silt %</label>
                <input type="number" className="input" min="0" max="100"
                  value={form.siltPercent} onChange={e => set('siltPercent', +e.target.value)} />
              </div>
              <div>
                <label className="label">Clay %</label>
                <input type="number" className="input" min="0" max="100"
                  value={form.clayPercent} onChange={e => set('clayPercent', +e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Organic Matter %</label>
                <input type="number" className="input" min="0" max="100"
                  value={form.organicMatter} onChange={e => set('organicMatter', +e.target.value)} />
              </div>
              <div>
                <label className="label">Perlite %</label>
                <input type="number" className="input" min="0" max="100"
                  value={form.perlite} onChange={e => set('perlite', +e.target.value)} />
              </div>
              <div>
                <label className="label">Compost %</label>
                <input type="number" className="input" min="0" max="100"
                  value={form.compost} onChange={e => set('compost', +e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Schedule */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Care Schedule</h2>
            {dbPlant && (
              <div className="bg-garden-700 rounded-lg p-3 text-sm space-y-1">
                <p className="text-garden-300">
                  Recommended watering for {dbPlant.name}: every <strong className="text-white">{dbPlant.wateringFrequencyDays} days</strong>
                </p>
                <p className="text-garden-300">
                  Recommended feeding: every <strong className="text-white">{dbPlant.feedingFrequencyDays} days</strong>
                </p>
              </div>
            )}

            <div>
              <label className="label">Watering Frequency</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="1" max="30" step="1"
                  value={form.wateringFrequencyDays}
                  onChange={e => set('wateringFrequencyDays', +e.target.value)}
                  className="flex-1 accent-blue-400"
                />
                <span className="text-white font-medium w-20 text-right">
                  Every {form.wateringFrequencyDays}d
                </span>
              </div>
              <div className="flex justify-between text-xs text-garden-400">
                <span>Daily</span>
                <span>Every 30 days</span>
              </div>
            </div>

            <div>
              <label className="label">Feeding Frequency</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="7" max="90" step="1"
                  value={form.feedingFrequencyDays}
                  onChange={e => set('feedingFrequencyDays', +e.target.value)}
                  className="flex-1 accent-amber-400"
                />
                <span className="text-white font-medium w-20 text-right">
                  Every {form.feedingFrequencyDays}d
                </span>
              </div>
              <div className="flex justify-between text-xs text-garden-400">
                <span>Weekly</span>
                <span>Every 90 days</span>
              </div>
            </div>

            <div>
              <label className="label">Tags (comma separated)</label>
              <input
                className="input"
                value={form.tags}
                onChange={e => set('tags', e.target.value)}
                placeholder="organic, heirloom, shade-tolerant"
              />
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea
                className="input resize-none h-24"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Any special care notes, observations, or reminders…"
              />
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Review & Confirm</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-garden-700 rounded-lg p-3">
                <div className="text-garden-400 text-xs mb-1">Plant</div>
                <div className="text-white font-medium">{form.name}</div>
                {form.variety && <div className="text-garden-300">{form.variety}</div>}
              </div>
              <div className="bg-garden-700 rounded-lg p-3">
                <div className="text-garden-400 text-xs mb-1">Category</div>
                <div className="text-white font-medium capitalize">{form.category}</div>
              </div>
              <div className="bg-garden-700 rounded-lg p-3">
                <div className="text-garden-400 text-xs mb-1">Location</div>
                <div className="text-white font-medium capitalize">{form.locationType}</div>
                {form.locationType === 'container' && (
                  <div className="text-garden-300">{form.containerSize}</div>
                )}
                {form.locationType === 'in-ground' && (
                  <div className="text-garden-300">{form.plotSize}</div>
                )}
              </div>
              <div className="bg-garden-700 rounded-lg p-3">
                <div className="text-garden-400 text-xs mb-1">Planted</div>
                <div className="text-white font-medium">{form.plantedDate}</div>
                <div className="text-garden-300 capitalize">{form.status.replace(/-/g,' ')}</div>
              </div>
              <div className="bg-garden-700 rounded-lg p-3">
                <div className="text-garden-400 text-xs mb-1">Soil</div>
                <div className="text-white font-medium capitalize">{form.soilType} · pH {form.soilPh.toFixed(1)}</div>
                <div className="text-garden-300">{form.sandPercent}% sand · {form.clayPercent}% clay</div>
              </div>
              <div className="bg-garden-700 rounded-lg p-3">
                <div className="text-garden-400 text-xs mb-1">Schedule</div>
                <div className="text-white font-medium">💧 Every {form.wateringFrequencyDays}d</div>
                <div className="text-garden-300">⚡ Every {form.feedingFrequencyDays}d</div>
              </div>
            </div>
            {form.notes && (
              <div className="bg-garden-700 rounded-lg p-3 text-sm">
                <div className="text-garden-400 text-xs mb-1">Notes</div>
                <div className="text-garden-200">{form.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2 border-t border-garden-700">
          {step > 1 && (
            <button className="btn-secondary flex-1" onClick={() => setStep(s => s - 1)}>
              ← Back
            </button>
          )}
          {step < 5 ? (
            <button
              className="btn-primary flex-1"
              onClick={() => setStep(s => s + 1)}
              disabled={!form.name}
            >
              Continue →
            </button>
          ) : (
            <button
              className="btn-primary flex-1"
              onClick={handleSubmit}
              disabled={!form.name}
            >
              {isEdit ? 'Save Changes' : 'Add to Garden 🌱'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
