import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ChevronRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/types/database';
import { getVehicleGradient, getVehicleTypeLabel } from '@/utils/vehicleColors';

export default function VehiclesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-vehicle')}
        >
          <Plus color="#ffffff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No vehicles added yet</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/add-vehicle')}
            >
              <Text style={styles.primaryButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.vehicleList}>
            {vehicles.map((vehicle) => (
              <VehicleListItem
                key={vehicle.id}
                vehicle={vehicle}
                onPress={() => router.push(`/vehicle/${vehicle.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function VehicleListItem({
  vehicle,
  onPress,
}: {
  vehicle: Vehicle;
  onPress: () => void;
}) {
  const [startColor, endColor] = getVehicleGradient(vehicle.type);

  return (
    <TouchableOpacity style={styles.vehicleItem} onPress={onPress}>
      <LinearGradient
        colors={[startColor, endColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.vehicleGradient}
      />
      <View style={styles.vehicleItemContent}>
        <View style={styles.vehicleItemInfo}>
          <Text style={styles.vehicleItemName}>{vehicle.name}</Text>
          <Text style={styles.vehicleItemModel}>{vehicle.model}</Text>
          <View style={styles.vehicleItemMeta}>
            <Text style={styles.vehicleItemType}>{getVehicleTypeLabel(vehicle.type)}</Text>
            <Text style={styles.vehicleItemDot}> • </Text>
            <Text style={styles.vehicleItemOdo}>
              {vehicle.current_odometer.toLocaleString()} km
            </Text>
          </View>
          {!vehicle.active && (
            <Text style={styles.inactiveLabel}>Inactive</Text>
          )}
        </View>
        <ChevronRight color="#9ca3af" size={20} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
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
    padding: 16,
    gap: 12,
  },
  vehicleItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleGradient: {
    width: 6,
  },
  vehicleItemContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  vehicleItemInfo: {
    flex: 1,
  },
  vehicleItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  vehicleItemModel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  vehicleItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleItemType: {
    fontSize: 12,
    color: '#9ca3af',
  },
  vehicleItemDot: {
    fontSize: 12,
    color: '#d1d5db',
  },
  vehicleItemOdo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  inactiveLabel: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
  },
});
