import { VehicleType } from '@/types/database';

export const getVehicleGradient = (type: VehicleType): [string, string] => {
  switch (type) {
    case 'ev':
      return ['#22c55e', '#15803d'];
    case 'cng':
      return ['#84cc16', '#65a30d'];
    case 'petrol':
      return ['#fbbf24', '#f59e0b'];
    case 'diesel':
      return ['#92400e', '#7c2d12'];
    default:
      return ['#6b7280', '#4b5563'];
  }
};

export const getVehicleColor = (type: VehicleType): string => {
  switch (type) {
    case 'ev':
      return '#22c55e';
    case 'cng':
      return '#84cc16';
    case 'petrol':
      return '#fbbf24';
    case 'diesel':
      return '#92400e';
    default:
      return '#6b7280';
  }
};

export const getVehicleTypeLabel = (type: VehicleType): string => {
  switch (type) {
    case 'ev':
      return 'Electric';
    case 'cng':
      return 'CNG';
    case 'petrol':
      return 'Petrol';
    case 'diesel':
      return 'Diesel';
    default:
      return 'Unknown';
  }
};

export const getRewardTier = (points: number): { tier: string; color: string } => {
  if (points >= 1000) return { tier: 'Platinum', color: '#e5e7eb' };
  if (points >= 500) return { tier: 'Gold', color: '#fbbf24' };
  if (points >= 250) return { tier: 'Silver', color: '#d1d5db' };
  return { tier: 'Bronze', color: '#d97706' };
};
