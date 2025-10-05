export type VehicleType = 'petrol' | 'diesel' | 'ev' | 'cng';
export type FuelType = 'petrol' | 'diesel' | 'cng';

export interface Profile {
  id: string;
  name: string;
  phone?: string;
  created_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  type: VehicleType;
  model: string;
  reg_no?: string;
  odometer_start: number;
  current_odometer: number;
  tank_capacity?: number;
  battery_capacity_kwh?: number;
  expected_mileage: number;
  active: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  vehicle_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  start_odometer: number;
  end_odometer?: number;
  distance_km: number;
  avg_speed_kmph?: number;
  route_polyline?: string;
  reward_points: number;
  created_at: string;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  user_id: string;
  log_date: string;
  fuel_type: FuelType;
  liters: number;
  cost: number;
  odometer_reading: number;
  station?: string;
  receipt_image_url?: string;
  created_at: string;
}

export interface EVChargeLog {
  id: string;
  vehicle_id: string;
  user_id: string;
  log_date: string;
  kwh: number;
  cost: number;
  odometer_reading: number;
  percent_before?: number;
  percent_after?: number;
  created_at: string;
}

export interface MonthlyReport {
  id: string;
  user_id: string;
  vehicle_id: string;
  report_month: string;
  total_distance_km: number;
  total_fuel_liters: number;
  total_fuel_cost: number;
  total_ev_kwh: number;
  total_ev_cost: number;
  avg_mileage: number;
  total_reward_points: number;
  session_count: number;
  generated_at: string;
}

export interface RewardHistory {
  id: string;
  user_id: string;
  vehicle_id: string;
  session_id?: string;
  monthly_report_id?: string;
  points: number;
  reason: string;
  created_at: string;
}
