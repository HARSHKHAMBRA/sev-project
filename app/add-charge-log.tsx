import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Vehicle } from '@/types/database';

export default function AddChargeLogScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const vehicleId = params.vehicleId as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [kwh, setKwh] = useState('');
  const [cost, setCost] = useState('');
  const [odometer, setOdometer] = useState('');
  const [percentBefore, setPercentBefore] = useState('');
  const [percentAfter, setPercentAfter] = useState('');

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

      if (data.type !== 'ev') {
        Alert.alert('Error', 'This is not an electric vehicle');
        router.back();
        return;
      }

      setVehicle(data);
      setOdometer(data.current_odometer.toString());
    } catch (error: any) {
      Alert.alert('Error', error.message);
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!kwh || !cost || !odometer) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('ev_charge_logs').insert({
        vehicle_id: vehicleId,
        user_id: user?.id,
        kwh: parseFloat(kwh),
        cost: parseFloat(cost),
        odometer_reading: parseFloat(odometer),
        percent_before: percentBefore ? parseFloat(percentBefore) : null,
        percent_after: percentAfter ? parseFloat(percentAfter) : null,
      });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ current_odometer: parseFloat(odometer) })
        .eq('id', vehicleId);

      if (updateError) throw updateError;

      Alert.alert('Success', 'Charge log added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) {
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
        <Text style={styles.headerTitle}>Add Charge Log</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.vehicleModel}>{vehicle.model}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>
              Energy Added (kWh) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 45"
              placeholderTextColor="#9ca3af"
              value={kwh}
              onChangeText={setKwh}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Cost (₹) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 450"
              placeholderTextColor="#9ca3af"
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Odometer Reading (km) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Current odometer"
              placeholderTextColor="#9ca3af"
              value={odometer}
              onChangeText={setOdometer}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>Battery % Before</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 20"
                placeholderTextColor="#9ca3af"
                value={percentBefore}
                onChangeText={setPercentBefore}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.field, styles.halfField]}>
              <Text style={styles.label}>Battery % After</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 90"
                placeholderTextColor="#9ca3af"
                value={percentAfter}
                onChangeText={setPercentAfter}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Adding...' : 'Add Charge Log'}
            </Text>
          </TouchableOpacity>
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
  vehicleInfo: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  },
  form: {
    padding: 16,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  required: {
    color: '#ef4444',
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
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
