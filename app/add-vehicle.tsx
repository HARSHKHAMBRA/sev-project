import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { VehicleType } from '@/types/database';
import { getVehicleColor, getVehicleTypeLabel } from '@/utils/vehicleColors';

const vehicleTypes: VehicleType[] = ['ev', 'cng', 'petrol', 'diesel'];

export default function AddVehicleScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<VehicleType>('petrol');
  const [model, setModel] = useState('');
  const [regNo, setRegNo] = useState('');
  const [odometerStart, setOdometerStart] = useState('');
  const [tankCapacity, setTankCapacity] = useState('');
  const [batteryCapacity, setBatteryCapacity] = useState('');
  const [expectedMileage, setExpectedMileage] = useState('');

  const handleSubmit = async () => {
    if (!name || !model || !odometerStart || !expectedMileage) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const vehicleData = {
        user_id: user?.id,
        name,
        type,
        model,
        reg_no: regNo || null,
        odometer_start: parseFloat(odometerStart),
        current_odometer: parseFloat(odometerStart),
        tank_capacity: tankCapacity ? parseFloat(tankCapacity) : null,
        battery_capacity_kwh: batteryCapacity ? parseFloat(batteryCapacity) : null,
        expected_mileage: parseFloat(expectedMileage),
        active: true,
      };

      const { error } = await supabase.from('vehicles').insert(vehicleData);

      if (error) throw error;

      Alert.alert('Success', 'Vehicle added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#111827" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Vehicle</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>
              Vehicle Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., My Tesla, Dad's Swift"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Vehicle Type <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.typeSelector}>
              {vehicleTypes.map((vehicleType) => (
                <TouchableOpacity
                  key={vehicleType}
                  style={[
                    styles.typeButton,
                    type === vehicleType && styles.typeButtonActive,
                    type === vehicleType && {
                      borderColor: getVehicleColor(vehicleType),
                    },
                  ]}
                  onPress={() => setType(vehicleType)}
                >
                  <View
                    style={[
                      styles.typeDot,
                      { backgroundColor: getVehicleColor(vehicleType) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      type === vehicleType && styles.typeTextActive,
                    ]}
                  >
                    {getVehicleTypeLabel(vehicleType)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Model <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Tesla Model 3, Maruti Swift"
              placeholderTextColor="#9ca3af"
              value={model}
              onChangeText={setModel}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Registration Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., DL 01 AB 1234"
              placeholderTextColor="#9ca3af"
              value={regNo}
              onChangeText={setRegNo}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Current Odometer (km) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5000"
              placeholderTextColor="#9ca3af"
              value={odometerStart}
              onChangeText={setOdometerStart}
              keyboardType="numeric"
            />
          </View>

          {type !== 'ev' && (
            <View style={styles.field}>
              <Text style={styles.label}>Tank Capacity (liters)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 45"
                placeholderTextColor="#9ca3af"
                value={tankCapacity}
                onChangeText={setTankCapacity}
                keyboardType="numeric"
              />
            </View>
          )}

          {type === 'ev' && (
            <View style={styles.field}>
              <Text style={styles.label}>Battery Capacity (kWh)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 75"
                placeholderTextColor="#9ca3af"
                value={batteryCapacity}
                onChangeText={setBatteryCapacity}
                keyboardType="numeric"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>
              Expected Mileage ({type === 'ev' ? 'km/kWh' : 'km/L'}){' '}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={type === 'ev' ? 'e.g., 6' : 'e.g., 18'}
              placeholderTextColor="#9ca3af"
              value={expectedMileage}
              onChangeText={setExpectedMileage}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
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
  form: {
    padding: 16,
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#f9fafb',
  },
  typeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  typeTextActive: {
    color: '#111827',
    fontWeight: '600',
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
