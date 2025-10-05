import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { MonthlyReport, Vehicle } from '@/types/database';
import { getVehicleColor, getVehicleTypeLabel } from '@/utils/vehicleColors';

export default function ReportsScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState<(MonthlyReport & { vehicle?: Vehicle })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    try {
      const { data: reportsData, error: reportsError } = await supabase
        .from('monthly_reports')
        .select('*, vehicles(*)')
        .eq('user_id', user?.id)
        .order('report_month', { ascending: false })
        .limit(10);

      if (reportsError) throw reportsError;

      const formattedReports = reportsData?.map((report: any) => ({
        ...report,
        vehicle: report.vehicles,
      })) || [];

      setReports(formattedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
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
        <Text style={styles.headerTitle}>Monthly Reports</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No reports available yet</Text>
            <Text style={styles.emptySubtext}>
              Complete rides to generate monthly reports
            </Text>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ReportCard({ report }: { report: MonthlyReport & { vehicle?: Vehicle } }) {
  const vehicleColor = report.vehicle ? getVehicleColor(report.vehicle.type) : '#6b7280';
  const isEV = report.vehicle?.type === 'ev';

  return (
    <View style={styles.reportCard}>
      <View style={[styles.reportBar, { backgroundColor: vehicleColor }]} />
      <View style={styles.reportContent}>
        <Text style={styles.reportMonth}>{formatMonth(report.report_month)}</Text>
        <Text style={styles.reportVehicle}>
          {report.vehicle?.name || 'Unknown Vehicle'}
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>
              {report.total_distance_km.toFixed(0)} km
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rides</Text>
            <Text style={styles.statValue}>{report.session_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{isEV ? 'Energy' : 'Fuel'}</Text>
            <Text style={styles.statValue}>
              {isEV
                ? `${report.total_ev_kwh.toFixed(1)} kWh`
                : `${report.total_fuel_liters.toFixed(1)} L`}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Cost</Text>
            <Text style={styles.statValue}>
              ₹{(isEV ? report.total_ev_cost : report.total_fuel_cost).toFixed(0)}
            </Text>
          </View>
        </View>

        <View style={styles.reportFooter}>
          <View style={styles.mileageBadge}>
            <Text style={styles.mileageLabel}>Avg Mileage</Text>
            <Text style={styles.mileageValue}>
              {report.avg_mileage.toFixed(1)} {isEV ? 'km/kWh' : 'km/L'}
            </Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsValue}>+{report.total_reward_points}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  reportsList: {
    padding: 16,
    gap: 16,
  },
  reportCard: {
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
  reportBar: {
    width: 6,
  },
  reportContent: {
    flex: 1,
    padding: 20,
  },
  reportMonth: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reportVehicle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    width: '45%',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  mileageBadge: {
    flex: 1,
  },
  mileageLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  mileageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  pointsBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  pointsLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
});
