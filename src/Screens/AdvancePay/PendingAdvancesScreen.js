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
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';
import { openUpiAndConfirm } from '../../Utils/UpiPayment';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'cash', color: '#34D399' },
  { id: 'upi', label: 'UPI', icon: 'contactless-payment', color: '#6366F1' },
  {
    id: 'netbanking',
    label: 'Net Banking',
    icon: 'bank-outline',
    color: '#3B82F6',
  },
];

// ── Action Modal ──────────────────────────────────────────────────────────
const ActionModal = ({ visible, advance, onClose, onConfirm }) => {
  const [action, setAction] = useState(null);
  const [editedAmount, setEditedAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [reference, setReference] = useState('');
  const [approverNote, setApproverNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (visible && advance) {
      setAction(null);
      setEditedAmount(String(advance.requestedAmount || ''));
      setPaymentMethod(null);
      setReference('');
      setApproverNote('');
      setRejectionReason('');
    }
  }, [visible, advance]);

  if (!advance) return null;

  const handleConfirm = () => {
    if (!action) {
      Alert.alert('Select Action', 'Please choose to Approve or Reject.');
      return;
    }
    if (action === 'approve') {
      if (!parseFloat(editedAmount) || parseFloat(editedAmount) <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid approved amount.');
        return;
      }
      if (!paymentMethod) {
        Alert.alert(
          'Select Payment Method',
          'Please select how you paid the advance.',
        );
        return;
      }
    }
    if (action === 'reject' && !rejectionReason.trim()) {
      Alert.alert('Rejection Reason', 'Please enter a reason for rejection.');
      return;
    }

    // ✅ UPI — open UPI app first then confirm
    if (action === 'approve' && paymentMethod?.id === 'upi') {
      openUpiAndConfirm({
        upiId: advance.employeeUpiId || '',
        name: advance.employeeName || 'Employee',
        amount: parseFloat(editedAmount),
        note: `Advance payment - ${advance.reason || ''}`,
        onConfirm: () => {
          onConfirm({
            action,
            editedAmount: parseFloat(editedAmount),
            paymentMethod,
            reference,
            approverNote,
            rejectionReason,
          });
        },
      });
      return; // ✅ Don't call onConfirm directly for UPI
    }

    // Cash / Net Banking — confirm directly
    onConfirm({
      action,
      editedAmount: parseFloat(editedAmount),
      paymentMethod,
      reference,
      approverNote,
      rejectionReason,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%' }}
        >
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />

            {/* Employee Info */}
            <View style={styles.modalEmployeeRow}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>
                  {advance.employeeName?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalEmployeeName}>
                  {advance.employeeName}
                </Text>
                <Text style={styles.modalEmployeeEmail}>
                  {advance.employeeEmail}
                </Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Requested Amount Banner */}
              <View style={styles.requestedBanner}>
                <Text style={styles.requestedLabel}>Requested Amount</Text>
                <Text style={styles.requestedAmount}>
                  ₹
                  {parseFloat(advance.requestedAmount || 0).toLocaleString(
                    'en-IN',
                    { maximumFractionDigits: 2 },
                  )}
                </Text>
                <Text style={styles.requestedReason}>{advance.reason}</Text>
              </View>

              {/* Action Selector */}
              <Text style={styles.fieldLabel}>Action *</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    action === 'approve' && styles.actionBtnApprove,
                  ]}
                  onPress={() => setAction('approve')}
                >
                  <Icon
                    name="check-circle-outline"
                    size={22}
                    color={action === 'approve' ? '#34D399' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      action === 'approve' && {
                        color: '#34D399',
                        fontWeight: '700',
                      },
                    ]}
                  >
                    Approve & Pay
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    action === 'reject' && styles.actionBtnReject,
                  ]}
                  onPress={() => setAction('reject')}
                >
                  <Icon
                    name="close-circle-outline"
                    size={22}
                    color={action === 'reject' ? '#F87171' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      action === 'reject' && {
                        color: '#F87171',
                        fontWeight: '700',
                      },
                    ]}
                  >
                    Reject
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── Approve Fields ── */}
              {action === 'approve' && (
                <>
                  <Text style={styles.fieldLabel}>Approved Amount *</Text>
                  <View style={styles.amountInputWrap}>
                    <Text style={styles.rupeeSign}>₹</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={editedAmount}
                      onChangeText={setEditedAmount}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#C4C4C4"
                    />
                    {parseFloat(editedAmount) !== advance.requestedAmount &&
                      parseFloat(editedAmount) > 0 && (
                        <View style={styles.editedBadge}>
                          <Text style={styles.editedBadgeText}>Edited</Text>
                        </View>
                      )}
                  </View>

                  <Text style={styles.fieldLabel}>Payment Method *</Text>
                  <View style={styles.methodRow}>
                    {PAYMENT_METHODS.map(method => (
                      <TouchableOpacity
                        key={method.id}
                        style={[
                          styles.methodBtn,
                          paymentMethod?.id === method.id && {
                            borderColor: method.color,
                            backgroundColor: method.color + '15',
                          },
                        ]}
                        onPress={() => setPaymentMethod(method)}
                      >
                        <Icon
                          name={method.icon}
                          size={22}
                          color={
                            paymentMethod?.id === method.id
                              ? method.color
                              : '#9CA3AF'
                          }
                        />
                        <Text
                          style={[
                            styles.methodLabel,
                            paymentMethod?.id === method.id && {
                              color: method.color,
                              fontWeight: '700',
                            },
                          ]}
                        >
                          {method.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* ✅ UPI ID Card — show when UPI selected */}
                  {paymentMethod?.id === 'upi' && (
                    <View style={styles.upiInfoCard}>
                      <View style={styles.upiInfoLeft}>
                        <View style={styles.upiInfoIconWrap}>
                          <Icon
                            name="contactless-payment"
                            size={20}
                            color="#6366F1"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.upiInfoLabel}>
                            Employee UPI ID
                          </Text>
                          <Text
                            style={[
                              styles.upiInfoValue,
                              !advance.employeeUpiId && { color: '#F59E0B' },
                            ]}
                          >
                            {advance.employeeUpiId ||
                              'Not added by employee ⚠️'}
                          </Text>
                        </View>
                      </View>
                      {advance.employeeUpiId ? (
                        <View style={styles.upiSetBadge}>
                          <Icon name="check-circle" size={14} color="#34D399" />
                          <Text style={styles.upiSetText}>Ready</Text>
                        </View>
                      ) : (
                        <View style={styles.upiPendingBadge}>
                          <Icon
                            name="alert-circle-outline"
                            size={14}
                            color="#F59E0B"
                          />
                          <Text style={styles.upiPendingText}>Missing</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* UPI hint */}
                  {paymentMethod?.id === 'upi' && (
                    <View style={styles.upiHint}>
                      <Icon
                        name="information-outline"
                        size={13}
                        color="#6366F1"
                      />
                      <Text style={styles.upiHintText}>
                        Tapping "Approve & Pay" will open your UPI app with
                        amount pre-filled. Complete payment and confirm.
                      </Text>
                    </View>
                  )}

                  <Text style={styles.fieldLabel}>
                    Transaction Reference (Optional)
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={reference}
                    onChangeText={setReference}
                    placeholder="UTR / Transaction ID / Cheque No."
                    placeholderTextColor="#C4C4C4"
                  />

                  <Text style={styles.fieldLabel}>
                    Note to Employee (Optional)
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { minHeight: normalise(60), textAlignVertical: 'top' },
                    ]}
                    value={approverNote}
                    onChangeText={setApproverNote}
                    placeholder="Add a note for the employee..."
                    placeholderTextColor="#C4C4C4"
                    multiline
                  />

                  {/* Summary */}
                  <View style={styles.summaryBanner}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel2}>Paying</Text>
                      <Text style={styles.summaryValue}>
                        ₹
                        {parseFloat(editedAmount || 0).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel2}>Via</Text>
                      <Text style={styles.summaryValue}>
                        {paymentMethod?.label || '—'}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel2}>To</Text>
                      <Text style={styles.summaryValue}>
                        {advance.employeeName}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* ── Reject Fields ── */}
              {action === 'reject' && (
                <>
                  <Text style={styles.fieldLabel}>Rejection Reason *</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { minHeight: normalise(80), textAlignVertical: 'top' },
                    ]}
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                    placeholder="Reason for rejecting this advance request..."
                    placeholderTextColor="#C4C4C4"
                    multiline
                  />
                </>
              )}

              {/* Buttons */}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    action === 'approve'
                      ? styles.confirmBtnApprove
                      : action === 'reject'
                      ? styles.confirmBtnReject
                      : styles.confirmBtnDisabled,
                  ]}
                  onPress={handleConfirm}
                >
                  <Icon
                    name={
                      action === 'reject'
                        ? 'close-circle-outline'
                        : action === 'approve' && paymentMethod?.id === 'upi'
                        ? 'open-in-app'
                        : 'cash-check'
                    }
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.confirmBtnText}>
                    {action === 'approve' && paymentMethod?.id === 'upi'
                      ? 'Open UPI & Pay'
                      : action === 'approve'
                      ? 'Approve & Pay'
                      : action === 'reject'
                      ? 'Reject'
                      : 'Confirm'}
                  </Text>
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
function AdvanceCard({ item, index, onAction }) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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

  const formatAmount = amt =>
    parseFloat(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const formatDate = ts => {
    try {
      return new Date(ts).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.employeeName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.cardTopMiddle}>
            <Text style={styles.employeeName}>{item.employeeName}</Text>
            <Text style={styles.employeeEmail} numberOfLines={1}>
              {item.employeeEmail}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.reasonRow}>
          <View
            style={[
              styles.reasonIconWrap,
              { backgroundColor: (item.reasonColor || '#9CA3AF') + '20' },
            ]}
          >
            <Icon
              name={item.reasonIcon || 'cash'}
              size={16}
              color={item.reasonColor || '#9CA3AF'}
            />
          </View>
          <Text style={styles.reasonText}>{item.reason}</Text>
          {/* ✅ UPI ID indicator on card */}
          {item.employeeUpiId ? (
            <View style={styles.upiCardBadge}>
              <Icon name="contactless-payment" size={11} color="#6366F1" />
              <Text style={styles.upiCardBadgeText}>UPI Ready</Text>
            </View>
          ) : (
            <View style={styles.upiCardBadgeMissing}>
              <Icon name="alert-circle-outline" size={11} color="#F59E0B" />
              <Text style={styles.upiCardBadgeMissingText}>No UPI</Text>
            </View>
          )}
        </View>

        <View style={styles.amountBanner}>
          <View>
            <Text style={styles.amountLabel}>Requested Amount</Text>
            <Text style={styles.amountValue}>
              ₹{formatAmount(item.requestedAmount)}
            </Text>
          </View>
          <Icon name="arrow-right" size={16} color="#9CA3AF" />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.amountLabel}>You'll Pay</Text>
            <Text style={[styles.amountValue, { color: '#34D399' }]}>₹ ?</Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.descriptionText} numberOfLines={2}>
            📝 {item.description}
          </Text>
        ) : null}

        <TouchableOpacity
          style={styles.actionCardBtn}
          onPress={() => onAction(item)}
        >
          <Icon name="cash-check" size={18} color="#fff" />
          <Text style={styles.actionCardBtnText}>Review & Pay</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────
