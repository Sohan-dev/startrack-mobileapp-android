/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Animated,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePicker from '@react-native-community/datetimepicker';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';

const FILTERS = [
  { label: 'All', value: 'All', color: '#6B7280', bg: '#F3F4F6' },
  { label: 'Pending', value: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Approved', value: 'Approved', color: '#34D399', bg: '#F0FFF8' },
  { label: 'Rejected', value: 'Rejected', color: '#F87171', bg: '#FFF5F5' },
];

const STATUS_CONFIG = {
  Pending: { color: '#F59E0B', bg: '#FFFBEB', icon: 'clock-outline' },
  Approved: { color: '#34D399', bg: '#F0FFF8', icon: 'check-circle-outline' },
  Rejected: { color: '#F87171', bg: '#FFF5F5', icon: 'close-circle-outline' },
};

// ── Expense Card ──────────────────────────────────────────────────────────
function ExpenseCard({ item, index }) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 50,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const status = item.status || 'Pending';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

  const formatDate = timestamp => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatAmount = amount => {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={styles.card}>
        <View
          style={[styles.accentBar, { backgroundColor: statusConfig.color }]}
        />
        <View style={styles.cardContent}>
          {/* Top Row */}
          <View style={styles.cardTopRow}>
            <View style={styles.avatarWrap}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: statusConfig.color + '20' },
                ]}
              >
                <Text
                  style={[styles.avatarText, { color: statusConfig.color }]}
                >
                  {item.employeeName?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.employeeInfo}>
                <Text style={styles.employeeName}>
                  {item.employeeName || 'Unknown'}
                </Text>
                <Text style={styles.employeeEmail} numberOfLines={1}>
                  {item.employeeEmail || ''}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
            >
              <Icon
                name={statusConfig.icon}
                size={12}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {status}
              </Text>
            </View>
          </View>

          {/* Amount Row */}
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountText}>
                ₹{formatAmount(item.totalAmount)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.expandBtn}
              onPress={() => setExpanded(!expanded)}
            >
              <Icon
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#E8453C"
              />
              <Text style={styles.expandText}>
                {expanded ? 'Less' : 'Details'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="calendar-outline" size={12} color="#9CA3AF" />
              <Text style={styles.infoText}>
                {formatDate(item.expenseDate)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="account-check-outline" size={12} color="#9CA3AF" />
              <Text style={styles.infoText} numberOfLines={1}>
                {item.approver || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="format-list-numbered" size={12} color="#9CA3AF" />
              <Text style={styles.infoText}>
                {item.entries?.length || 0} items
              </Text>
            </View>
          </View>

          {/* Description */}
          {item.description ? (
            <Text style={styles.description} numberOfLines={1}>
              📝 {item.description}
            </Text>
          ) : null}

          {/* Rejection Reason */}
          {status === 'Rejected' && item.rejectionReason ? (
            <View style={styles.rejectionWrap}>
              <Icon name="alert-circle-outline" size={13} color="#F87171" />
              <Text style={styles.rejectionText} numberOfLines={2}>
                {item.rejectionReason}
              </Text>
            </View>
          ) : null}

          {/* Expanded Entries */}
          {expanded && item.entries?.length > 0 && (
            <View style={styles.entriesExpanded}>
              <Text style={styles.entriesTitle}>Expense Breakdown</Text>
              {item.entries.map((entry, idx) => (
                <View key={idx} style={styles.entryItem}>
                  <View
                    style={[
                      styles.entryDot,
                      { backgroundColor: entry.type?.color || '#9CA3AF' },
                    ]}
                  />
                  <Text style={styles.entryType}>
                    {entry.type?.label || 'N/A'}
                  </Text>
                  <Text style={styles.entryAmount}>
                    ₹
                    {parseFloat(entry.amount || 0).toLocaleString('en-IN', {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Approved By */}
          {status === 'Approved' && item.approvedBy && (
            <View style={styles.approvedByWrap}>
              <Icon name="check-circle" size={13} color="#34D399" />
              <Text style={styles.approvedByText}>
                Approved by {item.approvedBy}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────
export default function AllExpensesScreen(props) {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Date filter
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAllExpenses();
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

  useEffect(() => {
    applyFilters();
  }, [expenses, activeFilter, fromDate, toDate]);

  const fetchAllExpenses = async () => {
    try {
      const currentUserEmail = auth().currentUser?.email;

      const snap = await firestore().collectionGroup('expenses').get();

      // Filter by approverEmail + fetch employee details
      const data = await Promise.all(
        snap.docs
          .filter(doc => doc.data().approverEmail === currentUserEmail)
          .map(async doc => {
            const expense = { id: doc.id, ...doc.data() };
            try {
              const uid = expense.userId;
              if (uid) {
                const userDoc = await firestore()
                  .collection('users')
                  .doc(uid)
                  .get();
                const userData = userDoc.data();
                expense.employeeName = userData?.displayName || 'Unknown';
                expense.employeeEmail = userData?.email || '';
                expense.employeeUid = uid;
              }
            } catch (e) {
              expense.employeeName = 'Unknown';
              expense.employeeEmail = '';
            }
            return expense;
          }),
      );

      // Sort by createdAt desc
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setExpenses(data);
    } catch (error) {
      console.log('Error fetching expenses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    // Status filter
    if (activeFilter !== 'All') {
      filtered = filtered.filter(e => e.status === activeFilter);
    }

    // Date range filter
    if (fromDate) {
      filtered = filtered.filter(e => {
        const expDate = e.expenseDate?.toDate
          ? e.expenseDate.toDate()
          : new Date(e.expenseDate);
        return expDate >= fromDate;
      });
    }
    if (toDate) {
      const toDateEnd = new Date(toDate);
      toDateEnd.setHours(23, 59, 59, 999);
      filtered = filtered.filter(e => {
        const expDate = e.expenseDate?.toDate
          ? e.expenseDate.toDate()
          : new Date(e.expenseDate);
        return expDate <= toDateEnd;
      });
    }

    setFilteredExpenses(filtered);
  };

  const clearDateFilter = () => {
    setFromDate(null);
    setToDate(null);
    setShowDateFilter(false);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllExpenses();
  }, []);

  const totalAmount = filteredExpenses.reduce(
    (sum, e) => sum + (parseFloat(e.totalAmount) || 0),
    0,
  );

  const formatDate = date =>
    date
      ? date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : 'Select';

  const renderHeader = () => (
    <View>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
          <Text style={styles.summaryLabel}>Total Amount</Text>
          <Text style={styles.summaryAmount}>
            ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.summaryCount}>
            {filteredExpenses.length} expense
            {filteredExpenses.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Quick Stats */}
        {/* <View style={styles.quickStats}>
          {FILTERS.slice(1).map(f => (
            <View key={f.value} style={styles.quickStatItem}>
              <Text style={[styles.quickStatNum, { color: f.color }]}>
                {expenses.filter(e => e.status === f.value).length}
              </Text>
              <Text style={styles.quickStatLabel}>{f.label}</Text>
            </View>
          ))}
        </View> */}
        <View style={styles.summaryIcon}>
          <Icon name="wallet-outline" size={36} color="#E8453C" />
        </View>
      </View>

      {/* Date Filter Row */}
      <TouchableOpacity
        style={styles.dateFilterBtn}
        onPress={() => setShowDateFilter(!showDateFilter)}
      >
        <Icon name="calendar-range" size={16} color="#E8453C" />
        <Text style={styles.dateFilterText}>
          {fromDate || toDate
            ? `${formatDate(fromDate)} → ${formatDate(toDate)}`
            : 'Filter by Date Range'}
        </Text>
        {(fromDate || toDate) && (
          <TouchableOpacity onPress={clearDateFilter}>
            <Icon name="close-circle" size={16} color="#F87171" />
          </TouchableOpacity>
        )}
        <Icon
          name={showDateFilter ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      {/* Date Pickers */}
      {showDateFilter && (
        <View style={styles.datePickerRow}>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => setShowFromPicker(true)}
          >
            <Icon name="calendar-start" size={15} color="#E8453C" />
            <Text style={styles.datePickerText}>
              From: {formatDate(fromDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => setShowToPicker(true)}
          >
            <Icon name="calendar-end" size={15} color="#E8453C" />
            <Text style={styles.datePickerText}>To: {formatDate(toDate)}</Text>
          </TouchableOpacity>
        </View>
      )}

      {showFromPicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          maximumDate={toDate || new Date()}
          onChange={(e, selected) => {
            setShowFromPicker(false);
            if (selected) setFromDate(selected);
          }}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          minimumDate={fromDate}
          maximumDate={new Date()}
          onChange={(e, selected) => {
            setShowToPicker(false);
            if (selected) setToDate(selected);
          }}
        />
      )}

      {/* Status Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => setActiveFilter(filter.value)}
            style={[
              styles.filterTab,
              activeFilter === filter.value && {
                backgroundColor: filter.bg,
                borderColor: filter.color,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.value && {
                  color: filter.color,
                  fontWeight: '700',
                },
              ]}
            >
              {filter.label}
            </Text>
            <Text
              style={[
                styles.filterCount,
                activeFilter === filter.value && { color: filter.color },
              ]}
            >
              {filter.value === 'All'
                ? expenses.length
                : expenses.filter(e => e.status === filter.value).length}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="file-document-outline" size={64} color="#E5E7EB" />
      <Text style={styles.emptyTitle}>No Expenses Found</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'All'
          ? 'No expenses assigned to you yet'
          : `No ${activeFilter} expenses found`}
      </Text>
      {(fromDate || toDate) && (
        <TouchableOpacity
          style={styles.clearFilterBtn}
          onPress={clearDateFilter}
        >
          <Text style={styles.clearFilterText}>Clear Date Filter</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>All Expenses</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={onRefresh}>
          <Icon name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8453C" />
          <Text style={styles.loadingText}>Fetching expenses...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <ExpenseCard item={item} index={index} />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E8453C']}
              tintColor="#E8453C"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: normalise(16),
    paddingBottom: normalise(24),
    flexGrow: 1,
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
  headerTitle: {
    color: '#fff',
    fontSize: normalise(18),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: normalise(16),
    marginTop: normalise(16),
    marginBottom: normalise(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  summaryLeft: { flex: 1 },
  summaryLabel: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryAmount: {
    fontSize: normalise(18),
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  summaryCount: {
    fontSize: normalise(12),
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  quickStats: { flexDirection: 'row', gap: 12 },
  quickStatItem: { alignItems: 'center' },
  quickStatNum: { fontSize: normalise(18), fontWeight: '800' },
  quickStatLabel: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },

  // Date Filter
  dateFilterBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: normalise(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: normalise(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dateFilterText: {
    flex: 1,
    fontSize: normalise(13),
    color: '#374151',
    fontWeight: '500',
  },
  datePickerRow: { flexDirection: 'row', gap: 8, marginBottom: normalise(8) },
  datePickerBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: normalise(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E8453C20',
    elevation: 1,
  },
  datePickerText: {
    fontSize: normalise(12),
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },

  // Filter Tabs
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: normalise(10) },
  filterTab: {
    flex: 1,
    paddingVertical: normalise(8),
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  filterText: { fontSize: normalise(10), fontWeight: '600', color: '#9CA3AF' },
  filterCount: {
    fontSize: normalise(13),
    fontWeight: '800',
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Card
  cardWrapper: { marginBottom: normalise(10) },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  accentBar: { width: 4, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  cardContent: { flex: 1, padding: normalise(14) },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalise(10),
  },
  avatarWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalise(8),
  },
  avatarText: { fontSize: normalise(16), fontWeight: '800' },
  employeeInfo: { flex: 1 },
  employeeName: {
    fontSize: normalise(14),
    fontWeight: '700',
    color: '#1F2937',
  },
  employeeEmail: { fontSize: normalise(11), color: '#9CA3AF', marginTop: 1 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalise(8),
    paddingVertical: normalise(4),
    borderRadius: 20,
    gap: 3,
  },
  statusText: { fontSize: normalise(11), fontWeight: '700' },

  // Amount Row
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalise(8),
  },
  amountLabel: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amountText: {
    fontSize: normalise(18),
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expandText: { fontSize: normalise(12), color: '#E8453C', fontWeight: '600' },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalise(6),
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  infoText: {
    fontSize: normalise(11),
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },

  description: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: normalise(6),
  },

  // Rejection
  rejectionWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: normalise(8),
    marginTop: normalise(4),
  },
  rejectionText: {
    fontSize: normalise(11),
    color: '#F87171',
    fontWeight: '500',
    flex: 1,
  },

  // Approved By
  approvedByWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: normalise(4),
  },
  approvedByText: {
    fontSize: normalise(11),
    color: '#34D399',
    fontWeight: '600',
  },

  // Expanded Entries
  entriesExpanded: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: normalise(10),
    marginTop: normalise(8),
  },
  entriesTitle: {
    fontSize: normalise(11),
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: normalise(6),
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalise(3),
    gap: 8,
  },
  entryDot: { width: 8, height: 8, borderRadius: 4 },
  entryType: {
    flex: 1,
    fontSize: normalise(13),
    color: '#374151',
    fontWeight: '600',
  },
  entryAmount: { fontSize: normalise(13), fontWeight: '700', color: '#1F2937' },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: normalise(60),
  },
  emptyTitle: {
    fontSize: normalise(16),
    fontWeight: '700',
    color: '#374151',
    marginTop: normalise(16),
  },
  emptySubtitle: {
    fontSize: normalise(13),
    color: '#9CA3AF',
    marginTop: normalise(6),
    textAlign: 'center',
    paddingHorizontal: normalise(32),
  },
  clearFilterBtn: {
    marginTop: normalise(16),
    backgroundColor: '#FFF0F0',
    paddingHorizontal: normalise(20),
    paddingVertical: normalise(10),
    borderRadius: 10,
  },
  clearFilterText: {
    color: '#E8453C',
    fontWeight: '700',
    fontSize: normalise(13),
  },
});
