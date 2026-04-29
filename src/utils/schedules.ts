import { GardenPlant } from '../types';
import { differenceInDays, parseISO, addDays, format } from 'date-fns';

export function daysUntilWatering(plant: GardenPlant, now = new Date()): number {
  const last = plant.wateringHistory.at(-1)?.date ?? plant.plantedDate;
  const nextDate = addDays(parseISO(last), plant.wateringSchedule.frequencyDays);
  return differenceInDays(nextDate, now);
}

export function daysUntilFeeding(plant: GardenPlant, now = new Date()): number {
  const last = plant.fertilizerHistory.at(-1)?.date ?? plant.plantedDate;
  const nextDate = addDays(parseISO(last), plant.feedingSchedule.frequencyDays);
  return differenceInDays(nextDate, now);
}

export function nextWateringDate(plant: GardenPlant): string {
  const last = plant.wateringHistory.at(-1)?.date ?? plant.plantedDate;
  return format(addDays(parseISO(last), plant.wateringSchedule.frequencyDays), 'MMM d');
}

export function nextFeedingDate(plant: GardenPlant): string {
  const last = plant.fertilizerHistory.at(-1)?.date ?? plant.plantedDate;
  return format(addDays(parseISO(last), plant.feedingSchedule.frequencyDays), 'MMM d');
}

export function daysGrown(plant: GardenPlant, now = new Date()): number {
  return differenceInDays(now, parseISO(plant.plantedDate));
}

export function getPlantsNeedingWater(plants: GardenPlant[]): GardenPlant[] {
  const now = new Date();
  return plants.filter(p => daysUntilWatering(p, now) <= 0 && p.status !== 'harvested');
}

export function getPlantsNeedingFeeding(plants: GardenPlant[]): GardenPlant[] {
  const now = new Date();
  return plants.filter(p => daysUntilFeeding(p, now) <= 0 && p.status !== 'harvested');
}

export function getUpcomingWatering(plants: GardenPlant[], days = 3): GardenPlant[] {
  const now = new Date();
  return plants.filter(p => {
    const d = daysUntilWatering(p, now);
    return d > 0 && d <= days && p.status !== 'harvested';
  });
}

export function getUpcomingFeeding(plants: GardenPlant[], days = 7): GardenPlant[] {
  const now = new Date();
  return plants.filter(p => {
    const d = daysUntilFeeding(p, now);
    return d > 0 && d <= days && p.status !== 'harvested';
  });
}