export default function PendingAdvancesScreen(props) {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPendingAdvances();
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

  const fetchPendingAdvances = async () => {
    try {
      const currentUserEmail = auth().currentUser?.email;
      const snap = await firestore().collectionGroup('advances').get();

      const data = await Promise.all(
        snap.docs
          .filter(doc => {
            const d = doc.data();
            return (
              d.approverEmail === currentUserEmail && d.status === 'Pending'
            );
          })
          .map(async doc => {
            const advance = { id: doc.id, ...doc.data() };
            try {
              // ✅ Fetch employee details including UPI ID
              const userDoc = await firestore()
                .collection('users')
                .doc(advance.employeeUid)
                .get();
              const userData = userDoc.data();
              advance.employeeName = userData?.displayName || 'Unknown';
              advance.employeeEmail = userData?.email || '';
              advance.employeeUpiId = userData?.upiId || ''; // ✅ fetch UPI ID
            } catch {
              advance.employeeName = 'Unknown';
              advance.employeeEmail = '';
              advance.employeeUpiId = '';
            }
            return advance;
          }),
      );

      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAdvances(data);
    } catch (error) {
      console.log('Error fetching advances:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = advance => {
    setSelectedAdvance(advance);
    setShowModal(true);
  };

  const processAction = async ({
    action,
    editedAmount,
    paymentMethod,
    reference,
    approverNote,
    rejectionReason,
  }) => {
    if (!selectedAdvance) return;
    try {
      setProcessing(true);
      const approverName = auth().currentUser?.displayName || 'Approver';
      const approverUid = auth().currentUser?.uid;

      const updateData =
        action === 'approve'
          ? {
              status: 'Approved',
              approvedAmount: parseFloat(editedAmount),
              paidAmount: parseFloat(editedAmount),
              paymentStatus: 'Paid',
              paymentMethod: paymentMethod.label,
              paymentRef: reference || '',
              approverNote: approverNote || '',
              approvedBy: approverName,
              approvedAt: Date.now(),
              usedInExpense: 0,
            }
          : {
              status: 'Rejected',
              rejectionReason: rejectionReason,
              approvedBy: approverName,
              approvedAt: Date.now(),
            };

      await firestore()
        .collection('users')
        .doc(selectedAdvance.employeeUid)
        .collection('advances')
        .doc(selectedAdvance.id)
        .update(updateData);

      if (action === 'approve') {
        await firestore()
          .collection('advance_payments')
          .add({
            advanceId: selectedAdvance.id,
            employeeUid: selectedAdvance.employeeUid,
            employeeName: selectedAdvance.employeeName,
            employeeEmail: selectedAdvance.employeeEmail,
            approverUid,
            approverName,
            amount: parseFloat(editedAmount),
            paymentMethod: paymentMethod.label,
            reference: reference || '',
            note: approverNote || '',
            createdAt: Date.now(),
          });
      }

      await notifyEmployee(
        selectedAdvance,
        action,
        editedAmount,
        paymentMethod,
        rejectionReason,
      );

      setShowModal(false);
      setSelectedAdvance(null);
      await fetchPendingAdvances();

      Alert.alert(
        action === 'approve' ? '💰 Advance Paid!' : '❌ Advance Rejected',
        action === 'approve'
          ? `₹${parseFloat(editedAmount).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
            })} paid to ${selectedAdvance.employeeName} via ${
              paymentMethod.label
            }.`
          : `Advance request from ${selectedAdvance.employeeName} has been rejected.`,
      );
    } catch (error) {
      console.log('Action error:', error);
      Alert.alert('Error', 'Failed to process. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const notifyEmployee = async (
    advance,
    action,
    amount,
    paymentMethod,
    reason,
  ) => {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(advance.employeeUid)
        .get();
      const fcmToken = userDoc.data()?.fcmToken;
      if (!fcmToken) return;
      const isApproved = action === 'approve';
      await firestore()
        .collection('notifications')
        .add({
          to: fcmToken,
          toUid: advance.employeeUid,
          fromUid: auth().currentUser?.uid,
          fromName: auth().currentUser?.displayName || 'Approver',
          title: isApproved ? '💰 Advance Paid!' : '❌ Advance Rejected',
          body: isApproved
            ? `₹${parseFloat(amount).toLocaleString('en-IN')} paid via ${
                paymentMethod.label
              } for your advance request.`
            : `Your advance request was rejected. Reason: ${reason}`,
          data: { screen: 'MyAdvances' },
          createdAt: Date.now(),
          sent: false,
        });
    } catch (error) {
      console.log('Notification error:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPendingAdvances();
  }, []);

  return (
    <View style={styles.container}>
      <MyStatusBar barStyle="light-content" />

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
        <View>
          <Text style={styles.headerTitle}>Pending Advances</Text>
          <Text style={styles.headerSubtitle}>
            {advances.length} request{advances.length !== 1 ? 's' : ''} waiting
          </Text>
        </View>
        <View style={styles.headerBtn} />
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8453C" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={advances}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <AdvanceCard item={item} index={index} onAction={handleAction} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="check-all" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>All Clear!</Text>
              <Text style={styles.emptySubtitle}>
                No pending advance requests
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#E8453C']}
            />
          }
        />
      )}

      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      <ActionModal
        visible={showModal}
        advance={selectedAdvance}
        onClose={() => {
          setShowModal(false);
          setSelectedAdvance(null);
        }}
        onConfirm={processAction}
      />
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
    paddingBottom: normalise(32),
    flexGrow: 1,
  },

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
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: normalise(11),
    textAlign: 'center',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card
  cardWrapper: { marginBottom: normalise(12), marginTop: normalise(4) },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: normalise(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalise(12),
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8453C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: normalise(18), fontWeight: '800' },
  cardTopMiddle: { flex: 1 },
  employeeName: {
    fontSize: normalise(15),
    fontWeight: '700',
    color: '#1F2937',
  },
  employeeEmail: { fontSize: normalise(11), color: '#9CA3AF', marginTop: 2 },
  dateText: { fontSize: normalise(11), color: '#9CA3AF' },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: normalise(12),
  },
  reasonIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonText: {
    fontSize: normalise(13),
    color: '#6B7280',
    fontWeight: '600',
    flex: 1,
  },

  // UPI card badges
  upiCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: normalise(6),
    paddingVertical: normalise(3),
    borderRadius: 20,
  },
  upiCardBadgeText: {
    fontSize: normalise(10),
    color: '#6366F1',
    fontWeight: '700',
  },
  upiCardBadgeMissing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: normalise(6),
    paddingVertical: normalise(3),
    borderRadius: 20,
  },
  upiCardBadgeMissingText: {
    fontSize: normalise(10),
    color: '#F59E0B',
    fontWeight: '700',
  },

  amountBanner: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: normalise(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalise(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  amountLabel: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: normalise(18),
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: normalise(12),
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: normalise(12),
  },
  actionCardBtn: {
    backgroundColor: '#E8453C',
    borderRadius: 12,
    paddingVertical: normalise(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#E8453C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  actionCardBtnText: {
    color: '#fff',
    fontSize: normalise(14),
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: normalise(20),
    maxHeight: '92%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: normalise(16),
  },
  modalEmployeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: normalise(16),
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8453C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarText: {
    color: '#fff',
    fontSize: normalise(20),
    fontWeight: '800',
  },
  modalEmployeeName: {
    fontSize: normalise(16),
    fontWeight: '700',
    color: '#1F2937',
  },
  modalEmployeeEmail: { fontSize: normalise(12), color: '#9CA3AF' },
  requestedBanner: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: normalise(16),
    alignItems: 'center',
    marginBottom: normalise(16),
  },
  requestedLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: normalise(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  requestedAmount: {
    color: '#fff',
    fontSize: normalise(28),
    fontWeight: '800',
    marginVertical: normalise(4),
  },
  requestedReason: { color: 'rgba(255,255,255,0.6)', fontSize: normalise(12) },
  fieldLabel: {
    fontSize: normalise(12),
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: normalise(8),
    marginTop: normalise(12),
  },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: normalise(14),
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  actionBtnApprove: { borderColor: '#34D399', backgroundColor: '#F0FFF8' },
  actionBtnReject: { borderColor: '#F87171', backgroundColor: '#FFF5F5' },
  actionBtnText: {
    fontSize: normalise(13),
    color: '#9CA3AF',
    fontWeight: '600',
  },
  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: normalise(14),
    paddingVertical: normalise(10),
  },
  rupeeSign: {
    fontSize: normalise(20),
    color: '#34D399',
    fontWeight: '700',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: normalise(24),
    fontWeight: '800',
    color: '#1F2937',
  },
  editedBadge: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: normalise(8),
    paddingVertical: normalise(3),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  editedBadgeText: {
    color: '#F59E0B',
    fontSize: normalise(11),
    fontWeight: '700',
  },
  methodRow: { flexDirection: 'row', gap: 8 },
  methodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: normalise(12),
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  methodLabel: { fontSize: normalise(11), color: '#9CA3AF', fontWeight: '600' },

  // UPI Info Card in modal
  upiInfoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: normalise(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalise(8),
    borderWidth: 1.5,
    borderColor: '#6366F120',
  },
  upiInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  upiInfoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upiInfoLabel: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  upiInfoValue: {
    fontSize: normalise(13),
    fontWeight: '700',
    color: '#6366F1',
    marginTop: 2,
  },
  upiSetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FFF8',
    paddingHorizontal: normalise(8),
    paddingVertical: normalise(4),
    borderRadius: 20,
  },
  upiSetText: { fontSize: normalise(11), color: '#34D399', fontWeight: '700' },
  upiPendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: normalise(8),
    paddingVertical: normalise(4),
    borderRadius: 20,
  },
  upiPendingText: {
    fontSize: normalise(11),
    color: '#F59E0B',
    fontWeight: '700',
  },

  // UPI hint
  upiHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F5F5FF',
    borderRadius: 10,
    padding: normalise(10),
    marginTop: normalise(6),
  },
  upiHintText: {
    flex: 1,
    fontSize: normalise(11),
    color: '#6366F1',
    lineHeight: normalise(16),
  },

  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: normalise(12),
    fontSize: normalise(14),
    color: '#1F2937',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: normalise(4),
  },
  summaryBanner: {
    backgroundColor: '#F0FFF8',
    borderRadius: 14,
    padding: normalise(14),
    marginTop: normalise(12),
    borderWidth: 1.5,
    borderColor: '#34D39930',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: normalise(4),
  },
  summaryLabel2: {
    fontSize: normalise(13),
    color: '#9CA3AF',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: normalise(13),
    color: '#1F2937',
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: normalise(16),
    marginBottom: normalise(8),
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: normalise(14),
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: normalise(14),
    fontWeight: '700',
    color: '#6B7280',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: normalise(14),
    borderRadius: 12,
  },
  confirmBtnApprove: { backgroundColor: '#34D399' },
  confirmBtnReject: { backgroundColor: '#F87171' },
  confirmBtnDisabled: { backgroundColor: '#D1D5DB' },
  confirmBtnText: { color: '#fff', fontSize: normalise(14), fontWeight: '700' },

  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: normalise(14),
    fontWeight: '600',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: normalise(80),
  },
  emptyTitle: {
    fontSize: normalise(18),
    fontWeight: '700',
    color: '#374151',
    marginTop: normalise(16),
  },
  emptySubtitle: {
    fontSize: normalise(13),
    color: '#9CA3AF',
    marginTop: normalise(6),
  },
});
