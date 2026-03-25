/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';

const APPROVERS = [
  { name: 'Amit Das', email: 'amit@startrackautomation.in' },
  { name: 'Aparesh Mondal', email: 'aparesh@startrackautomation.in' },
  { name: 'Manoj Dasgupta', email: 'manoj@startrackautomation.in' },
  // { name: 'Shubhankar(Developer)', email: 'shubhankarkoner.sta@gmail.com' },
  // {
  //   name: 'Amit Mondal(Tester)',
  //   email: 'amitmondal.sta@gmail.com',
  // },
];

const ADVANCE_REASONS = [
  { label: 'Travel', icon: 'airplane', color: '#38BDF8' },
  { label: 'Medical', icon: 'medical-bag', color: '#F87171' },
  { label: 'Material Purchase', icon: 'briefcase-outline', color: '#A78BFA' },
  { label: 'Field Work', icon: 'map-marker-outline', color: '#FB923C' },
  { label: 'Training', icon: 'school-outline', color: '#34D399' },
  { label: 'Other', icon: 'dots-horizontal', color: '#9CA3AF' },
];

// ── Approver Modal ────────────────────────────────────────────────────────
const ApproverModal = ({ visible, selected, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}
    />
    <View style={styles.bottomSheet}>
      <View style={styles.sheetHandle} />
      <Text style={styles.sheetTitle}>Select Approver</Text>
      {APPROVERS.map(approver => (
        <TouchableOpacity
          key={approver.email}
          style={[
            styles.approverRow,
            selected?.email === approver.email && styles.approverRowActive,
          ]}
          onPress={() => {
            onSelect(approver);
            onClose();
          }}
        >
          <View style={styles.approverAvatar}>
            <Text style={styles.approverInitial}>{approver.name[0]}</Text>
          </View>
          <View style={styles.approverInfo}>
            <Text style={styles.approverName}>{approver.name}</Text>
            <Text style={styles.approverEmail}>{approver.email}</Text>
          </View>
          {selected?.email === approver.email && (
            <Icon name="check-circle" size={20} color="#E8453C" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  </Modal>
);

export default function RequestAdvanceScreen(props) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const [approver, setApprover] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showApprover, setShowApprover] = useState(false);
  const [success, setSuccess] = useState(false);

  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.5)).current;

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

  const showSuccess = () => {
    setSuccess(true);
    Animated.parallel([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(successScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        setSuccess(false);
        props.navigation.goBack();
      }, 2000);
    });
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Missing Amount', 'Please enter the advance amount.');
      return;
    }
    if (!reason) {
      Alert.alert('Missing Reason', 'Please select a reason for the advance.');
      return;
    }
    if (!approver) {
      Alert.alert('Missing Approver', 'Please select an approver.');
      return;
    }

    try {
      setLoading(true);
      const user = auth().currentUser;

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('advances')
        .add({
          requestedAmount: parseFloat(amount),
          approvedAmount: null,
          reason: reason.label,
          reasonIcon: reason.icon,
          reasonColor: reason.color,
          description: description.trim(),
          approver: approver.name,
          approverEmail: approver.email,
          status: 'Pending',
          paymentStatus: 'Unpaid',
          paidAmount: 0,
          paymentMethod: null,
          rejectionReason: '',
          approverNote: '',
          employeeUid: user.uid,
          employeeName: user.displayName || '',
          employeeEmail: user.email || '',
          createdAt: Date.now(),
        });

      // Notify approver
      await notifyApprover(
        approver.email,
        user.displayName,
        parseFloat(amount),
      );

      showSuccess();
    } catch (error) {
      console.log('Submit error:', error);
      Alert.alert(
        'Error',
        'Failed to submit advance request. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const notifyApprover = async (approverEmail, employeeName, amount) => {
    try {
      const snap = await firestore()
        .collection('users')
        .where('email', '==', approverEmail)
        .limit(1)
        .get();

      if (snap.empty) return;
      const approverData = snap.docs[0].data();
      const fcmToken = approverData?.fcmToken;
      if (!fcmToken) return;

      await firestore()
        .collection('notifications')
        .add({
          to: fcmToken,
          toUid: approverData.uid,
          fromUid: auth().currentUser?.uid,
          fromName: employeeName,
          title: '💵 Advance Request',
          body: `${employeeName} requested ₹${amount.toLocaleString(
            'en-IN',
          )} advance payment.`,
          data: { screen: 'PendingAdvances' },
          createdAt: Date.now(),
          sent: false,
        });
    } catch (error) {
      console.log('Notification error:', error);
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
        <Text style={styles.headerTitle}>Request Advance</Text>
        <View style={styles.headerBtn} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.amountCardLabel}>Advance Amount</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.rupeeSign}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#D1D5DB"
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.amountHint}>
              Enter the amount you need in advance
            </Text>
          </View>

          {/* Reason */}
          <Text style={styles.sectionLabel}>Reason for Advance</Text>
          <View style={styles.reasonGrid}>
            {ADVANCE_REASONS.map(r => (
              <TouchableOpacity
                key={r.label}
                style={[
                  styles.reasonItem,
                  reason?.label === r.label && {
                    borderColor: r.color,
                    backgroundColor: r.color + '15',
                  },
                ]}
                onPress={() => setReason(r)}
              >
                <View
                  style={[
                    styles.reasonIconWrap,
                    { backgroundColor: r.color + '20' },
                  ]}
                >
                  <Icon name={r.icon} size={22} color={r.color} />
                </View>
                <Text
                  style={[
                    styles.reasonLabel,
                    reason?.label === r.label && {
                      color: r.color,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {r.label}
                </Text>
                {reason?.label === r.label && (
                  <View
                    style={[styles.reasonCheck, { backgroundColor: r.color }]}
                  >
                    <Icon name="check" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.sectionLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe why you need this advance..."
            placeholderTextColor="#C4C4C4"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Approver */}
          <Text style={styles.sectionLabel}>Select Approver</Text>
          <TouchableOpacity
            style={styles.approverSelector}
            onPress={() => setShowApprover(true)}
          >
            {approver ? (
              <View style={styles.approverSelected}>
                <View style={styles.approverSelectedAvatar}>
                  <Text style={styles.approverSelectedInitial}>
                    {approver.name[0]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.approverSelectedName}>
                    {approver.name}
                  </Text>
                  <Text style={styles.approverSelectedEmail}>
                    {approver.email}
                  </Text>
                </View>
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              </View>
            ) : (
              <View style={styles.approverPlaceholder}>
                <Icon name="account-circle-outline" size={24} color="#C4C4C4" />
                <Text style={styles.approverPlaceholderText}>
                  Tap to select approver
                </Text>
                <Icon name="chevron-down" size={20} color="#C4C4C4" />
              </View>
            )}
          </TouchableOpacity>

          {/* Summary */}
          {amount && reason && approver && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Request Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel2}>Amount</Text>
                <Text style={styles.summaryValue}>
                  ₹
                  {parseFloat(amount || 0).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel2}>Reason</Text>
                <Text style={styles.summaryValue}>{reason?.label}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel2}>Approver</Text>
                <Text style={styles.summaryValue}>{approver?.name}</Text>
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="send-outline" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Submit Request</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Approver Modal */}
      <ApproverModal
        visible={showApprover}
        selected={approver}
        onSelect={setApprover}
        onClose={() => setShowApprover(false)}
      />

      {/* Success Overlay */}
      {success && (
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successCard,
              { opacity: successAnim, transform: [{ scale: successScale }] },
            ]}
          >
            <View style={styles.successIcon}>
              <Icon name="check-circle" size={56} color="#34D399" />
            </View>
            <Text style={styles.successTitle}>Request Submitted!</Text>
            <Text style={styles.successSubtitle}>
              Your advance request has been sent to {approver?.name}
            </Text>
          </Animated.View>
        </View>
      )}
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

  // Amount Card
  amountCard: {
    backgroundColor: '#E8453C',
    borderRadius: 20,
    padding: normalise(24),
    alignItems: 'center',
    marginTop: normalise(16),
    marginBottom: normalise(20),
    elevation: 6,
    shadowColor: '#E8453C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  amountCardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: normalise(13),
    fontWeight: '600',
    marginBottom: normalise(12),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  amountInputRow: { flexDirection: 'row', alignItems: 'center' },
  rupeeSign: {
    color: '#fff',
    fontSize: normalise(32),
    fontWeight: '700',
    marginRight: normalise(4),
  },
  amountInput: {
    color: '#fff',
    fontSize: normalise(48),
    fontWeight: '800',
    minWidth: normalise(150),
    textAlign: 'center',
    letterSpacing: -1,
  },
  amountHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: normalise(12),
    marginTop: normalise(8),
  },

  // Section Label
  sectionLabel: {
    fontSize: normalise(13),
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: normalise(10),
    marginTop: normalise(4),
  },

  // Reason Grid
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: normalise(16),
  },
  reasonItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: normalise(12),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    elevation: 1,
    position: 'relative',
  },
  reasonIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalise(6),
  },
  reasonLabel: {
    fontSize: normalise(11),
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  reasonCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Description
  descriptionInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: normalise(14),
    fontSize: normalise(14),
    color: '#1F2937',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: normalise(16),
    minHeight: normalise(80),
    textAlignVertical: 'top',
  },

  // Approver Selector
  approverSelector: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: normalise(16),
    overflow: 'hidden',
  },
  approverSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalise(14),
    gap: 10,
  },
  approverSelectedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8453C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approverSelectedInitial: {
    color: '#fff',
    fontSize: normalise(18),
    fontWeight: '800',
  },
  approverSelectedName: {
    fontSize: normalise(14),
    fontWeight: '700',
    color: '#1F2937',
  },
  approverSelectedEmail: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    marginTop: 2,
  },
  approverPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalise(14),
    gap: 10,
  },
  approverPlaceholderText: {
    flex: 1,
    fontSize: normalise(14),
    color: '#C4C4C4',
  },

  // Summary
  summaryCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: normalise(16),
    marginBottom: normalise(16),
  },
  summaryTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: normalise(11),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: normalise(12),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: normalise(6),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  summaryLabel2: { color: 'rgba(255,255,255,0.6)', fontSize: normalise(13) },
  summaryValue: { color: '#fff', fontSize: normalise(13), fontWeight: '700' },

  // Submit Button
  submitBtn: {
    backgroundColor: '#E8453C',
    borderRadius: 16,
    paddingVertical: normalise(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 6,
    shadowColor: '#E8453C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  submitBtnText: { color: '#fff', fontSize: normalise(16), fontWeight: '800' },

  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: normalise(20),
    paddingBottom: normalise(36),
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: normalise(16),
  },
  sheetTitle: {
    fontSize: normalise(18),
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: normalise(16),
  },
  approverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalise(12),
    borderRadius: 14,
    marginBottom: normalise(6),
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 10,
  },
  approverRowActive: { borderColor: '#E8453C', backgroundColor: '#FFF0F0' },
  approverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8453C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approverInitial: {
    color: '#fff',
    fontSize: normalise(18),
    fontWeight: '800',
  },
  approverInfo: { flex: 1 },
  approverName: {
    fontSize: normalise(14),
    fontWeight: '700',
    color: '#1F2937',
  },
  approverEmail: { fontSize: normalise(11), color: '#9CA3AF', marginTop: 2 },

  // Success
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: normalise(32),
    alignItems: 'center',
    width: '80%',
  },
  successIcon: { marginBottom: normalise(16) },
  successTitle: {
    fontSize: normalise(22),
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: normalise(8),
  },
  successSubtitle: {
    fontSize: normalise(13),
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: normalise(20),
  },
});
