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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';
import { EXPENSE_NAVIGATION } from '../../Navigation/route_names';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

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

function ExpenseCard({ item, index }) {
  console.log(item, 'THis is ITEM');
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 60,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const status = item.status || 'Pending';
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

  const formatDate = timestamp => {
    if (!timestamp) return 'N/A';
    try {
      // Handle Firestore Timestamp
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
    return num.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <MyStatusBar barStyle="light-content" backgroundColor={'#E8453C'} />
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(EXPENSE_NAVIGATION.my_expense_edit_screen, {
            expense: item,
          })
        }
        activeOpacity={0.85}
      >
        <View style={styles.card}>
          {/* Left accent bar */}
          <View
            style={[styles.accentBar, { backgroundColor: statusConfig.color }]}
          />

          <View style={styles.cardContent}>
            {/* Top Row */}
            <View style={styles.cardTopRow}>
              {/* Amount */}
              <View>
                <Text style={styles.amountLabel}>Total Amount</Text>
                <Text style={styles.amountText}>
                  ₹{formatAmount(item.totalAmount)}
                </Text>
              </View>

              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusConfig.bg },
                ]}
              >
                <Icon
                  name={statusConfig.icon}
                  size={13}
                  color={statusConfig.color}
                />
                <Text
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {status}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Bottom Row */}
            <View style={styles.cardBottomRow}>
              {/* Date */}
              <View style={styles.infoItem}>
                <Icon name="calendar-outline" size={13} color="#9CA3AF" />
                <Text style={styles.infoText}>
                  {formatDate(item.expenseDate)}
                </Text>
              </View>

              {/* Approver */}
              <View style={styles.infoItem}>
                <Icon name="account-check-outline" size={13} color="#9CA3AF" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.approver || 'Not assigned'}
                </Text>
              </View>
            </View>

            {/* Description */}
            {item.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {item.description}
              </Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MyExpenses(props) {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchExpenses();
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
    applyFilter(activeFilter);
  }, [expenses, activeFilter]);

  const fetchExpenses = async () => {
    try {
      const uid = auth().currentUser?.uid;
      if (!uid) return;

      const snap = await firestore()
        .collection('users')
        .doc(uid)
        .collection('expenses')
        .orderBy('createdAt', 'desc')
        .get();

      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(data);
    } catch (error) {
      console.log('Error fetching expenses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = filter => {
    if (filter === 'All') {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(expenses.filter(e => e.status === filter));
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExpenses();
  }, []);

  const totalAmount = filteredExpenses.reduce(
    (sum, e) => sum + (parseFloat(e.totalAmount) || 0),
    0,
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="file-document-outline" size={64} color="#E5E7EB" />
      <Text style={styles.emptyTitle}>No Expenses Found</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'All'
          ? 'You have not added any expenses yet'
          : `No ${activeFilter} expenses found`}
      </Text>
    </View>
  );

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
        <View style={styles.summaryIcon}>
          <Icon name="wallet-outline" size={36} color="#E8453C" />
        </View>
      </View>

      {/* Filter Tabs */}
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
            {activeFilter === filter.value && (
              <View
                style={[styles.filterDot, { backgroundColor: filter.color }]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <MyStatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: headerAnim }],
            opacity: headerOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => props.navigation.goBack()}
        >
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Expenses</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onRefresh}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
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
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // List
  listContent: {
    paddingHorizontal: normalise(16),
    paddingBottom: normalise(24),
    flexGrow: 1,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: normalise(18),
    marginTop: normalise(16),
    marginBottom: normalise(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  summaryAmount: {
    fontSize: normalise(26),
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
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    marginTop: normalise(16),
    marginBottom: normalise(8),
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: normalise(8),
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  filterText: {
    fontSize: normalise(11),
    fontWeight: '600',
    color: '#9CA3AF',
  },
  filterDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  // Expense Card
  cardWrapper: {
    marginBottom: normalise(10),
  },
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
  accentBar: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardContent: {
    flex: 1,
    padding: normalise(14),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  amountLabel: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amountText: {
    fontSize: normalise(20),
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalise(8),
    paddingVertical: normalise(4),
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: normalise(11),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: normalise(10),
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  infoText: {
    fontSize: normalise(11),
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  description: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    marginTop: normalise(6),
    fontStyle: 'italic',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: normalise(80),
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
});
