# Database Setup Instructions

The app requires a Supabase database. Please run the following SQL commands in your Supabase SQL Editor:

## Step 1: Create Profiles Table

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

## Step 2: Create Vehicles Table

```sql
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('petrol', 'diesel', 'ev', 'cng')),
  model text NOT NULL,
  reg_no text,
  odometer_start numeric NOT NULL DEFAULT 0,
  current_odometer numeric NOT NULL DEFAULT 0,
  tank_capacity numeric,
  battery_capacity_kwh numeric,
  expected_mileage numeric NOT NULL DEFAULT 15,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_active ON vehicles(active);
```

## Step 3: Create Sessions Table

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  start_odometer numeric NOT NULL,
  end_odometer numeric,
  distance_km numeric DEFAULT 0,
  avg_speed_kmph numeric,
  route_polyline text,
  reward_points numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_vehicle_id ON sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
```

## Step 4: Create Fuel Logs Table

```sql
CREATE TABLE IF NOT EXISTS fuel_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  fuel_type text NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'cng')),
  liters numeric NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  odometer_reading numeric NOT NULL,
  station text,
  receipt_image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fuel logs"
  ON fuel_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fuel logs"
  ON fuel_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fuel logs"
  ON fuel_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fuel logs"
  ON fuel_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fuel_logs_user_id ON fuel_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_vehicle_id ON fuel_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_logs_date ON fuel_logs(log_date);
```

## Step 5: Create EV Charge Logs Table

```sql
CREATE TABLE IF NOT EXISTS ev_charge_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  kwh numeric NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  odometer_reading numeric NOT NULL,
  percent_before numeric,
  percent_after numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ev_charge_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own charge logs"
  ON ev_charge_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charge logs"
  ON ev_charge_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charge logs"
  ON ev_charge_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own charge logs"
  ON ev_charge_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ev_charge_logs_user_id ON ev_charge_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ev_charge_logs_vehicle_id ON ev_charge_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_ev_charge_logs_date ON ev_charge_logs(log_date);
```

## Step 6: Create Monthly Reports Table

```sql
CREATE TABLE IF NOT EXISTS monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  report_month text NOT NULL,
  total_distance_km numeric DEFAULT 0,
  total_fuel_liters numeric DEFAULT 0,
  total_fuel_cost numeric DEFAULT 0,
  total_ev_kwh numeric DEFAULT 0,
  total_ev_cost numeric DEFAULT 0,
  avg_mileage numeric DEFAULT 0,
  total_reward_points numeric DEFAULT 0,
  session_count integer DEFAULT 0,
  generated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, vehicle_id, report_month)
);

ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own monthly reports"
  ON monthly_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly reports"
  ON monthly_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly reports"
  ON monthly_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_monthly_reports_user_id ON monthly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_vehicle_id ON monthly_reports(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_month ON monthly_reports(report_month);
```

## Step 7: Create Rewards History Table

```sql
CREATE TABLE IF NOT EXISTS rewards_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  monthly_report_id uuid REFERENCES monthly_reports(id) ON DELETE SET NULL,
  points numeric NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rewards_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards history"
  ON rewards_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards history"
  ON rewards_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rewards_history_user_id ON rewards_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_history_vehicle_id ON rewards_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rewards_history_session_id ON rewards_history(session_id);
```

## Done!

Your database is now ready. You can start using the app!
