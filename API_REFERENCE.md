# API Reference - Supabase Queries

This document shows all the database operations used in the app.

## Authentication

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Then create profile
await supabase.from('profiles').insert({
  id: data.user.id,
  name: 'John Doe',
  phone: '+1234567890',
});
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign Out
```typescript
await supabase.auth.signOut();
```

### Get Current Session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

## Profiles

### Get User Profile
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle();
```

### Update Profile
```typescript
const { error } = await supabase
  .from('profiles')
  .update({ name: 'Jane Doe', phone: '+9876543210' })
  .eq('id', userId);
```

## Vehicles

### Get All User Vehicles
```typescript
const { data, error } = await supabase
  .from('vehicles')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Get Active Vehicles Only
```typescript
const { data, error } = await supabase
  .from('vehicles')
  .select('*')
  .eq('user_id', userId)
  .eq('active', true)
  .order('created_at', { ascending: false });
```

### Get Single Vehicle
```typescript
const { data, error } = await supabase
  .from('vehicles')
  .select('*')
  .eq('id', vehicleId)
  .eq('user_id', userId)
  .maybeSingle();
```

### Add New Vehicle
```typescript
const { data, error } = await supabase
  .from('vehicles')
  .insert({
    user_id: userId,
    name: 'My Tesla',
    type: 'ev',
    model: 'Model 3',
    reg_no: 'ABC-1234',
    odometer_start: 0,
    current_odometer: 0,
    battery_capacity_kwh: 75,
    expected_mileage: 6.5,
    active: true,
  });
```

### Update Vehicle
```typescript
const { error } = await supabase
  .from('vehicles')
  .update({
    name: 'Updated Name',
    current_odometer: 15000,
  })
  .eq('id', vehicleId);
```

### Deactivate Vehicle
```typescript
const { error } = await supabase
  .from('vehicles')
  .update({ active: false })
  .eq('id', vehicleId);
```

## Sessions (Rides)

### Start New Session
```typescript
const { data, error } = await supabase
  .from('sessions')
  .insert({
    vehicle_id: vehicleId,
    user_id: userId,
    start_odometer: 10000,
    start_time: new Date().toISOString(),
  })
  .select()
  .single();
```

### End Session
```typescript
const { error } = await supabase
  .from('sessions')
  .update({
    end_odometer: 10050,
    end_time: new Date().toISOString(),
    distance_km: 50,
    reward_points: 80,
  })
  .eq('id', sessionId);
```

### Get User Sessions
```typescript
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('user_id', userId)
  .not('end_time', 'is', null)
  .order('start_time', { ascending: false })
  .limit(20);
```

### Get Vehicle Sessions
```typescript
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .not('end_time', 'is', null)
  .order('start_time', { ascending: false })
  .limit(10);
```

### Get Sessions by Month
```typescript
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .gte('start_time', '2025-10-01')
  .lt('start_time', '2025-11-01')
  .not('end_time', 'is', null);
```

## Fuel Logs

### Add Fuel Log
```typescript
const { error } = await supabase
  .from('fuel_logs')
  .insert({
    vehicle_id: vehicleId,
    user_id: userId,
    fuel_type: 'petrol',
    liters: 40,
    cost: 3600,
    odometer_reading: 10100,
    station: 'Indian Oil',
  });
```

### Get Vehicle Fuel Logs
```typescript
const { data, error } = await supabase
  .from('fuel_logs')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .order('log_date', { ascending: false })
  .limit(20);
```

### Get Fuel Logs by Date Range
```typescript
const { data, error } = await supabase
  .from('fuel_logs')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .gte('log_date', '2025-10-01')
  .lte('log_date', '2025-10-31');
```

## EV Charge Logs

### Add Charge Log
```typescript
const { error } = await supabase
  .from('ev_charge_logs')
  .insert({
    vehicle_id: vehicleId,
    user_id: userId,
    kwh: 50,
    cost: 500,
    odometer_reading: 5100,
    percent_before: 20,
    percent_after: 90,
  });
```

### Get Vehicle Charge Logs
```typescript
const { data, error } = await supabase
  .from('ev_charge_logs')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .order('log_date', { ascending: false })
  .limit(20);
```

## Rewards History

### Add Reward Entry
```typescript
const { error } = await supabase
  .from('rewards_history')
  .insert({
    user_id: userId,
    vehicle_id: vehicleId,
    session_id: sessionId,
    points: 80,
    reason: 'Ride completed: 50.0 km',
  });
```

### Get User Total Points
```typescript
const { data, error } = await supabase
  .from('rewards_history')
  .select('points')
  .eq('user_id', userId);

const totalPoints = data?.reduce((sum, record) => sum + record.points, 0) || 0;
```

