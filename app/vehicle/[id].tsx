import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus, Fuel, Zap, Play } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Vehicle, Session, FuelLog, EVChargeLog } from '@/types/database';
import { getVehicleColor, getVehicleTypeLabel } from '@/utils/vehicleColors';

export default function VehicleDetailScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [chargeLogs, setChargeLogs] = useState<EVChargeLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vehicleId && user) {
      loadData();
    }
  }, [vehicleId, user]);

  const loadData = async () => {
    try {
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (vehicleError) throw vehicleError;
      setVehicle(vehicleData);

      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .not('end_time', 'is', null)
        .order('start_time', { ascending: false })
        .limit(10);

      setSessions(sessionsData || []);

      if (vehicleData?.type === 'ev') {
        const { data: chargeData } = await supabase
          .from('ev_charge_logs')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('log_date', { ascending: false })
          .limit(10);

        setChargeLogs(chargeData || []);
      } else {
        const { data: fuelData } = await supabase
          .from('fuel_logs')
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order('log_date', { ascending: false })
          .limit(10);

        setFuelLogs(fuelData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !vehicle) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const isEV = vehicle.type === 'ev';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{vehicle.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.vehicleCard,
            { borderLeftColor: getVehicleColor(vehicle.type), borderLeftWidth: 8 },
          ]}
        >
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.vehicleModel}>{vehicle.model}</Text>
          <Text style={styles.vehicleType}>{getVehicleTypeLabel(vehicle.type)}</Text>
          {vehicle.reg_no && (
            <Text style={styles.vehicleReg}>{vehicle.reg_no}</Text>
          )}
          <Text style={styles.vehicleOdometer}>
            {vehicle.current_odometer.toLocaleString()} km
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/start-ride?vehicleId=${vehicleId}`)}
          >
            <Play color="#10b981" size={24} />
            <Text style={styles.actionButtonText}>Start Ride</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              router.push(
                isEV
                  ? `/add-charge-log?vehicleId=${vehicleId}`
                  : `/add-fuel-log?vehicleId=${vehicleId}`
              )
            }
          >
            {isEV ? (
              <Zap color="#3b82f6" size={24} />
            ) : (
              <Fuel color="#f59e0b" size={24} />
            )}
            <Text style={styles.actionButtonText}>
              Add {isEV ? 'Charge' : 'Fuel'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Rides</Text>
          {sessions.length === 0 ? (
            <Text style={styles.emptyText}>No rides yet</Text>
          ) : (
            <View style={styles.list}>
              {sessions.map((session) => (
                <View key={session.id} style={styles.listItem}>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>
                      {session.distance_km.toFixed(1)} km
                    </Text>
                    <Text style={styles.listItemSubtitle}>
                      {new Date(session.start_time).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.pointsBadge}>
                    <Text style={styles.pointsText}>+{session.reward_points}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Recent {isEV ? 'Charges' : 'Fuel Fills'}
          </Text>
          {(isEV ? chargeLogs : fuelLogs).length === 0 ? (
            <Text style={styles.emptyText}>No logs yet</Text>
          ) : isEV ? (
            <View style={styles.list}>
              {chargeLogs.map((log) => (
                <View key={log.id} style={styles.listItem}>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{log.kwh.toFixed(1)} kWh</Text>
                    <Text style={styles.listItemSubtitle}>
                      {new Date(log.log_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.costText}>₹{log.cost.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.list}>
              {fuelLogs.map((log) => (
                <View key={log.id} style={styles.listItem}>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{log.liters.toFixed(1)} L</Text>
                    <Text style={styles.listItemSubtitle}>
                      {new Date(log.log_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.costText}>₹{log.cost.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  },
  vehicleCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  vehicleModel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  vehicleReg: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  vehicleOdometer: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  list: {
    gap: 8,
  },
  listItem: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  pointsBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  costText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
