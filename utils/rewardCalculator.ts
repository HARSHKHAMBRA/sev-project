import { VehicleType } from '@/types/database';

export interface RewardCalculation {
  basePoints: number;
  multiplier: number;
  efficiencyBonus: number;
  totalPoints: number;
}

export const calculateRewardPoints = (
  distance: number,
  vehicleType: VehicleType,
  actualMileage: number,
  expectedMileage: number
): RewardCalculation => {
  const basePoints = distance * 1;

  let multiplier = 1.0;
  switch (vehicleType) {
    case 'ev':
      multiplier = 1.6;
      break;
    case 'cng':
      multiplier = 1.3;
      break;
    case 'petrol':
      multiplier = 1.0;
      break;
    case 'diesel':
      multiplier = 0.9;
      break;
  }

  const pointsAfterMultiplier = basePoints * multiplier;

  const efficiencyRatio = actualMileage / expectedMileage;
  let efficiencyBonus = 0;

  if (efficiencyRatio >= 1.0) {
    efficiencyBonus = pointsAfterMultiplier * 0.1;
  } else if (efficiencyRatio >= 0.8) {
    efficiencyBonus = pointsAfterMultiplier * (efficiencyRatio - 0.8) * 0.5;
  } else {
    efficiencyBonus = -pointsAfterMultiplier * 0.1;
  }

  const totalPoints = Math.round(pointsAfterMultiplier + efficiencyBonus);

  return {
    basePoints,
    multiplier,
    efficiencyBonus,
    totalPoints: Math.max(0, totalPoints),
  };
};

export const getMonthlyConsistencyBonus = (
  sessionCount: number,
  avgMileage: number,
  expectedMileage: number
): number => {
  if (sessionCount < 10) return 0;

  const efficiencyRatio = avgMileage / expectedMileage;
  if (efficiencyRatio >= 0.9) {
    return 50;
  }

  return 0;
};
