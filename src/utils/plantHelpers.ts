import { PlantCategory, PlantStatus, LocationType } from '../types';

export function categoryColor(category: PlantCategory): string {
  const colors: Record<PlantCategory, string> = {
    fruits: 'bg-red-700 text-red-100',
    vegetables: 'bg-green-700 text-green-100',
    herbs: 'bg-teal-700 text-teal-100',
    trees: 'bg-amber-700 text-amber-100',
    flowers: 'bg-pink-700 text-pink-100',
    other: 'bg-gray-600 text-gray-100',
  };
  return colors[category];
}

export function statusColor(status: PlantStatus): string {
  const colors: Record<PlantStatus, string> = {
    seedling: 'bg-yellow-600 text-yellow-100',
    vegetative: 'bg-green-600 text-green-100',
    flowering: 'bg-pink-600 text-pink-100',
    fruiting: 'bg-orange-600 text-orange-100',
    dormant: 'bg-gray-600 text-gray-100',
    'ready-to-harvest': 'bg-emerald-500 text-white',
    harvested: 'bg-gray-700 text-gray-300',
  };
  return colors[status];
}

export function locationIcon(type: LocationType): string {
  const icons: Record<LocationType, string> = {
    'in-ground': '🌍',
    container: '🪴',
    greenhouse: '🏠',
    indoor: '🪟',
  };
  return icons[type];
}

export function categoryEmoji(category: PlantCategory): string {
  const emojis: Record<PlantCategory, string> = {
    fruits: '🍓',
    vegetables: '🥦',
    herbs: '🌿',
    trees: '🌳',
    flowers: '🌸',
    other: '🌱',
  };
  return emojis[category];
}

export function phColor(ph: number): string {
  if (ph < 5) return 'text-red-400';
  if (ph < 6) return 'text-orange-400';
  if (ph < 6.5) return 'text-yellow-400';
  if (ph <= 7) return 'text-green-400';
  if (ph <= 7.5) return 'text-blue-400';
  return 'text-purple-400';
}

export function formatStatus(status: PlantStatus): string {
  return status.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function formatCategory(category: PlantCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

