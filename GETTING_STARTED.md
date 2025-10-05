# Getting Started - Quick Guide

## 5-Minute Setup

### Step 1: Database Setup (2 minutes)

1. Open your browser and go to https://supabase.com/dashboard
2. Select your project (dpywtqkfcsakfydgxluv)
3. Click **"SQL Editor"** in the left sidebar
4. Open the `DATABASE_SETUP.md` file in this project
5. Copy and paste each SQL block (one at a time) and click **"Run"**
6. You should see 7 tables created:
   - profiles
   - vehicles
   - sessions
   - fuel_logs
   - ev_charge_logs
   - monthly_reports
   - rewards_history

### Step 2: Install Dependencies (1 minute)

```bash
npm install
```

### Step 3: Start the App (30 seconds)

```bash
npm run dev
```

Press:
- **`w`** to open in web browser (fastest for testing)
- **`i`** for iOS simulator (requires Xcode)
- **`a`** for Android emulator (requires Android Studio)

### Step 4: Test the App (2 minutes)

1. **Sign Up**: Create a new account
2. **Add Vehicle**: Tap "+" and add your first vehicle
3. **Start Ride**: Tap the play button on your vehicle
4. **End Ride**: Enter ending odometer and see your reward points!

## Your App is Ready! 🎉

## Quick Reference

### Environment Variables (Already Configured)
Your `.env` file contains:
```
EXPO_PUBLIC_SUPABASE_URL=https://dpywtqkfcsakfydgxluv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### Main Features

1. **Dashboard** (`/`)
   - View all vehicles
   - See total reward points
   - Quick start ride

2. **Vehicles Tab**
   - List all vehicles
   - View vehicle details
   - Add fuel/charge logs

3. **Reports Tab**
   - Monthly summaries per vehicle
   - Distance, fuel, costs, points

4. **Profile Tab**
   - User info
   - Total stats
   - Sign out

### Reward Points Logic

```
Base Points = Distance (km) × 1

Multiplier by Vehicle Type:
- EV: ×1.6 (most eco-friendly)
- CNG: ×1.3
- Petrol: ×1.0
- Diesel: ×0.9

Efficiency Bonus:
- If actual mileage ≥ expected: +10%
- If 80-100% of expected: 0-10%
- If < 80% of expected: -10%
```

### Vehicle Types & Colors

- **EV (Electric)**: Green gradient
- **CNG**: Lime green gradient
- **Petrol**: Yellow/amber gradient
- **Diesel**: Dark brown gradient

### Reward Tiers

- Bronze: 0-249 points
- Silver: 250-499 points
- Gold: 500-999 points
- Platinum: 1000+ points

## Common Questions

### Q: Where is my data stored?
**A:** All data is stored in your Supabase PostgreSQL database with row-level security.

### Q: Can I use multiple vehicles?
**A:** Yes! Add unlimited vehicles and switch between them.

### Q: Does it work offline?
**A:** You need internet to save data to the database, but the app will show cached data when offline.

### Q: How do I track an EV vs Petrol vehicle?
**A:** When adding a vehicle, select the type. EVs track kWh and km/kWh, while fuel vehicles track liters and km/L.

### Q: Can I edit a past ride?
**A:** Currently, rides are immutable once saved. This ensures data integrity for rewards.

### Q: How are monthly reports generated?
**A:** Reports are auto-calculated when you view the Reports tab, aggregating all data for each vehicle per month.

## Troubleshooting

### Database Not Connected
- Verify `.env` file exists with correct Supabase URL and key
- Check Supabase project is active (not paused)
- Ensure all tables are created (run `DATABASE_SETUP.md`)

### Location Permission Not Working
**iOS**: Settings → Privacy → Location Services → Expo Go → Allow While Using
**Android**: Settings → Apps → Expo Go → Permissions → Location → Allow
**Web**: Browser will prompt for permission

### App Crashes on Start
```bash
# Clear cache and restart
expo start -c
```

### Type Errors
```bash
npm run typecheck
```

## Development Tips

### Hot Reload
Changes to `.tsx` files will auto-reload in the app. No need to restart!

### View Database
Go to Supabase dashboard → Table Editor to see your data in real-time.

### Test Different Scenarios
1. Add an EV and a Petrol vehicle
2. Complete rides with different distances
3. Add fuel logs at different prices
4. Compare monthly reports

## What's Next?

1. **Customize**: Change colors in `utils/vehicleColors.ts`
2. **Add Features**: Check `FEATURES.md` for enhancement ideas
3. **Deploy**: Build for production with `expo build`
4. **Share**: Export as APK/IPA and share with others

## Need Help?

- **README.md**: Complete documentation
- **DATABASE_SETUP.md**: Database schema and setup
- **FEATURES.md**: Full feature list
- **Code Comments**: Check inline comments in files

---

**Happy Tracking! 🚗⚡🏆**
