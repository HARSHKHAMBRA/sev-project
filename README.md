# Vehicle Tracking & Rewards App

A complete mobile application for tracking vehicle rides, fuel/charging logs, and earning reward points based on your driving efficiency. Built with React Native, Expo, and Supabase.

## Features

### Multi-Vehicle Support
- Track multiple vehicles (Petrol, Diesel, EV, CNG)
- Color-coded vehicle types with gradient designs
- Individual vehicle profiles with odometer tracking

### Ride Tracking
- GPS-enabled ride tracking
- Automatic distance calculation
- Reward points based on:
  - Distance traveled
  - Vehicle type (EV gets 1.6x, CNG 1.3x, Petrol 1.0x, Diesel 0.9x)
  - Fuel efficiency compared to expected mileage

### Fuel & Charge Management
- Log fuel refills (Petrol/Diesel/CNG)
- Track EV charging sessions with kWh and battery percentage
- Cost tracking for all energy inputs
- Odometer updates with each log

### Rewards System
- Earn points for every ride
- Efficiency bonuses for better-than-expected mileage
- Reward tiers: Bronze, Silver, Gold, Platinum
- Complete rewards history

### Monthly Reports
- Automated monthly statistics per vehicle
- Distance, fuel/energy consumption, costs
- Average mileage (km/L or km/kWh)
- Total reward points earned
- Session count and detailed breakdowns

### Authentication
- Secure email/password authentication via Supabase
- User profiles with phone number support
- Row-level security for all data

## Tech Stack

- **Frontend**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: StyleSheet (built-in React Native)
- **Icons**: Lucide React Native
- **Location**: Expo Location
- **UI Components**: Expo Linear Gradient

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (free tier works)
- iOS Simulator / Android Emulator / Physical device

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

The `.env` file already contains your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. Set Up Database

Run all SQL commands from `DATABASE_SETUP.md` in your Supabase SQL Editor:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Copy and run each SQL block from `DATABASE_SETUP.md` in order

This will create:
- `profiles` table (user data)
- `vehicles` table (vehicle information)
- `sessions` table (ride tracking)
- `fuel_logs` table (fuel refills)
- `ev_charge_logs` table (EV charging)
- `monthly_reports` table (aggregated stats)
- `rewards_history` table (points tracking)

All tables include Row Level Security (RLS) policies.

### 4. Run the App

```bash
npm run dev
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

## App Structure

```
app/
├── (auth)/              # Authentication screens
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/              # Main tab navigation
│   ├── index.tsx        # Dashboard/Home
│   ├── vehicles.tsx     # Vehicle list
│   ├── reports.tsx      # Monthly reports
│   └── profile.tsx      # User profile
├── vehicle/
│   └── [id].tsx         # Vehicle detail page
├── add-vehicle.tsx      # Add new vehicle
├── start-ride.tsx       # Ride tracking
├── add-fuel-log.tsx     # Fuel logging
├── add-charge-log.tsx   # EV charge logging
└── _layout.tsx          # Root layout

contexts/
└── AuthContext.tsx      # Authentication state management

lib/
└── supabase.ts          # Supabase client

types/
└── database.ts          # TypeScript types

utils/
├── vehicleColors.ts     # Color schemes and gradients
└── rewardCalculator.ts  # Points calculation logic
```

## Usage Guide

### 1. Sign Up / Login
- Create account with email and password
- Add your name and phone number (optional)

### 2. Add Your First Vehicle
- Tap "+" button on dashboard
- Select vehicle type (EV/CNG/Petrol/Diesel)
- Enter vehicle details:
  - Name (e.g., "My Tesla")
  - Model
  - Registration number (optional)
  - Current odometer reading
  - Expected mileage (km/L or km/kWh)
  - Tank/battery capacity (optional)

### 3. Start a Ride
- Tap the play button on any vehicle card
- Enter starting odometer reading
- Tap "Start Ride"
- Location tracking will begin (permission required)
- When done, enter ending odometer and tap "End Ride"
- Reward points calculated automatically!

### 4. Log Fuel/Charge
- Go to vehicle detail page
- Tap "Add Fuel" or "Add Charge"
- Enter:
  - Liters or kWh
  - Cost
  - Current odometer
  - Station name (optional for fuel)
  - Battery % before/after (optional for EV)

### 5. View Reports
- Check "Reports" tab for monthly summaries
- Each report shows:
  - Total distance
  - Fuel/energy consumption
  - Total cost
  - Average mileage
  - Reward points earned

## Reward Point System

### Base Points
- 1 point per kilometer traveled

### Vehicle Type Multipliers
- **EV**: 1.6x (highest, eco-friendly)
- **CNG**: 1.3x (clean fuel)
- **Petrol**: 1.0x (standard)
- **Diesel**: 0.9x (lower due to emissions)

### Efficiency Bonus
- **100%+ of expected mileage**: +10% bonus
- **80-100% of expected**: 0-10% bonus (gradual)
- **< 80% of expected**: -10% penalty

### Monthly Consistency Bonus
- Complete 10+ rides with 90%+ efficiency: +50 points

### Example Calculation
```
Ride: 50 km
Vehicle: EV (1.6x multiplier)
Expected: 6 km/kWh
Actual: 6.2 km/kWh (103% efficiency)

Base: 50 points
After multiplier: 50 × 1.6 = 80 points
Efficiency bonus: +10% = 88 points
Total: 88 reward points
```

## Vehicle Color Coding

- **EV**: Green gradient (#22c55e → #15803d)
- **CNG**: Lime green gradient (#84cc16 → #65a30d)
- **Petrol**: Yellow/amber gradient (#fbbf24 → #f59e0b)
- **Diesel**: Dark brown gradient (#92400e → #7c2d12)

## Reward Tiers

- **Bronze**: 0-249 points
- **Silver**: 250-499 points
- **Gold**: 500-999 points
- **Platinum**: 1000+ points

## Security Features

- Row-level security on all database tables
- Users can only access their own data
- Encrypted authentication via Supabase
- Location data only stored during active rides
- Optional location tracking (user consent required)

## Platform Support

- **Web**: Full support (GPS limited to browser capabilities)
- **iOS**: Full support with native GPS
- **Android**: Full support with native GPS

## Future Enhancements (Potential)

- [ ] Monthly report PDF export
- [ ] Comparison with other users (leaderboard)
- [ ] Cost per km analytics
- [ ] Maintenance reminders based on odometer
- [ ] Fuel price tracking and station recommendations
- [ ] Carbon footprint calculation
- [ ] Gamification badges
- [ ] Voice commands for hands-free logging
- [ ] Apple CarPlay / Android Auto integration

## Troubleshooting

### Database Connection Issues
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is active
- Ensure all tables are created (run `DATABASE_SETUP.md`)

### Location Permission Denied
- Go to device Settings → Privacy → Location
- Enable location for Expo Go app
- On web: allow location in browser prompt

### App Not Loading
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
expo start -c
```

### Type Errors
```bash
npm run typecheck
```

## Contributing

This is a complete working application. Feel free to:
- Add new features
- Improve UI/UX
- Optimize performance
- Add tests

## License

MIT License - Use freely for personal or commercial projects.

## Support

For issues or questions:
1. Check `DATABASE_SETUP.md` for database setup
2. Review this README thoroughly
3. Check Supabase dashboard for data
4. Verify `.env` configuration

---

**Built with ❤️ using React Native, Expo, and Supabase**
