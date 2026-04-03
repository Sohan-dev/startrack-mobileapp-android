/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Alert,
  Animated,
  Modal,
  FlatList,
} from 'react-native';
import MyStatusBar from '../../Utils/StatusBar';
import normalise from '../../Utils/Dimen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import XLSX from 'xlsx';
import RNFS from '@dr.pogodin/react-native-fs';
import Share from 'react-native-share';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReactNativeBlobUtil from 'react-native-blob-util';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = date =>
  date
    ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}/${date.getFullYear()}`
    : '—';

const formatDateForFileName = date =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

const toDate = ts => {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

// ─── Firebase Fetchers ───────────────────────────────────────────────────────

const fetchEmployees = async () => {
  const snap = await firestore()
    .collection('users')
    .where('role', '==', 'employee')
    .get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const fetchExpenses = async (employeeId, startDate, endDate) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  let query = firestore()
    .collection('users')
    .doc(employeeId)
    .collection('expenses')
    .where('status', '==', 'Approved');

  const snap = await query.get();
  const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  return all.filter(expense => {
    const d = toDate(expense.expenseDate || expense.createdAt);
    return d && d >= start && d <= end;
  });
};

// ─── Excel Generator ─────────────────────────────────────────────────────────

const generateExcel = async (expenses, employeeName, startDate, endDate) => {
  const wb = XLSX.utils.book_new();

  // Header row
  const headers = [
    'Date',
    'Employee Name',
    'Description',
    'Expense Type',
    'Amount (₹)',
    'Total Amount (₹)',
    'Advance Deducted (₹)',
    'Net Payable (₹)',
    'Advance Taken',
    'Status',
  ];

  const rows = [headers];

  let grandTotal = 0;
  let grandAdvance = 0;
  let grandNet = 0;

  expenses.forEach(expense => {
    const date = toDate(expense.expenseDate || expense.createdAt);
    const dateStr = date ? formatDate(date) : '—';
    const hasAdvance =
      expense.advanceIds && expense.advanceIds.length > 0 ? 'Yes' : 'No';

    const entries = expense.entries || [];

    if (entries.length === 0) {
      rows.push([
        dateStr,
        employeeName,
        '—',
        '—',
        0,
        parseFloat(expense.totalAmount || 0),
        parseFloat(expense.advanceDeducted || 0),
        parseFloat(expense.netPayable || 0),
        hasAdvance,
        expense.status || '—',
      ]);
    } else {
      entries.forEach((entry, idx) => {
        rows.push([
          idx === 0 ? dateStr : '',
          idx === 0 ? employeeName : '',
          entry.description || entry.note || '—',
          entry.type || entry.expenseType || '—',
          parseFloat(entry.amount || 0),
          idx === 0 ? parseFloat(expense.totalAmount || 0) : '',
          idx === 0 ? parseFloat(expense.advanceDeducted || 0) : '',
          idx === 0 ? parseFloat(expense.netPayable || 0) : '',
          idx === 0 ? hasAdvance : '',
          idx === 0 ? expense.status || '—' : '',
        ]);
      });
    }

    grandTotal += parseFloat(expense.totalAmount || 0);
    grandAdvance += parseFloat(expense.advanceDeducted || 0);
    grandNet += parseFloat(expense.netPayable || 0);
  });

  // Empty row before summary
  rows.push(['', '', '', '', '', '', '', '', '', '']);

  // Summary row
  rows.push([
    'SUMMARY',
    '',
    '',
    '',
    '',
    `₹${grandTotal.toFixed(2)}`,
    `₹${grandAdvance.toFixed(2)}`,
    `₹${grandNet.toFixed(2)}`,
    '',
    '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 12 },
    { wch: 22 },
    { wch: 28 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 14 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Expense Report');

  const wbOut = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const safeName = employeeName.replace(/\s+/g, '_');
  const fileName = `Expense_Report_${safeName}_${formatDateForFileName(
    startDate,
  )}_${formatDateForFileName(endDate)}.xlsx`;

  // ✅ Write to a temp path first
  const tempPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${fileName}`;
  await ReactNativeBlobUtil.fs.writeFile(tempPath, wbOut, 'base64');

  await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
    {
      name: fileName,
      parentFolder: 'Download',
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    'Download',
    tempPath,
  );

  // ✅ Clean up temp file
  await ReactNativeBlobUtil.fs.unlink(tempPath).catch(() => {});

  console.log(tempPath);

  // Return temp path for sharing (still accessible during this session)
  return { filePath: tempPath, fileName };
};

// ─── Permission Handler ───────────────────────────────────────────────────────

