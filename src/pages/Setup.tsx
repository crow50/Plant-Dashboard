import { useState, useEffect } from 'react';
import { Flower2, MapPin, Leaf } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GardenProfile, SoilType } from '../types';
import { US_STATES } from '../data/plants';
import { inferZoneFromState, lookupZoneFromZip } from '../utils/zoneUtils';

const SOIL_TYPES: { value: SoilType; label: string; desc: string }[] = [
  { value: 'loamy', label: 'Loamy', desc: 'Ideal mix of sand, silt, and clay' },
  { value: 'sandy', label: 'Sandy', desc: 'Fast draining, low nutrients' },
  { value: 'clay', label: 'Clay', desc: 'Slow draining, high nutrients' },
  { value: 'silty', label: 'Silty', desc: 'Smooth, fertile, retains moisture' },
  { value: 'chalky', label: 'Chalky', desc: 'Alkaline, free-draining' },
  { value: 'peaty', label: 'Peaty', desc: 'Acidic, high organic matter' },
];

export default function Setup() {
  const { setProfile } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: 'My Garden',
    zone: inferZoneFromState('Virginia'),
    state: 'Virginia',
    zipCode: '',
    soilType: 'loamy' as SoilType,
    basePh: 6.5,
  });
  const [zoneSource, setZoneSource] = useState<'state' | 'zip' | 'loading'>('state');

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
    } else {
      setForm(f => ({ ...f, zone: inferZoneFromState(f.state) }));
      setZoneSource('state');
    }
  }, [form.zipCode, form.state]);

  function submit() {
    const profile: GardenProfile = {
      id: crypto.randomUUID(),
      name: form.name,
      zone: form.zone,
      state: form.state,
      zipCode: form.zipCode,
      soilType: form.soilType,
      basePh: form.basePh,
      baseNutrients: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfile(profile);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-garden-900 via-garden-800 to-garden-900">
      <div className="card p-8 max-w-lg w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-garden-600 rounded-full p-4 mb-4">
            <Flower2 size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Plant Dashboard</h1>
          <p className="text-garden-300 mt-2 text-center">Let's set up your garden profile</p>
        </div>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-garden-400' : 'bg-garden-700'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Leaf size={20} className="text-garden-400" />
              Garden Name
            </h2>
            <div>
              <label className="label">Garden Name</label>
              <input
                className="input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="My Backyard Garden"
              />
            </div>
            <button className="btn-primary w-full mt-4" onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin size={20} className="text-garden-400" />
              Location
            </h2>
            <p className="text-sm text-garden-300">Your location helps us give accurate weather, chill-hour tracking, and seasonal alerts.</p>
            <div>
              <label className="label">State</label>
              <select
                className="select"
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value })}
              >
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">ZIP Code</label>
              <input
                className="input"
                value={form.zipCode}
                onChange={e => setForm({ ...form, zipCode: e.target.value })}
                placeholder="e.g. 22301"
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
            <div className="flex gap-3 mt-4">
              <button className="btn-secondary flex-1" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary flex-1" onClick={() => setStep(3)}>Continue →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Leaf size={20} className="text-garden-400" />
              Soil Profile
            </h2>
            <div>
              <label className="label">Primary Soil Type</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {SOIL_TYPES.map(st => (
                  <button
                    key={st.value}
                    onClick={() => setForm({ ...form, soilType: st.value })}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      form.soilType === st.value
                        ? 'border-garden-400 bg-garden-600'
                        : 'border-garden-600 bg-garden-700 hover:border-garden-500'
                    }`}
                  >
                    <div className="font-medium text-sm">{st.label}</div>
                    <div className="text-xs text-garden-300 mt-0.5">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Base Soil pH: {form.basePh}</label>
              <input
                type="range"
                min="4"
                max="9"
                step="0.1"
                value={form.basePh}
                onChange={e => setForm({ ...form, basePh: parseFloat(e.target.value) })}
                className="w-full accent-garden-400"
              />
              <div className="flex justify-between text-xs text-garden-400 mt-1">
                <span>4.0 Acidic</span>
                <span>7.0 Neutral</span>
                <span>9.0 Alkaline</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn-secondary flex-1" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary flex-1" onClick={submit}>
                Start Gardening 🌱
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
