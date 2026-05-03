import { useState, useEffect, useRef } from 'react';
import { Save, RefreshCw, MapPin, Leaf, Database, Trash2, AlertTriangle, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GardenProfile, SoilType } from '../types';
import { US_STATES } from '../data/plants';
import { inferZoneFromState, lookupZoneFromZip } from '../utils/zoneUtils';
import { format } from 'date-fns';
import { validateAppState } from '../utils/validation';

const SOIL_TYPES: { value: SoilType; label: string }[] = [
  { value: 'loamy', label: 'Loamy' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'silty', label: 'Silty' },
  { value: 'clay', label: 'Clay' },
  { value: 'chalky', label: 'Chalky' },
  { value: 'peaty', label: 'Peaty' },
];

export default function Settings() {
  const { state, setProfile, refreshWeather, loadState } = useApp();
  const { profile, plants, shedSupplies } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: profile?.name ?? 'My Garden',
    zone: profile?.zone ?? inferZoneFromState(profile?.state ?? 'Virginia'),
    state: profile?.state ?? 'Virginia',
    zipCode: profile?.zipCode ?? '',
    soilType: profile?.soilType ?? 'loamy' as SoilType,
    basePh: profile?.basePh ?? 6.5,
  });
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [zoneSource, setZoneSource] = useState<'state' | 'zip' | 'loading'>('zip');

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        zone: profile.zone,
        state: profile.state,
        zipCode: profile.zipCode ?? '',
        soilType: profile.soilType,
        basePh: profile.basePh,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (form.zipCode.length === 5) {
      setZoneSource('loading');
      lookupZoneFromZip(form.zipCode).then(zone => {
        if (zone) {
          setForm(f => ({ ...f, zone }));
          setZoneSource('zip');
        } else {
          setForm(f => ({ ...f, zone: inferZoneFromState(f.state) }));
          setZoneSource('state');
        }
      });
    } else if (form.zipCode.length === 0) {
      setForm(f => ({ ...f, zone: inferZoneFromState(f.state) }));
      setZoneSource('state');
    }
  }, [form.zipCode, form.state]);

  function handleSave() {
    if (!profile) return;
    const zipChanged = form.zipCode !== profile.zipCode;
    const updated: GardenProfile = {
      ...profile,
      name: form.name,
      zone: form.zone,
      state: form.state,
      zipCode: form.zipCode,
      soilType: form.soilType,
      basePh: form.basePh,
      updatedAt: new Date().toISOString(),
      lat: zipChanged ? undefined : profile.lat,
      lon: zipChanged ? undefined : profile.lon,
    };
    setProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (zipChanged) refreshWeather();
  }

  function handleReset() {
    localStorage.removeItem('plant-dashboard-v1');
    window.location.reload();
  }

  function exportData() {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plant-dashboard-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validated = validateAppState(json);
        loadState(validated);
        alert('Data imported successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be imported again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-6 py-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Garden Profile */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Leaf size={18} className="text-garden-400" /> Garden Profile
        </h2>
        <div>
          <label className="label">Garden Name</label>
          <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">State</label>
          <select className="select" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">ZIP Code</label>
          <input
            className="input"
            value={form.zipCode}
            onChange={e => setForm({ ...form, zipCode: e.target.value })}
            placeholder="e.g. 22301 — used for weather and zone"
            maxLength={5}
          />
        </div>
        <div className="flex items-center gap-2 bg-garden-700 rounded-lg px-4 py-3">
          <span className="text-garden-400 text-xs">Hardiness Zone</span>
          <span className="text-white font-semibold ml-auto">
            {zoneSource === 'loading' ? '…' : form.zone}
          </span>
          <span className="text-garden-400 text-xs">
            {zoneSource === 'zip' ? '(from ZIP)' : zoneSource === 'loading' ? '' : '(from state)'}
          </span>
        </div>
      </div>

      {/* Soil Profile */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <MapPin size={18} className="text-garden-400" /> Default Soil Profile
        </h2>
        <div>
          <label className="label">Primary Soil Type</label>
          <select className="select" value={form.soilType} onChange={e => setForm({ ...form, soilType: e.target.value as SoilType })}>
            {SOIL_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Base pH: {form.basePh.toFixed(1)}</label>
          <input
            type="range" min="4" max="9" step="0.1"
            value={form.basePh}
            onChange={e => setForm({ ...form, basePh: parseFloat(e.target.value) })}
            className="w-full accent-garden-400"
          />
          <div className="flex justify-between text-xs text-garden-400 mt-1">
            <span>4.0 Very Acidic</span>
            <span>7.0 Neutral</span>
            <span>9.0 Very Alkaline</span>
          </div>
        </div>
      </div>

      {/* Save button */}
      <button onClick={handleSave} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${saved ? 'bg-green-700 text-white' : 'btn-primary'}`}>
        {saved ? <><Save size={18} /> Saved!</> : <><Save size={18} /> Save Settings</>}
      </button>

      {/* Weather */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <RefreshCw size={18} className="text-garden-400" /> Weather
        </h2>
        {state.weather ? (
          <p className="text-garden-300 text-sm">
            Last updated: {format(new Date(state.weather.fetchedAt), 'MMM d, h:mm a')}
          </p>
        ) : (
          <p className="text-garden-400 text-sm">No weather data loaded yet.</p>
        )}
        <button onClick={() => refreshWeather()} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} /> Refresh Weather Data
        </button>
      </div>

      {/* Stats */}
      <div className="card p-5">
        <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Database size={18} className="text-garden-400" /> Data Summary
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-garden-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{plants.length}</div>
            <div className="text-xs text-garden-300">Plants</div>
          </div>
          <div className="bg-garden-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{shedSupplies.length}</div>
            <div className="text-xs text-garden-300">Supplies</div>
          </div>
          <div className="bg-garden-700 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">
              {plants.reduce((acc, p) => acc + p.wateringHistory.length + p.fertilizerHistory.length + p.amendments.length, 0)}
            </div>
            <div className="text-xs text-garden-300">Log Entries</div>
          </div>
        </div>
        <div className="mt-4 text-xs text-garden-400 text-center">
          All data is stored locally in your browser.
        </div>
      </div>

      {/* Export */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-white">Data Management</h2>
        <div className="flex gap-3">
          <button onClick={exportData} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Database size={16} /> Export Data
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <Upload size={16} /> Import Backup
          </button>
          <input
            type="file"
            accept=".json"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImport}
          />
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 py-2 text-sm transition-colors"
        >
          <Trash2 size={16} /> Reset All Data
        </button>
        {showResetConfirm && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">
                This will permanently delete all your plants, supplies, and garden data. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn-danger flex-1 text-sm" onClick={handleReset}>Yes, Reset Everything</button>
              <button className="btn-secondary flex-1 text-sm" onClick={() => setShowResetConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Zone reference */}
      <div className="card p-5">
        <h2 className="font-semibold text-white mb-3">Hardiness Zone: {profile?.zone}</h2>
        <div className="text-sm text-garden-300 space-y-2">
          <p>Your zone is automatically detected from your ZIP code, or estimated from your state.</p>
          <p>Zone numbers represent the average annual extreme minimum temperature in 10°F increments, with 'a' and 'b' subdivisions of 5°F each.</p>
          <p className="text-garden-400 text-xs">
            Visit planthardiness.ars.usda.gov for the interactive USDA map.
          </p>
        </div>
      </div>
    </div>
  );
}
