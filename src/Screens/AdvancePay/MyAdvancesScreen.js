/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Animated, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';

const STATUS_CONFIG = {
  Pending:  { color: '#F59E0B', bg: '#FFFBEB', icon: 'clock-outline' },
  Approved: { color: '#34D399', bg: '#F0FFF8', icon: 'check-circle-outline' },
  Rejected: { color: '#F87171', bg: '#FFF5F5', icon: 'close-circle-outline' },
};

const PAYMENT_CONFIG = {
  Unpaid:  { color: '#F87171', bg: '#FFF5F5' },
  Partial: { color: '#F59E0B', bg: '#FFFBEB' },
  Paid:    { color: '#34D399', bg: '#F0FFF8' },
};

// ── Advance Card ──────────────────────────────────────────────────────────
function AdvanceCard({ item, index }) {
  const slideAnim   = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim,   { toValue: 0, delay: index * 60, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const status        = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
  const payConfig     = PAYMENT_CONFIG[item.paymentStatus] || PAYMENT_CONFIG.Unpaid;
  const formatAmount  = amt => parseFloat(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const formatDate    = ts => {
    if (!ts) return 'N/A';
    try { return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return 'N/A'; }
  };

  const paidAmount    = item.paidAmount || 0;
  const displayAmount = item.approvedAmount ?? item.requestedAmount;
  const remaining     = displayAmount - paidAmount;
  const isAmountEdited = item.approvedAmount !== null && item.approvedAmount !== undefined && item.approvedAmount !== item.requestedAmount;

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpanded(prev => !prev)}
        activeOpacity={0.85}
      >
        {/* Top Row */}
        <View style={styles.cardTopRow}>
          {/* Reason Icon */}
          <View style={[styles.reasonIcon, { backgroundColor: (item.reasonColor || '#9CA3AF') + '20' }]}>
            <Icon name={item.reasonIcon || 'cash'} size={22} color={item.reasonColor || '#9CA3AF'} />
          </View>

          <View style={styles.cardTopMiddle}>
            <Text style={styles.reasonLabel}>{item.reason}</Text>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Icon name={status.icon} size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{item.status}</Text>
          </View>
        </View>

        {/* Amount Row */}
        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Requested</Text>
            <Text style={styles.amountValue}>₹{formatAmount(item.requestedAmount)}</Text>
          </View>

          {/* Arrow only if amount was edited */}
          {isAmountEdited && (
            <>
              <Icon name="arrow-right" size={16} color="#9CA3AF" />
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Approved</Text>
                <Text style={[styles.amountValue, { color: '#34D399' }]}>₹{formatAmount(item.approvedAmount)}</Text>
              </View>
            </>
          )}

          <View style={styles.amountDivider} />

          {/* Payment status — only show if approved */}
          {item.status === 'Approved' && (
            <View style={[styles.payBadge, { backgroundColor: payConfig.bg }]}>
              <Text style={[styles.payBadgeText, { color: payConfig.color }]}>{item.paymentStatus}</Text>
            </View>
          )}
        </View>

        {/* Progress bar — only if approved */}
        {item.status === 'Approved' && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${Math.min((paidAmount / displayAmount) * 100, 100)}%`,
              backgroundColor: paidAmount >= displayAmount ? '#34D399' : '#F59E0B',
            }]} />
          </View>
        )}

        {/* Paid / Remaining — only if approved */}
        {item.status === 'Approved' && (
          <View style={styles.paidRow}>
            <Text style={styles.paidText}>Paid: <Text style={{ color: '#34D399', fontWeight: '700' }}>₹{formatAmount(paidAmount)}</Text></Text>
            <Text style={styles.paidText}>Remaining: <Text style={{ color: remaining > 0 ? '#F87171' : '#34D399', fontWeight: '700' }}>₹{formatAmount(remaining)}</Text></Text>
          </View>
        )}

        {/* Approver row */}
        <View style={styles.approverRow}>
          <Icon name="account-outline" size={13} color="#9CA3AF" />
          <Text style={styles.approverText}>{item.approver}</Text>
          <Icon name="chevron-down" size={14} color={expanded ? '#E8453C' : '#9CA3AF'} style={{ marginLeft: 'auto', transform: [{ rotate: expanded ? '180deg' : '0deg' }] }} />
        </View>

        {/* Expanded Details */}
        {expanded && (
          <View style={styles.expandedSection}>
            <View style={styles.divider} />

            {item.description ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{item.description}</Text>
              </View>
            ) : null}

            {item.status === 'Rejected' && item.rejectionReason ? (
              <View style={[styles.rejectionBox]}>
                <Icon name="alert-circle-outline" size={14} color="#F87171" />
                <Text style={styles.rejectionText}>Rejection Reason: {item.rejectionReason}</Text>
              </View>
            ) : null}

            {item.approverNote ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Approver Note</Text>
                <Text style={styles.detailValue}>{item.approverNote}</Text>
              </View>
            ) : null}

            {item.lastPaymentMethod ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Payment</Text>
                <Text style={styles.detailValue}>
                  ₹{formatAmount(item.lastPaymentAmount)} via {item.lastPaymentMethod}
                </Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Submitted On</Text>
              <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────
export default function MyAdvancesScreen(props) {
  const [advances, setAdvances]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const headerAnim    = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAdvances();
    Animated.parallel([
      Animated.spring(headerAnim,    { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchAdvances = async () => {
    try {
      const uid  = auth().currentUser?.uid;
      const snap = await firestore()
        .collection('users').doc(uid)
        .collection('advances')
        .orderBy('createdAt', 'desc')
        .get();

      setAdvances(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.log('Error fetching advances:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAdvances();
  }, []);

  const FILTER_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

  const filteredAdvances = activeFilter === 'All'
    ? advances
    : advances.filter(a => a.status === activeFilter);

  // Stats
  const totalRequested = advances.reduce((sum, a) => sum + (a.requestedAmount || 0), 0);
  const totalApproved  = advances.filter(a => a.status === 'Approved').reduce((sum, a) => sum + (a.approvedAmount ?? a.requestedAmount ?? 0), 0);
  const totalPaid      = advances.reduce((sum, a) => sum + (a.paidAmount || 0), 0);
  const counts         = { Pending: 0, Approved: 0, Rejected: 0 };
  advances.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

  const renderHeader = () => (
    <View>
      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>₹{totalRequested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
          <Text style={styles.summaryLabel}>Requested</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#34D399' }]}>₹{totalApproved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
          <Text style={styles.summaryLabel}>Approved</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#6366F1' }]}>₹{totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
          <Text style={styles.summaryLabel}>Received</Text>
        </View>
      </View>

      {/* Status Pills */}
      <View style={styles.pillRow}>
        {Object.entries(counts).map(([status, count]) => (
          <View key={status} style={[styles.pill, { backgroundColor: STATUS_CONFIG[status].bg }]}>
            <Text style={[styles.pillText, { color: STATUS_CONFIG[status].color }]}>{count} {status}</Text>
          </View>
        ))}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab)}
          >
            <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <MyStatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View style={[styles.header, { transform: [{ translateY: headerAnim }], opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => props.navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Advances</Text>
          <Text style={styles.headerSubtitle}>{advances.length} total request{advances.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => props.navigation.navigate('RequestAdvance')}
        >
          <Icon name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8453C" />
          <Text style={styles.loadingText}>Loading advances...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAdvances}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => <AdvanceCard item={item} index={index} />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="cash-remove" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Advances Yet</Text>
              <Text style={styles.emptySubtitle}>Tap + to request an advance payment</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => props.navigation.navigate('RequestAdvance')}
              >
                <Icon name="plus" size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>Request Advance</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E8453C']} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  listContent: { paddingHorizontal: normalise(16), paddingBottom: normalise(32), flexGrow: 1 },

  // Header
  header: {
    backgroundColor: '#E8453C', paddingHorizontal: normalise(16), paddingVertical: normalise(14),
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 8,
    shadowColor: '#E8453C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  headerTitle: { color: '#fff', fontSize: normalise(18), fontWeight: '700', textAlign: 'center' },
  headerSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: normalise(11), textAlign: 'center' },
  headerBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  // Summary
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: normalise(16),
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: normalise(16), marginBottom: normalise(12),
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: normalise(16), fontWeight: '800', color: '#1F2937' },
  summaryLabel: { fontSize: normalise(11), color: '#9CA3AF', fontWeight: '600', marginTop: 4 },
  summaryDivider: { width: 1, height: 36, backgroundColor: '#E5E7EB' },

  // Pills
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: normalise(12) },
  pill: { paddingHorizontal: normalise(10), paddingVertical: normalise(5), borderRadius: 20 },
  pillText: { fontSize: normalise(11), fontWeight: '700' },

  // Filters
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: normalise(12) },
  filterTab: { flex: 1, paddingVertical: normalise(8), borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', alignItems: 'center' },
  filterTabActive: { backgroundColor: '#FFF0F0', borderColor: '#E8453C' },
  filterTabText: { fontSize: normalise(11), fontWeight: '600', color: '#9CA3AF' },
  filterTabTextActive: { color: '#E8453C', fontWeight: '700' },

  // Card
  cardWrapper: { marginBottom: normalise(10) },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: normalise(14),
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: normalise(12), gap: 10 },
  reasonIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTopMiddle: { flex: 1 },
  reasonLabel: { fontSize: normalise(14), fontWeight: '700', color: '#1F2937' },
  dateText: { fontSize: normalise(11), color: '#9CA3AF', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: normalise(8), paddingVertical: normalise(4), borderRadius: 20 },
  statusText: { fontSize: normalise(11), fontWeight: '700' },

  // Amount
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: normalise(8) },
  amountItem: {},
  amountLabel: { fontSize: normalise(10), color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' },
  amountValue: { fontSize: normalise(16), fontWeight: '800', color: '#1F2937', marginTop: 2 },
  amountDivider: { flex: 1 },
  payBadge: { paddingHorizontal: normalise(8), paddingVertical: normalise(3), borderRadius: 20 },
  payBadgeText: { fontSize: normalise(11), fontWeight: '700' },

  // Progress
  progressBar: { height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, marginBottom: normalise(6) },
  progressFill: { height: 4, borderRadius: 2 },
  paidRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: normalise(8) },
  paidText: { fontSize: normalise(11), color: '#9CA3AF' },

  // Approver
  approverRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  approverText: { fontSize: normalise(12), color: '#9CA3AF', fontWeight: '500' },

  // Expanded
  expandedSection: { marginTop: normalise(8) },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: normalise(10) },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: normalise(5) },
  detailLabel: { fontSize: normalise(12), color: '#9CA3AF', fontWeight: '600' },
  detailValue: { fontSize: normalise(12), color: '#374151', fontWeight: '600', flex: 1, textAlign: 'right' },
  rejectionBox: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF5F5', borderRadius: 10, padding: normalise(10), marginBottom: normalise(6) },
  rejectionText: { fontSize: normalise(12), color: '#F87171', fontWeight: '600', flex: 1 },

  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: normalise(60) },
  emptyTitle: { fontSize: normalise(16), fontWeight: '700', color: '#374151', marginTop: normalise(16) },
  emptySubtitle: { fontSize: normalise(13), color: '#9CA3AF', marginTop: normalise(6), marginBottom: normalise(20) },
  emptyBtn: { backgroundColor: '#E8453C', borderRadius: 12, paddingVertical: normalise(12), paddingHorizontal: normalise(20), flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 3 },
  emptyBtnText: { color: '#fff', fontSize: normalise(14), fontWeight: '700' },
});
