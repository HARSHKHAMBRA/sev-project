import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import { ChevronLeft, MapPin, Play, Square } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/types/database';
import { calculateRewardPoints } from '@/utils/rewardCalculator';
import { getVehicleColor, getVehicleTypeLabel } from '@/utils/vehicleColors';

export default function StartRideScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = params.vehicleId as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [rideActive, setRideActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startOdometer, setStartOdometer] = useState('');
  const [endOdometer, setEndOdometer] = useState('');
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (vehicleId && user) {
      loadVehicle();
    }
  }, [vehicleId, user]);

  const loadVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        Alert.alert('Error', 'Vehicle not found');
        router.back();
        return;
      }

      setVehicle(data);
      setStartOdometer(data.current_odometer.toString());
    } catch (error: any) {
      Alert.alert('Error', error.message);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'web') {
      return true;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Location permission is required to track your ride'
      );
      return false;
    }
    return true;
  };

  const handleStartRide = async () => {
    if (!startOdometer) {
      Alert.alert('Error', 'Please enter starting odometer reading');
      return;
    }

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          vehicle_id: vehicleId,
          user_id: user?.id,
          start_odometer: parseFloat(startOdometer),
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      setRideActive(true);
      setStartTime(new Date());
      Alert.alert('Ride Started', 'Your ride tracking has begun!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndRide = async () => {
    if (!endOdometer) {
      Alert.alert('Error', 'Please enter ending odometer reading');
      return;
    }

    const endOdo = parseFloat(endOdometer);
    const startOdo = parseFloat(startOdometer);

    if (endOdo <= startOdo) {
      Alert.alert('Error', 'End odometer must be greater than start odometer');
      return;
    }

    const calculatedDistance = endOdo - startOdo;
    setLoading(true);

    try {
      const fuelUsed = calculatedDistance / (vehicle?.expected_mileage || 15);
      const actualMileage = calculatedDistance / fuelUsed;

      const rewardCalculation = calculateRewardPoints(
        calculatedDistance,
        vehicle!.type,
        actualMileage,
        vehicle!.expected_mileage
      );

      const { error: sessionError } = await supabase
        .from('sessions')
        .update({
          end_odometer: endOdo,
          end_time: new Date().toISOString(),
          distance_km: calculatedDistance,
          reward_points: rewardCalculation.totalPoints,
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ current_odometer: endOdo })
        .eq('id', vehicleId);

      if (vehicleError) throw vehicleError;

      const { error: rewardError } = await supabase.from('rewards_history').insert({
        user_id: user?.id,
        vehicle_id: vehicleId,
        session_id: sessionId,
        points: rewardCalculation.totalPoints,
        reason: `Ride completed: ${calculatedDistance.toFixed(1)} km`,
      });

      if (rewardError) throw rewardError;

      Alert.alert(
        'Ride Completed!',
        `Distance: ${calculatedDistance.toFixed(1)} km\nReward Points: +${rewardCalculation.totalPoints}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !vehicle) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {rideActive ? 'Active Ride' : 'Start Ride'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.vehicleCard,
            { borderLeftColor: getVehicleColor(vehicle.type), borderLeftWidth: 6 },
          ]}
        >
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.vehicleModel}>{vehicle.model}</Text>
          <Text style={styles.vehicleType}>{getVehicleTypeLabel(vehicle.type)}</Text>
        </View>

        {!rideActive ? (
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Start Odometer (km)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter current odometer reading"
                placeholderTextColor="#9ca3af"
                value={startOdometer}
                onChangeText={setStartOdometer}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.startButton, loading && styles.buttonDisabled]}
              onPress={handleStartRide}
              disabled={loading}
            >
              <Play color="#ffffff" size={24} fill="#ffffff" />
              <Text style={styles.startButtonText}>Start Ride</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <MapPin color="#3b82f6" size={20} />
              <Text style={styles.infoText}>
                Location tracking will start when you begin your ride
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.activeCard}>
              <Text style={styles.activeLabel}>Ride In Progress</Text>
              <Text style={styles.activeTime}>
                Started: {startTime?.toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>End Odometer (km)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter ending odometer reading"
                placeholderTextColor="#9ca3af"
                value={endOdometer}
                onChangeText={setEndOdometer}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.endButton, loading && styles.buttonDisabled]}
              onPress={handleEndRide}
              disabled={loading}
            >
              <Square color="#ffffff" size={24} fill="#ffffff" />
              <Text style={styles.endButtonText}>End Ride</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  vehicleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  vehicleModel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 14,
    color: '#9ca3af',
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  startButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  endButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  endButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
  },
  activeCard: {
    backgroundColor: '#d1fae5',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 8,
  },
  activeTime: {
    fontSize: 14,
    color: '#047857',
  },
});
