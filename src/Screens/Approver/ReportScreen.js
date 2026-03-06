/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import Share from 'react-native-share';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';
import ReactNativeBlobUtil from 'react-native-blob-util';

const EXPENSE_TYPES = ['Fuel', 'Hotel', 'Food', 'Travel', 'Medical', 'Other'];

const STATUS_CONFIG = {
  Pending: { color: '#F59E0B', bg: '#FFFBEB' },
  Approved: { color: '#34D399', bg: '#F0FFF8' },
  Rejected: { color: '#F87171', bg: '#FFF5F5' },
};

export default function ReportScreen(props) {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [generating, setGenerating] = useState(false);

  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;
  const previewSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatDate = date =>
    date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const formatAmount = amount =>
    parseFloat(amount || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const currentUserEmail = auth().currentUser?.email;

      const snap = await firestore().collectionGroup('expenses').get();

      // Filter by approverEmail and date range
      const filtered = await Promise.all(
        snap.docs
          .filter(doc => {
            const data = doc.data();
            if (data.approverEmail !== currentUserEmail) return false;

            const expDate = data.expenseDate?.toDate
              ? data.expenseDate.toDate()
              : new Date(data.expenseDate);

            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);

            return expDate >= from && expDate <= to;
          })
          .map(async doc => {
            const expense = { id: doc.id, ...doc.data() };
            try {
              const userDoc = await firestore()
                .collection('users')
                .doc(expense.userId)
                .get();
              const userData = userDoc.data();
              expense.employeeName = userData?.displayName || 'Unknown';
              expense.employeeEmail = userData?.email || '';
            } catch (e) {
              expense.employeeName = 'Unknown';
              expense.employeeEmail = '';
            }
            return expense;
          }),
      );

      filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      // ── Build preview summary ────────────────────────
      const totalAmount = filtered.reduce(
        (sum, e) => sum + (parseFloat(e.totalAmount) || 0),
        0,
      );

      // Status breakdown
      const statusBreakdown = { Pending: 0, Approved: 0, Rejected: 0 };
      filtered.forEach(e => {
        if (statusBreakdown[e.status] !== undefined) {
          statusBreakdown[e.status] += parseFloat(e.totalAmount) || 0;
        }
      });

      // Category breakdown
      const categoryBreakdown = {};
      EXPENSE_TYPES.forEach(t => {
        categoryBreakdown[t] = 0;
      });
      filtered.forEach(e => {
        e.entries?.forEach(entry => {
          const label = entry.type?.label || 'Other';
          if (categoryBreakdown[label] !== undefined) {
            categoryBreakdown[label] += parseFloat(entry.amount) || 0;
          } else {
            categoryBreakdown['Other'] += parseFloat(entry.amount) || 0;
          }
        });
      });

      // Employee breakdown
      const employeeBreakdown = {};
      filtered.forEach(e => {
        const name = e.employeeName;
        if (!employeeBreakdown[name]) employeeBreakdown[name] = 0;
        employeeBreakdown[name] += parseFloat(e.totalAmount) || 0;
      });

      const preview = {
        expenses: filtered,
        totalAmount,
        totalCount: filtered.length,
        statusBreakdown,
        categoryBreakdown,
        employeeBreakdown,
      };

      setPreviewData(preview);

      // Animate preview in
      Animated.parallel([
        Animated.timing(previewAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(previewSlide, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.log('Error fetching report data:', error);
      Alert.alert('Error', 'Failed to fetch report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = async () => {
    if (!previewData) return;

    try {
      setGenerating(true);
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is required to save the report. Please enable it in Settings.',
          [{ text: 'OK' }],
        );
        setGenerating(false);
        return;
      }
      const approverName = auth().currentUser?.displayName || 'Approver';
      const reportTitle = `Expense Report - ${formatDate(
        fromDate,
      )} to ${formatDate(toDate)}`;

      const wb = XLSX.utils.book_new();

      // ── Sheet 1: Summary ─────────────────────────────
      const summaryData = [
        [reportTitle],
        [],
        ['Generated By', approverName],
        ['Date Range', `${formatDate(fromDate)} to ${formatDate(toDate)}`],
        ['Generated On', formatDate(new Date())],
        [],
        ['OVERALL SUMMARY'],
        ['Total Expenses', previewData.totalCount],
        ['Total Amount (₹)', previewData.totalAmount.toFixed(2)],
        [],
        ['STATUS BREAKDOWN'],
        ['Status', 'Amount (₹)'],
        ['Pending', previewData.statusBreakdown.Pending.toFixed(2)],
        ['Approved', previewData.statusBreakdown.Approved.toFixed(2)],
        ['Rejected', previewData.statusBreakdown.Rejected.toFixed(2)],
        [],
        ['CATEGORY BREAKDOWN'],
        ['Category', 'Amount (₹)'],
        ...Object.entries(previewData.categoryBreakdown)
          .filter(([, v]) => v > 0)
          .map(([k, v]) => [k, v.toFixed(2)]),
        [],
        ['EMPLOYEE BREAKDOWN'],
        ['Employee', 'Total Amount (₹)'],
        ...Object.entries(previewData.employeeBreakdown).map(([k, v]) => [
          k,
          v.toFixed(2),
        ]),
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

      // ── Sheet 2: All Expenses ─────────────────────────
      const expenseRows = [
        [
          '#',
          'Date',
          'Employee',
          'Email',
          'Description',
          'Status',
          'Approver',
          'Total Amount (₹)',
          'Approved By',
        ],
        ...previewData.expenses.map((e, i) => {
          const expDate = e.expenseDate?.toDate
            ? e.expenseDate.toDate()
            : new Date(e.expenseDate);
          return [
            i + 1,
            expDate.toLocaleDateString('en-IN'),
            e.employeeName,
            e.employeeEmail,
            e.description || '',
            e.status,
            e.approver || '',
            parseFloat(e.totalAmount || 0).toFixed(2),
            e.approvedBy || '',
          ];
        }),
      ];

      const expenseSheet = XLSX.utils.aoa_to_sheet(expenseRows);
      expenseSheet['!cols'] = [
        { wch: 5 },
        { wch: 14 },
        { wch: 20 },
        { wch: 28 },
        { wch: 25 },
        { wch: 12 },
        { wch: 20 },
        { wch: 18 },
        { wch: 18 },
      ];
      XLSX.utils.book_append_sheet(wb, expenseSheet, 'All Expenses');

      // ── Sheet 3: Category Details ─────────────────────
      const categoryRows = [
        ['Employee', 'Date', 'Category', 'Amount (₹)', 'Status'],
      ];
      previewData.expenses.forEach(e => {
        const expDate = e.expenseDate?.toDate
          ? e.expenseDate.toDate()
          : new Date(e.expenseDate);
        e.entries?.forEach(entry => {
          categoryRows.push([
            e.employeeName,
            expDate.toLocaleDateString('en-IN'),
            entry.type?.label || 'Other',
            parseFloat(entry.amount || 0).toFixed(2),
            e.status,
          ]);
        });
      });

      const categorySheet = XLSX.utils.aoa_to_sheet(categoryRows);
      categorySheet['!cols'] = [
        { wch: 20 },
        { wch: 14 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, categorySheet, 'Category Details');

      // ── Save & Share ──────────────────────────────────
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const fileName = `StarTrack_Report_${
        fromDate.toISOString().split('T')[0]
      }_${toDate.toISOString().split('T')[0]}.xlsx`;

      // const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      // const filePath = `${RNFS.ExternalStorageDirectoryPath}/Download/${fileName}`;
      const cachePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;
      await ReactNativeBlobUtil.fs.writeFile(cachePath, wbout, 'base64');
      console.log('Saved to cache ✅:', cachePath);
      await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        {
          name: fileName,
          parentFolder: '',
          mimeType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        'Download',
        cachePath,
      );

      console.log('Moved to Downloads ✅');
      await ReactNativeBlobUtil.fs.unlink(cachePath);

      Alert.alert(
        '✅ Report Saved!',
        `File saved to Downloads folder:\n${fileName}`,
        [{ text: 'OK' }],
      );
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.log('Excel generation error:', error);
        Alert.alert('Error', 'Failed to generate report. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const requestStoragePermission = async () => {
    try {
      // Android 13+ doesn't need storage permission for Downloads
      if (Platform.OS === 'android' && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'StarTrack needs storage access to save the report.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      // Android 13+ — no permission needed
      return true;
    } catch (error) {
      console.log('Permission error:', error);
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MyStatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: headerAnim }], opacity: headerOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => props.navigation.goBack()}
        >
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expense Report</Text>
        <View style={styles.headerBtn} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date Range Card */}
        <View style={styles.dateCard}>
          <Text style={styles.dateCardTitle}>
            <Icon name="calendar-range" size={16} color="#E8453C" /> Select Date
            Range
          </Text>

          {/* Date Row — vertical layout */}
          <View style={styles.dateColumn}>
            {/* From Date */}
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowFromPicker(true)}
            >
              <View style={styles.dateBtnIcon}>
                <Icon name="calendar-start" size={18} color="#E8453C" />
              </View>
              <View style={styles.dateBtnTextWrap}>
                <Text style={styles.dateBtnLabel}>FROM</Text>
                <Text style={styles.dateBtnValue} numberOfLines={1}>
                  {formatDate(fromDate)}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Arrow */}
            <View style={styles.dateArrowDown}>
              <Icon name="arrow-down" size={16} color="#9CA3AF" />
            </View>

            {/* To Date */}
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowToPicker(true)}
            >
              <View style={styles.dateBtnIcon}>
                <Icon name="calendar-end" size={18} color="#E8453C" />
              </View>
              <View style={styles.dateBtnTextWrap}>
                <Text style={styles.dateBtnLabel}>TO</Text>
                <Text style={styles.dateBtnValue} numberOfLines={1}>
                  {formatDate(toDate)}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={fetchReportData}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="chart-box-outline" size={20} color="#fff" />
                <Text style={styles.generateBtnText}>Generate Preview</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Date Pickers */}
        {showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            maximumDate={toDate}
            onChange={(e, selected) => {
              setShowFromPicker(false);
              if (selected) setFromDate(selected);
            }}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            minimumDate={fromDate}
            maximumDate={new Date()}
            onChange={(e, selected) => {
              setShowToPicker(false);
              if (selected) setToDate(selected);
            }}
          />
        )}

        {/* Preview */}
        {previewData && (
          <Animated.View
            style={{
              opacity: previewAnim,
              transform: [{ translateY: previewSlide }],
            }}
          >
            {/* Summary Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderTopColor: '#E8453C' }]}>
                <Text style={styles.statNum}>{previewData.totalCount}</Text>
                <Text style={styles.statLabel}>Total Expenses</Text>
              </View>
              <View style={[styles.statCard, { borderTopColor: '#34D399' }]}>
                <Text style={[styles.statNum, { color: '#34D399' }]}>
                  ₹{formatAmount(previewData.totalAmount)}
                </Text>
                <Text style={styles.statLabel}>Total Amount</Text>
              </View>
            </View>

            {/* Status Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                <Icon name="chart-pie" size={14} color="#E8453C" /> Status
                Breakdown
              </Text>
              {Object.entries(previewData.statusBreakdown).map(
                ([status, amount]) => (
                  <View key={status} style={styles.breakdownRow}>
                    <View
                      style={[
                        styles.breakdownDot,
                        { backgroundColor: STATUS_CONFIG[status]?.color },
                      ]}
                    />
                    <Text style={styles.breakdownLabel}>{status}</Text>
                    <Text style={styles.breakdownAmount}>
                      ₹{formatAmount(amount)}
                    </Text>
                  </View>
                ),
              )}
            </View>

            {/* Category Breakdown */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                <Icon name="tag-multiple-outline" size={14} color="#E8453C" />{' '}
                Category Breakdown
              </Text>
              {Object.entries(previewData.categoryBreakdown)
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage =
                    previewData.totalAmount > 0
                      ? (amount / previewData.totalAmount) * 100
                      : 0;
                  return (
                    <View key={category}>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>{category}</Text>
                        <Text style={styles.breakdownAmount}>
                          ₹{formatAmount(amount)}
                        </Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${percentage}%` },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
            </View>

            {/* Export Button */}
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={generateExcel}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon name="microsoft-excel" size={22} color="#fff" />
                  <Text style={styles.exportBtnText}>Export to Excel</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.exportNote}>
              📁 File will be saved to Downloads folder and shared
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },
  scrollContent: {
    paddingHorizontal: normalise(16),
    paddingBottom: normalise(32),
  },

  // Header
  header: {
    backgroundColor: '#E8453C',
    paddingHorizontal: normalise(16),
    paddingVertical: normalise(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#E8453C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerTitle: { color: '#fff', fontSize: normalise(18), fontWeight: '700' },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Date Card
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: normalise(16),
    marginTop: normalise(16),
    marginBottom: normalise(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  dateCardTitle: {
    fontSize: normalise(14),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: normalise(14),
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalise(16),
  },
  dateArrow: { paddingHorizontal: normalise(8) },

  generateBtn: {
    backgroundColor: '#E8453C',
    borderRadius: 14,
    paddingVertical: normalise(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#E8453C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  generateBtnText: {
    color: '#fff',
    fontSize: normalise(15),
    fontWeight: '700',
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: normalise(12) },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: normalise(14),
    borderTopWidth: 3,
    elevation: 2,
    minHeight: normalise(90),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statNum: {
    fontSize: normalise(18),
    fontWeight: '800',
    color: '#E8453C',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  statLabel: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 4,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: normalise(16),
    marginBottom: normalise(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: normalise(13),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: normalise(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalise(6),
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: normalise(8),
  },
  breakdownLabel: {
    flex: 1,
    fontSize: normalise(13),
    color: '#374151',
    fontWeight: '600',
  },
  breakdownAmount: {
    fontSize: normalise(13),
    fontWeight: '800',
    color: '#1F2937',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    marginBottom: normalise(6),
  },
  progressFill: { height: 4, backgroundColor: '#E8453C', borderRadius: 2 },

  // Export Button
  exportBtn: {
    backgroundColor: '#1D6F42',
    borderRadius: 14,
    paddingVertical: normalise(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: normalise(8),
    elevation: 4,
    shadowColor: '#1D6F42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  exportBtnText: { color: '#fff', fontSize: normalise(16), fontWeight: '800' },
  exportNote: {
    textAlign: 'center',
    fontSize: normalise(12),
    color: '#9CA3AF',
    marginBottom: normalise(16),
  },
  dateColumn: {
    marginBottom: normalise(16),
    gap: 0,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: normalise(14),
    borderWidth: 1.5,
    borderColor: '#E8453C20',
    marginBottom: normalise(4),
  },
  dateBtnTextWrap: {
    flex: 1,
  },
  dateBtnLabel: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dateBtnValue: {
    fontSize: normalise(14),
    color: '#1F2937',
    fontWeight: '700',
    marginTop: 2,
  },
  dateBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateArrowDown: {
    alignItems: 'center',
    paddingVertical: normalise(4),
  },
});