### Get Vehicle Rewards
```typescript
const { data, error } = await supabase
  .from('rewards_history')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .order('created_at', { ascending: false })
  .limit(20);
```

## Monthly Reports

### Get User Reports
```typescript
const { data, error } = await supabase
  .from('monthly_reports')
  .select('*, vehicles(*)')
  .eq('user_id', userId)
  .order('report_month', { ascending: false })
  .limit(12);
```

### Get Vehicle Report for Specific Month
```typescript
const { data, error } = await supabase
  .from('monthly_reports')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .eq('report_month', '2025-10')
  .maybeSingle();
```

### Create/Update Monthly Report
```typescript
const { error } = await supabase
  .from('monthly_reports')
  .upsert({
    user_id: userId,
    vehicle_id: vehicleId,
    report_month: '2025-10',
    total_distance_km: 500,
    total_fuel_liters: 40,
    total_fuel_cost: 3600,
    avg_mileage: 12.5,
    total_reward_points: 500,
    session_count: 15,
  });
```

## Complex Queries

### Get Dashboard Summary
```typescript
// Total points
const { data: pointsData } = await supabase
  .from('rewards_history')
  .select('points')
  .eq('user_id', userId);
const totalPoints = pointsData?.reduce((sum, r) => sum + r.points, 0) || 0;

// Active vehicles
const { data: vehicles } = await supabase
  .from('vehicles')
  .select('*')
  .eq('user_id', userId)
  .eq('active', true);

// Recent sessions
const { data: sessions } = await supabase
  .from('sessions')
  .select('*, vehicles(name, type)')
  .eq('user_id', userId)
  .not('end_time', 'is', null)
  .order('start_time', { ascending: false })
  .limit(5);
```

### Get Vehicle Detail with Logs
```typescript
// Vehicle info
const { data: vehicle } = await supabase
  .from('vehicles')
  .select('*')
  .eq('id', vehicleId)
  .maybeSingle();

// Sessions
const { data: sessions } = await supabase
  .from('sessions')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .not('end_time', 'is', null)
  .order('start_time', { ascending: false });

// Fuel or Charge logs
if (vehicle.type === 'ev') {
  const { data: chargeLogs } = await supabase
    .from('ev_charge_logs')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('log_date', { ascending: false });
} else {
  const { data: fuelLogs } = await supabase
    .from('fuel_logs')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('log_date', { ascending: false });
}
```

## Aggregate Queries

### Calculate Monthly Stats (Manual)
```typescript
// Get all sessions for a month
const { data: sessions } = await supabase
  .from('sessions')
  .select('distance_km, reward_points')
  .eq('vehicle_id', vehicleId)
  .gte('start_time', '2025-10-01')
  .lt('start_time', '2025-11-01')
  .not('end_time', 'is', null);

const totalDistance = sessions?.reduce((sum, s) => sum + s.distance_km, 0);
const totalPoints = sessions?.reduce((sum, s) => sum + s.reward_points, 0);
const sessionCount = sessions?.length;

// Get fuel consumption
const { data: fuelLogs } = await supabase
  .from('fuel_logs')
  .select('liters, cost')
  .eq('vehicle_id', vehicleId)
  .gte('log_date', '2025-10-01')
  .lte('log_date', '2025-10-31');

const totalLiters = fuelLogs?.reduce((sum, f) => sum + f.liters, 0);
const totalCost = fuelLogs?.reduce((sum, f) => sum + f.cost, 0);
const avgMileage = totalDistance / totalLiters;
```

## Real-time Subscriptions (Optional)

### Subscribe to Vehicle Updates
```typescript
const subscription = supabase
  .channel('vehicles-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'vehicles',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Vehicle changed:', payload);
      // Update local state
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

## Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', vehicleId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    Alert.alert('Not Found', 'Vehicle not found');
    return;
  }

  // Use data
  setVehicle(data);
} catch (error: any) {
  console.error('Error:', error);
  Alert.alert('Error', error.message);
}
```

## Performance Tips

1. **Use indexes**: Already created on common query columns
2. **Limit results**: Use `.limit(N)` for lists
3. **Select specific columns**: Use `.select('id, name')` instead of `*`
4. **Use `.maybeSingle()`**: For queries expecting 0 or 1 row
5. **Batch operations**: Use `.insert([...])` for multiple rows
6. **Cache data**: Store frequently accessed data in state

## Security Notes

- All queries automatically apply RLS (Row Level Security)
- Users can only access their own data
- `auth.uid()` is used in RLS policies to filter by current user
- Never expose service role key in client code
- Always use anon key for client operations

---

**This API reference covers all database operations used in the app.**
