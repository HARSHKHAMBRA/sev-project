import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Play, Car } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/types/database';
import { getVehicleGradient, getVehicleTypeLabel, getRewardTier } from '@/utils/vehicleColors';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user) {
      loadVehicles();
      loadTotalPoints();
    }
  }, [user]);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user?.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTotalPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards_history')
        .select('points')
        .eq('user_id', user?.id);

      if (error) throw error;

      const total = data?.reduce((sum, record) => sum + (record.points || 0), 0) || 0;
      setTotalPoints(total);
    } catch (error) {
      console.error('Error loading points:', error);
    }
  };

  const { tier, color } = getRewardTier(totalPoints);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.pointsCard}>
            <Text style={styles.pointsLabel}>Total Reward Points</Text>
            <Text style={styles.pointsValue}>{totalPoints.toLocaleString()}</Text>
            <View style={[styles.tierBadge, { backgroundColor: color }]}>
              <Text style={styles.tierText}>{tier}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Vehicles</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/add-vehicle')}
            >
              <Plus color="#ffffff" size={20} />
            </TouchableOpacity>
          </View>

          {vehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <Car color="#d1d5db" size={48} />
              <Text style={styles.emptyText}>No vehicles added yet</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/add-vehicle')}
              >
                <Text style={styles.primaryButtonText}>Add Your First Vehicle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.vehicleList}>
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onPress={() => router.push(`/vehicle/${vehicle.id}`)}
                  onStartRide={() => router.push(`/start-ride?vehicleId=${vehicle.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function VehicleCard({
  vehicle,
  onPress,
  onStartRide,
}: {
  vehicle: Vehicle;
  onPress: () => void;
  onStartRide: () => void;
}) {
  const [startColor, endColor] = getVehicleGradient(vehicle.type);

  return (
    <TouchableOpacity style={styles.vehicleCard} onPress={onPress}>
      <LinearGradient
        colors={[startColor, endColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.vehicleGradient}
      />
      <View style={styles.vehicleContent}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.vehicleModel}>{vehicle.model}</Text>
          <Text style={styles.vehicleType}>{getVehicleTypeLabel(vehicle.type)}</Text>
          <Text style={styles.vehicleOdometer}>
            {vehicle.current_odometer.toLocaleString()} km
          </Text>
        </View>
        <TouchableOpacity style={styles.rideButton} onPress={onStartRide}>
          <Play color="#ffffff" size={20} fill="#ffffff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  pointsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#ffffff',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleList: {
    gap: 16,
  },
  vehicleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleGradient: {
    width: 8,
  },
  vehicleContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  vehicleModel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  vehicleOdometer: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  rideButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
