/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Animated, RefreshControl, Alert,
  TextInput, Modal, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';

const PAYMENT_METHODS = [
  { id: 'cash',       label: 'Cash',        icon: 'cash',                color: '#34D399' },
  { id: 'upi',        label: 'UPI',          icon: 'contactless-payment', color: '#6366F1' },
  { id: 'netbanking', label: 'Net Banking',  icon: 'bank-outline',        color: '#3B82F6' },
];

const PAYMENT_STATUS_CONFIG = {
  Unpaid:  { color: '#F87171', bg: '#FFF5F5' },
  Partial: { color: '#F59E0B', bg: '#FFFBEB' },
  Paid:    { color: '#34D399', bg: '#F0FFF8' },
};

// ── Pay Modal ─────────────────────────────────────────────────────────────
const PayModal = ({ visible, advance, onClose, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [amount, setAmount]               = useState('');
  const [reference, setReference]         = useState('');
  const [note, setNote]                   = useState('');

  useEffect(() => {
    if (visible && advance) {
      const remaining = (advance.approvedAmount ?? advance.requestedAmount) - (advance.paidAmount || 0);
      setAmount(remaining.toFixed(2));
      setPaymentMethod(null);
      setReference('');
      setNote('');
    }
  }, [visible, advance]);

  if (!advance) return null;

  const approvedAmt  = advance.approvedAmount ?? advance.requestedAmount;
  const paidAmt      = advance.paidAmount || 0;
  const remaining    = approvedAmt - paidAmt;

  const handleConfirm = () => {
    if (!paymentMethod) { Alert.alert('Select Method', 'Please select a payment method.'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { Alert.alert('Invalid Amount', 'Please enter a valid amount.'); return; }
    if (amt > remaining) { Alert.alert('Exceeds Remaining', `Amount cannot exceed remaining ₹${remaining.toFixed(2)}`); return; }
    onConfirm({ paymentMethod, amount: amt, reference, note });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />

            {/* Employee */}
            <View style={styles.modalEmpRow}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>{advance.employeeName?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalEmpName}>{advance.employeeName}</Text>
                <Text style={styles.modalEmpReason}>{advance.reason} Advance</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Amount Summary */}
              <View style={styles.amountSummaryCard}>
                <View style={styles.amountSummaryItem}>
                  <Text style={styles.amountSummaryLabel}>Approved</Text>
                  <Text style={styles.amountSummaryValue}>₹{parseFloat(approvedAmt).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
                </View>
                <View style={styles.amountSummaryDivider} />
                <View style={styles.amountSummaryItem}>
                  <Text style={styles.amountSummaryLabel}>Paid So Far</Text>
                  <Text style={[styles.amountSummaryValue, { color: '#34D399' }]}>₹{parseFloat(paidAmt).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
                </View>
                <View style={styles.amountSummaryDivider} />
                <View style={styles.amountSummaryItem}>
                  <Text style={styles.amountSummaryLabel}>Remaining</Text>
                  <Text style={[styles.amountSummaryValue, { color: '#F87171' }]}>₹{remaining.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
                </View>
              </View>

              {/* Payment Method */}
              <Text style={styles.fieldLabel}>Payment Method *</Text>
              <View style={styles.methodRow}>
                {PAYMENT_METHODS.map(method => (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.methodBtn, paymentMethod?.id === method.id && { borderColor: method.color, backgroundColor: method.color + '15' }]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Icon name={method.icon} size={22} color={paymentMethod?.id === method.id ? method.color : '#9CA3AF'} />
                    <Text style={[styles.methodLabel, paymentMethod?.id === method.id && { color: method.color, fontWeight: '700' }]}>{method.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount */}
              <Text style={styles.fieldLabel}>Amount to Pay *</Text>
              <View style={styles.amountInputWrap}>
                <Text style={styles.rupeeSign}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#C4C4C4"
                />
              </View>

              {/* Reference */}
              <Text style={styles.fieldLabel}>Transaction Reference (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={reference}
                onChangeText={setReference}
                placeholder="UTR / Transaction ID"
                placeholderTextColor="#C4C4C4"
              />

              {/* Note */}
              <Text style={styles.fieldLabel}>Note (Optional)</Text>
              <TextInput
                style={[styles.textInput, { height: normalise(60), textAlignVertical: 'top' }]}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note..."
                placeholderTextColor="#C4C4C4"
                multiline
              />

              {/* Buttons */}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                  <Icon name="cash-fast" size={18} color="#fff" />
                  <Text style={styles.confirmBtnText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ── Advance Card ──────────────────────────────────────────────────────────
function AdvancePayCard({ item, index, onPay }) {
  const slideAnim   = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim,   { toValue: 0, delay: index * 60, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const approvedAmt  = item.approvedAmount ?? item.requestedAmount;
  const paidAmt      = item.paidAmount || 0;
  const remaining    = approvedAmt - paidAmt;
  const isFullyPaid  = remaining <= 0;
  const payConfig    = PAYMENT_STATUS_CONFIG[item.paymentStatus] || PAYMENT_STATUS_CONFIG.Unpaid;
  const formatAmount = amt => parseFloat(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const formatDate   = ts => {
    try { return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return 'N/A'; }
  };

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
      <View style={[styles.card, isFullyPaid && { opacity: 0.7 }]}>
        {/* Top Row */}
        <View style={styles.cardTopRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.employeeName?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.cardTopMiddle}>
            <Text style={styles.employeeName}>{item.employeeName}</Text>
            <Text style={styles.approvedDate}>Approved · {formatDate(item.approvedAt)}</Text>
          </View>
          <View style={[styles.payStatusBadge, { backgroundColor: payConfig.bg }]}>
            <Text style={[styles.payStatusText, { color: payConfig.color }]}>{item.paymentStatus}</Text>
          </View>
        </View>

        {/* Reason */}
        <View style={styles.reasonRow}>
          <View style={[styles.reasonIconWrap, { backgroundColor: (item.reasonColor || '#9CA3AF') + '20' }]}>
            <Icon name={item.reasonIcon || 'cash'} size={15} color={item.reasonColor || '#9CA3AF'} />
          </View>
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>

        {/* Amounts */}
        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Approved</Text>
            <Text style={styles.amountValue}>₹{formatAmount(approvedAmt)}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Paid</Text>
            <Text style={[styles.amountValue, { color: '#34D399' }]}>₹{formatAmount(paidAmt)}</Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Remaining</Text>
            <Text style={[styles.amountValue, { color: remaining > 0 ? '#F87171' : '#34D399' }]}>₹{formatAmount(remaining)}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {
            width: `${Math.min((paidAmt / approvedAmt) * 100, 100)}%`,
            backgroundColor: isFullyPaid ? '#34D399' : '#F59E0B',
          }]} />
        </View>

        {/* Last payment */}
        {item.lastPaymentMethod && (
          <View style={styles.lastPayRow}>
            <Icon name="clock-outline" size={11} color="#9CA3AF" />
            <Text style={styles.lastPayText}>
              Last: {item.lastPaymentMethod} · ₹{formatAmount(item.lastPaymentAmount)}
            </Text>
          </View>
        )}

        {/* Pay Button */}
        {!isFullyPaid && (
          <TouchableOpacity style={styles.payBtn} onPress={() => onPay(item)}>
            <Icon name="cash-fast" size={18} color="#fff" />
            <Text style={styles.payBtnText}>Pay ₹{formatAmount(remaining)}</Text>
          </TouchableOpacity>
        )}

        {isFullyPaid && (
          <View style={styles.paidBadgeFull}>
            <Icon name="check-all" size={16} color="#34D399" />
            <Text style={styles.paidBadgeFullText}>Fully Paid</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────
export default function AdvancePaymentScreen(props) {
  const [advances, setAdvances]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [processing, setProcessing]   = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [activeFilter, setActiveFilter] = useState('Unpaid');

  const headerAnim    = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchApprovedAdvances();
    Animated.parallel([
      Animated.spring(headerAnim,    { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchApprovedAdvances = async () => {
    try {
      const currentUserEmail = auth().currentUser?.email;
      const snap = await firestore().collectionGroup('advances').get();

      const data = snap.docs
        .filter(doc => {
          const d = doc.data();
          return d.approverEmail === currentUserEmail && d.status === 'Approved';
        })
        .map(doc => ({ id: doc.id, ...doc.data() }));

      data.sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));
      setAdvances(data);
    } catch (error) {
      console.log('Error fetching advances:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processPayment = async ({ paymentMethod, amount, reference, note }) => {
    if (!selectedAdvance) return;
    try {
      setProcessing(true);
      const approverName = auth().currentUser?.displayName || 'Approver';
      const newPaid      = (selectedAdvance.paidAmount || 0) + amount;
      const approvedAmt  = selectedAdvance.approvedAmount ?? selectedAdvance.requestedAmount;
      const isFullPaid   = newPaid >= approvedAmt;

      await firestore()
        .collection('users').doc(selectedAdvance.employeeUid)
        .collection('advances').doc(selectedAdvance.id)
        .update({
          paidAmount:        newPaid,
          paymentStatus:     isFullPaid ? 'Paid' : 'Partial',
          lastPaymentAmount: amount,
          lastPaymentMethod: paymentMethod.label,
          lastPaymentDate:   Date.now(),
          lastPaymentRef:    reference || '',
          lastPaymentNote:   note || '',
          lastPaymentBy:     approverName,
        });

      // Save to advance_payments collection
      await firestore().collection('advance_payments').add({
        advanceId:     selectedAdvance.id,
        employeeUid:   selectedAdvance.employeeUid,
        employeeName:  selectedAdvance.employeeName,
        employeeEmail: selectedAdvance.employeeEmail,
        approverUid:   auth().currentUser?.uid,
        approverName,
        amount,
        paymentMethod: paymentMethod.label,
        reference:     reference || '',
        note:          note || '',
        createdAt:     Date.now(),
      });

      // Notify employee
      await notifyEmployee(selectedAdvance, amount, paymentMethod.label);

      setShowModal(false);
      setSelectedAdvance(null);
      await fetchApprovedAdvances();

      Alert.alert(
        '✅ Payment Done!',
        `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} paid to ${selectedAdvance.employeeName} via ${paymentMethod.label}.`
      );
    } catch (error) {
      console.log('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const notifyEmployee = async (advance, amount, method) => {
    try {
      const userDoc  = await firestore().collection('users').doc(advance.employeeUid).get();
      const fcmToken = userDoc.data()?.fcmToken;
      if (!fcmToken) return;

      await firestore().collection('notifications').add({
        to:        fcmToken,
        toUid:     advance.employeeUid,
        fromUid:   auth().currentUser?.uid,
        fromName:  auth().currentUser?.displayName || 'Approver',
        title:     '💰 Advance Payment Received!',
        body:      `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })} paid via ${method} for your advance request.`,
        data:      { screen: 'MyAdvances' },
        createdAt: Date.now(),
        sent:      false,
      });
    } catch (error) {
      console.log('Notification error:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApprovedAdvances();
  }, []);

  const FILTER_TABS = ['Unpaid', 'Partial', 'Paid', 'All'];

  const filteredAdvances = advances.filter(a => {
    if (activeFilter === 'All') return true;
    return a.paymentStatus === activeFilter;
  });

  const totalApproved = advances.reduce((sum, a) => sum + (a.approvedAmount ?? a.requestedAmount ?? 0), 0);
  const totalPaid     = advances.reduce((sum, a) => sum + (a.paidAmount || 0), 0);
  const totalPending  = totalApproved - totalPaid;

  const renderHeader = () => (
    <View>
      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#E8453C' }]}>
            ₹{totalPending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
          <Text style={styles.summaryLabel}>To Pay</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: '#34D399' }]}>
            ₹{totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
          <Text style={styles.summaryLabel}>Paid Out</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>
            ₹{totalApproved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
          <Text style={styles.summaryLabel}>Total Approved</Text>
        </View>
      </View>

      {/* Filters */}
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
          <Text style={styles.headerTitle}>Pay Advances</Text>
          <Text style={styles.headerSubtitle}>{advances.length} approved advance{advances.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.headerBtn} />
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
          renderItem={({ item, index }) => (
            <AdvancePayCard
              item={item}
              index={index}
              onPay={advance => { setSelectedAdvance(advance); setShowModal(true); }}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="cash-check" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>All Paid!</Text>
              <Text style={styles.emptySubtitle}>No {activeFilter.toLowerCase()} advances found</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E8453C']} />}
        />
      )}

      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing payment...</Text>
        </View>
      )}

      <PayModal
        visible={showModal}
        advance={selectedAdvance}
        onClose={() => { setShowModal(false); setSelectedAdvance(null); }}
        onConfirm={processPayment}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  listContent: { paddingHorizontal: normalise(16), paddingBottom: normalise(32), flexGrow: 1 },

  header: {
    backgroundColor: '#E8453C', paddingHorizontal: normalise(16), paddingVertical: normalise(14),
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 8,
    shadowColor: '#E8453C', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  headerTitle: { color: '#fff', fontSize: normalise(18), fontWeight: '700', textAlign: 'center' },
  headerSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: normalise(11), textAlign: 'center' },
  headerBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  summaryCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: normalise(16),
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: normalise(16), marginBottom: normalise(12),
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: normalise(15), fontWeight: '800', color: '#1F2937' },
  summaryLabel: { fontSize: normalise(10), color: '#9CA3AF', fontWeight: '600', marginTop: 4, textAlign: 'center' },
  summaryDivider: { width: 1, height: 36, backgroundColor: '#E5E7EB' },

  filterRow: { flexDirection: 'row', gap: 6, marginBottom: normalise(12) },
  filterTab: { flex: 1, paddingVertical: normalise(8), borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', alignItems: 'center' },
  filterTabActive: { backgroundColor: '#FFF0F0', borderColor: '#E8453C' },
  filterTabText: { fontSize: normalise(11), fontWeight: '600', color: '#9CA3AF' },
  filterTabTextActive: { color: '#E8453C', fontWeight: '700' },

  cardWrapper: { marginBottom: normalise(12) },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: normalise(16), elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: normalise(10), gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8453C', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: normalise(18), fontWeight: '800' },
  cardTopMiddle: { flex: 1 },
  employeeName: { fontSize: normalise(15), fontWeight: '700', color: '#1F2937' },
  approvedDate: { fontSize: normalise(11), color: '#9CA3AF', marginTop: 2 },
  payStatusBadge: { paddingHorizontal: normalise(8), paddingVertical: normalise(4), borderRadius: 20 },
  payStatusText: { fontSize: normalise(11), fontWeight: '700' },
  reasonRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: normalise(12) },
  reasonIconWrap: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  reasonText: { fontSize: normalise(12), color: '#6B7280', fontWeight: '600' },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: normalise(10) },
  amountItem: { alignItems: 'center', flex: 1 },
  amountLabel: { fontSize: normalise(10), color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' },
  amountValue: { fontSize: normalise(14), fontWeight: '800', color: '#1F2937', marginTop: 2 },
  progressBar: { height: 5, backgroundColor: '#F3F4F6', borderRadius: 3, marginBottom: normalise(8) },
  progressFill: { height: 5, borderRadius: 3 },
  lastPayRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: normalise(10) },
  lastPayText: { fontSize: normalise(11), color: '#9CA3AF' },
  payBtn: {
    backgroundColor: '#E8453C', borderRadius: 12, paddingVertical: normalise(12),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    elevation: 2, shadowColor: '#E8453C', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6,
  },
  payBtnText: { color: '#fff', fontSize: normalise(14), fontWeight: '700' },
  paidBadgeFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: normalise(10), backgroundColor: '#F0FFF8', borderRadius: 12 },
  paidBadgeFullText: { color: '#34D399', fontSize: normalise(14), fontWeight: '700' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: normalise(20), maxHeight: '90%' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: normalise(16) },
  modalEmpRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: normalise(16) },
  modalAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8453C', justifyContent: 'center', alignItems: 'center' },
  modalAvatarText: { color: '#fff', fontSize: normalise(20), fontWeight: '800' },
  modalEmpName: { fontSize: normalise(16), fontWeight: '700', color: '#1F2937' },
  modalEmpReason: { fontSize: normalise(12), color: '#9CA3AF' },
  amountSummaryCard: { backgroundColor: '#1F2937', borderRadius: 14, padding: normalise(14), flexDirection: 'row', justifyContent: 'space-between', marginBottom: normalise(4) },
  amountSummaryItem: { flex: 1, alignItems: 'center' },
  amountSummaryLabel: { color: 'rgba(255,255,255,0.6)', fontSize: normalise(10), fontWeight: '600', textTransform: 'uppercase' },
  amountSummaryValue: { color: '#fff', fontSize: normalise(14), fontWeight: '800', marginTop: 4 },
  amountSummaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  fieldLabel: { fontSize: normalise(12), fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: normalise(8), marginTop: normalise(12) },
  methodRow: { flexDirection: 'row', gap: 8 },
  methodBtn: { flex: 1, alignItems: 'center', paddingVertical: normalise(12), borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', gap: 4 },
  methodLabel: { fontSize: normalise(11), color: '#9CA3AF', fontWeight: '600' },
  amountInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: normalise(14), paddingVertical: normalise(10) },
  rupeeSign: { fontSize: normalise(20), color: '#E8453C', fontWeight: '700', marginRight: 6 },
  amountInput: { flex: 1, fontSize: normalise(24), fontWeight: '800', color: '#1F2937' },
  textInput: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: normalise(12), fontSize: normalise(14), color: '#1F2937', borderWidth: 1.5, borderColor: '#E5E7EB' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: normalise(16), marginBottom: normalise(8) },
  cancelBtn: { flex: 1, paddingVertical: normalise(14), borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: normalise(14), fontWeight: '700', color: '#6B7280' },
  confirmBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: normalise(14), borderRadius: 12, backgroundColor: '#E8453C', elevation: 3 },
  confirmBtnText: { color: '#fff', fontSize: normalise(15), fontWeight: '700' },

  processingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  processingText: { color: '#fff', fontSize: normalise(14), fontWeight: '600', marginTop: 12 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: normalise(80) },
  emptyTitle: { fontSize: normalise(18), fontWeight: '700', color: '#374151', marginTop: normalise(16) },
  emptySubtitle: { fontSize: normalise(13), color: '#9CA3AF', marginTop: normalise(6) },
});