const requestStoragePermission = async () => {
  if (Platform.Version >= 33) return true; // Android 13+ no permission needed

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
      title: 'Storage Permission',
      message: 'App needs storage permission to save the report.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

// ─── Dropdown Component ───────────────────────────────────────────────────────

function EmployeeDropdown({ employees, selected, onSelect }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.dropdownBtn}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Icon name="account-outline" size={18} color="#E8453C" />
        <Text
          style={[styles.dropdownBtnText, !selected && { color: '#9CA3AF' }]}
        >
          {selected
            ? selected.displayName || selected.email
            : 'Select Employee'}
        </Text>
        <Icon name="chevron-down" size={18} color="#6B7280" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownHeaderText}>Select Employee</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={employees}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selected?.id === item.id && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                >
                  <View style={styles.dropdownAvatar}>
                    <Text style={styles.dropdownAvatarText}>
                      {(item.displayName || item.email || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropdownItemName}>
                      {item.displayName || 'No Name'}
                    </Text>
                    <Text style={styles.dropdownItemEmail}>{item.email}</Text>
                  </View>
                  {selected?.id === item.id && (
                    <Icon name="check-circle" size={18} color="#E8453C" />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No employees found</Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({ expenses }) {
  const totalAmount = expenses.reduce(
    (s, e) => s + parseFloat(e.totalAmount || 0),
    0,
  );
  const totalAdvance = expenses.reduce(
    (s, e) => s + parseFloat(e.advanceDeducted || 0),
    0,
  );
  const totalNet = expenses.reduce(
    (s, e) => s + parseFloat(e.netPayable || 0),
    0,
  );

  const items = [
    {
      label: 'Total Expenses',
      value: totalAmount,
      color: '#E8453C',
      icon: 'receipt',
    },
    {
      label: 'Advance Deducted',
      value: totalAdvance,
      color: '#F59E0B',
      icon: 'minus-circle-outline',
    },
    {
      label: 'Net Payable',
      value: totalNet,
      color: '#10B981',
      icon: 'check-circle-outline',
    },
  ];

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>
        <Icon name="chart-bar" size={14} color="#E8453C" /> Preview Summary
      </Text>
      <View style={styles.summaryRow}>
        {items.map(item => (
          <View key={item.label} style={styles.summaryItem}>
            <View
              style={[
                styles.summaryIconWrap,
                { backgroundColor: item.color + '15' },
              ]}
            >
              <Icon name={item.icon} size={16} color={item.color} />
            </View>
            <Text style={[styles.summaryAmount, { color: item.color }]}>
              ₹
              {item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.summaryCount}>
        <Icon name="file-multiple-outline" size={13} color="#6B7280" />
        <Text style={styles.summaryCountText}>
          {expenses.length} expense record{expenses.length !== 1 ? 's' : ''}{' '}
          found
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ReportGenerationScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [previewExpenses, setPreviewExpenses] = useState([]);
  const [previewing, setPreviewing] = useState(false);
  const [hasPreviewed, setHasPreviewed] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    fetchEmployees()
      .then(setEmployees)
      .catch(e => console.log('Fetch employees error:', e))
      .finally(() => setLoadingEmployees(false));
  }, []);

  const handlePreview = async () => {
    if (!selectedEmployee) {
      Alert.alert('Missing Info', 'Please select an employee.');
      return;
    }
    if (startDate > endDate) {
      Alert.alert('Invalid Range', 'Start date must be before end date.');
      return;
    }
    setPreviewing(true);
    try {
      const data = await fetchExpenses(selectedEmployee.id, startDate, endDate);
      setPreviewExpenses(data);
      setHasPreviewed(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch expenses. Please try again.');
      console.log(e);
    } finally {
      setPreviewing(false);
    }
  };

  // const handleGenerate = async () => {
  //   if (!hasPreviewed) {
  //     Alert.alert(
  //       'Preview First',
  //       'Please preview data before generating the report.',
  //     );
  //     return;
  //   }
  //   if (previewExpenses.length === 0) {
  //     Alert.alert(
  //       'No Data',
  //       'No approved expenses found for the selected filters.',
  //     );
  //     return;
  //   }

  //   const hasPermission = await requestStoragePermission();
  //   if (!hasPermission) {
  //     Alert.alert(
  //       'Permission Denied',
  //       'Storage permission is required to save the report.',
  //     );
  //     return;
  //   }

  //   setGenerating(true);
  //   try {
  //     const { filePath, fileName } = await generateExcel(
  //       previewExpenses,
  //       selectedEmployee.displayName || selectedEmployee.email,
  //       startDate,
  //       endDate,
  //     );

  //     Alert.alert('✅ Report Saved!', `File saved to Downloads:\n${fileName}`, [
  //       {
  //         text: 'Share',
  //         onPress: () =>
  //           Share.open({
  //             url: `file://${filePath}`, // Android always needs file:// prefix
  //             type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //             title: fileName,
  //           }).catch(error => {
  //             console.log(error);
  //           }),
  //       },
  //       { text: 'OK', style: 'cancel' },
  //     ]);
  //   } catch (e) {
  //     Alert.alert('Error', 'Failed to generate report. Please try again.');
  //     console.log('Generate error:', e);
  //   } finally {
  //     setGenerating(false);
  //   }
  // };

  const handleGenerate = async () => {
    if (!hasPreviewed || previewExpenses.length === 0) {
      Alert.alert(
        'No Data',
        'No approved expenses found for the selected filters.',
      );
      return;
    }

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to save the report.',
      );
      return;
    }

    setGenerating(true);
    try {
      const { filePath, fileName } = await generateExcel(
        previewExpenses,
        selectedEmployee.displayName || selectedEmployee.email,
        startDate,
        endDate,
      );

      Alert.alert('✅ Report Saved!', `File saved to Downloads:\n${fileName}`, [
        {
          text: 'Share',
          onPress: async () => {
            try {
              // Share the temp file using wildcard MIME
              await ReactNativeBlobUtil.android.actionViewIntent(
                filePath, // use the temp cache path for sharing
                '*/*',
              );
            } catch (e) {
              Alert.alert(
                '✅ File Saved',
                `Report saved to Downloads:\n${fileName}\n\nOpen your Files app to share it.`,
                [{ text: 'OK' }],
              );
            }
          },
        },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to generate report. Please try again.');
      console.log('Generate error:', e);
    } finally {
      setGenerating(false);
    }
  };
  const isReady = selectedEmployee && startDate && endDate;

  return (
    <View style={styles.container}>
      <MyStatusBar barStyle="light-content" backgroundColor="#E8453C" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Generate Report</Text>
          <Text style={styles.headerSub}>Export expense data to Excel</Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Icon name="microsoft-excel" size={24} color="#fff" />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Employee Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              <Icon name="account-search-outline" size={13} color="#E8453C" />{' '}
              Employee
            </Text>
            {loadingEmployees ? (
              <View style={styles.dropdownBtn}>
                <ActivityIndicator size="small" color="#E8453C" />
                <Text style={[styles.dropdownBtnText, { color: '#9CA3AF' }]}>
                  Loading employees...
                </Text>
              </View>
            ) : (
              <EmployeeDropdown
                employees={employees}
                selected={selectedEmployee}
                onSelect={emp => {
                  setSelectedEmployee(emp);
                  setHasPreviewed(false);
                  setPreviewExpenses([]);
                }}
              />
            )}
          </View>

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              <Icon name="calendar-range" size={13.5} color="#E8453C" /> Date
              Range
            </Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowStartPicker(true)}
                activeOpacity={0.8}
              >
                <Icon name="calendar-start" size={18} color="#E8453C" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateBtnLabel}>From</Text>
                  <Text style={styles.dateBtnValue}>
                    {formatDate(startDate)}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.dateSeparator}>
                <Icon name="arrow-right" size={16} color="#D1D5DB" />
              </View>

              <TouchableOpacity
                style={styles.dateBtn}
                onPress={() => setShowEndPicker(true)}
                activeOpacity={0.8}
              >
                <Icon name="calendar-end" size={18} color="#E8453C" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.dateBtnLabel}>To</Text>
                  <Text style={styles.dateBtnValue}>{formatDate(endDate)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={endDate}
              onChange={(_, date) => {
                setShowStartPicker(false);
                if (date) {
                  setStartDate(date);
                  setHasPreviewed(false);
                  setPreviewExpenses([]);
                }
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={startDate}
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowEndPicker(false);
                if (date) {
                  setEndDate(date);
                  setHasPreviewed(false);
                  setPreviewExpenses([]);
                }
              }}
            />
          )}

          {/* Quick Range Chips */}
          <View style={styles.chipRow}>
            {[
              {
                label: 'This Month',
                onPress: () => {
                  const s = new Date();
                  s.setDate(1);
                  setStartDate(s);
                  setEndDate(new Date());
                  setHasPreviewed(false);
                },
              },
              {
                label: 'Last Month',
                onPress: () => {
                  const s = new Date();
                  s.setMonth(s.getMonth() - 1);
                  s.setDate(1);
                  const e = new Date();
                  e.setDate(0);
                  setStartDate(s);
                  setEndDate(e);
                  setHasPreviewed(false);
                },
              },
              {
                label: 'Last 3 Months',
                onPress: () => {
                  const s = new Date();
                  s.setMonth(s.getMonth() - 3);
                  s.setDate(1);
                  setStartDate(s);
                  setEndDate(new Date());
                  setHasPreviewed(false);
                },
              },
            ].map(chip => (
              <TouchableOpacity
                key={chip.label}
                style={styles.chip}
                onPress={chip.onPress}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Preview Button */}
          <TouchableOpacity
            style={[styles.previewBtn, !isReady && styles.btnDisabled]}
            onPress={handlePreview}
            disabled={!isReady || previewing}
            activeOpacity={0.85}
          >
            {previewing ? (
              <ActivityIndicator size="small" color="#E8453C" />
            ) : (
              <Icon name="eye-outline" size={18} color="#E8453C" />
            )}
            <Text style={styles.previewBtnText}>
              {previewing ? 'Fetching Data...' : 'Preview Data'}
            </Text>
          </TouchableOpacity>

          {/* Summary Preview */}
          {hasPreviewed && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <SummaryCard expenses={previewExpenses} />
            </Animated.View>
          )}

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateBtn,
              (!hasPreviewed || previewExpenses.length === 0) &&
                styles.btnDisabledSolid,
            ]}
            onPress={handleGenerate}
            disabled={
              generating || !hasPreviewed || previewExpenses.length === 0
            }
            activeOpacity={0.85}
          >
            {generating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="microsoft-excel" size={20} color="#fff" />
            )}
            <Text style={styles.generateBtnText}>
              {generating ? 'Generating...' : 'Generate Excel Report'}
            </Text>
          </TouchableOpacity>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Icon name="information-outline" size={14} color="#6B7280" />
            <Text style={styles.infoNoteText}>
              Only <Text style={{ fontWeight: '700' }}>Approved</Text> expenses
              are included in the report. File will be saved to your Downloads
              folder.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },

  // Header
  header: {
    backgroundColor: '#E8453C',
    paddingHorizontal: normalise(16),
    paddingTop: normalise(12),
    paddingBottom: normalise(18),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#E8453C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: normalise(18), fontWeight: '700' },
  headerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: normalise(11),
    marginTop: 1,
  },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Sections
  section: {
    marginHorizontal: normalise(16),
    marginTop: normalise(20),
  },
  sectionLabel: {
    fontSize: normalise(11.5),
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: normalise(8),
  },

  // Dropdown
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: normalise(14),
    paddingVertical: normalise(14),
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dropdownBtnText: {
    flex: 1,
    fontSize: normalise(14),
    color: '#1F2937',
    fontWeight: '500',
  },

  // Dropdown Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dropdownModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '65%',
    paddingBottom: 20,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownHeaderText: {
    fontSize: normalise(16),
    fontWeight: '700',
    color: '#1F2937',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  dropdownItemActive: {
    backgroundColor: '#FFF5F5',
  },
  dropdownAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8453C15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownAvatarText: {
    fontSize: normalise(15),
    fontWeight: '800',
    color: '#E8453C',
  },
  dropdownItemName: {
    fontSize: normalise(14),
    fontWeight: '600',
    color: '#1F2937',
  },
  dropdownItemEmail: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    marginTop: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: normalise(13),
    padding: 24,
  },

  // Date
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: normalise(12),
    paddingVertical: normalise(12),
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dateBtnLabel: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateBtnValue: {
    fontSize: normalise(11.5),
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 1,
  },
  dateSeparator: {
    paddingHorizontal: 2,
  },

  // Quick Range Chips
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: normalise(16),
    marginTop: normalise(12),
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E8453C30',
    elevation: 1,
  },
  chipText: {
    fontSize: normalise(12),
    fontWeight: '600',
    color: '#E8453C',
  },

  // Buttons
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: normalise(16),
    marginTop: normalise(20),
    paddingVertical: normalise(14),
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E8453C',
    elevation: 2,
  },
  previewBtnText: {
    fontSize: normalise(15),
    fontWeight: '700',
    color: '#E8453C',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: normalise(16),
    marginTop: normalise(12),
    paddingVertical: normalise(16),
    borderRadius: 14,
    backgroundColor: '#E8453C',
    elevation: 4,
    shadowColor: '#E8453C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  generateBtnText: {
    fontSize: normalise(15),
    fontWeight: '700',
    color: '#fff',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnDisabledSolid: {
    backgroundColor: '#D1D5DB',
    shadowColor: 'transparent',
    elevation: 0,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: normalise(16),
    marginTop: normalise(16),
    borderRadius: 16,
    padding: normalise(16),
    borderWidth: 1.5,
    borderColor: '#E8453C20',
    elevation: 3,
    shadowColor: '#E8453C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: normalise(12),
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: normalise(14),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: normalise(15),
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  summaryCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: normalise(12),
    paddingTop: normalise(10),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  summaryCountText: {
    fontSize: normalise(12),
    color: '#6B7280',
    fontWeight: '500',
  },

  // Info note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: normalise(16),
    marginTop: normalise(16),
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: normalise(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoNoteText: {
    flex: 1,
    fontSize: normalise(12),
    color: '#6B7280',
    lineHeight: 18,
  },
});
