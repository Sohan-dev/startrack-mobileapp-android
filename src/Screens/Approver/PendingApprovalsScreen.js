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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';

// ── Reject Reason Modal ───────────────────────────────────────────────────
const RejectModal = ({ visible, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Reason for Rejection</Text>
        <Text style={styles.sheetSubtitle}>
          Please provide a reason for rejecting this expense.
        </Text>
        <TextInput
          style={styles.reasonInput}
          placeholder="Enter rejection reason..."
          placeholderTextColor="#C4C4C4"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
          autoFocus
        />
        <View style={styles.sheetBtnRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              setReason('');
              onClose();
            }}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rejectConfirmBtn,
              !reason.trim() && { opacity: 0.5 },
            ]}
            onPress={() => {
              if (!reason.trim()) return;
              onConfirm(reason);
              setReason('');
            }}
            disabled={!reason.trim()}
          >
            <Icon name="close-circle-outline" size={18} color="#fff" />
            <Text style={styles.rejectConfirmBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ── Expense Card ──────────────────────────────────────────────────────────
function PendingCard({ item, index, onApprove, onReject }) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [expanded, setExpanded] = useState(false);

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
        {/* Top Row */}
        <View style={styles.cardTop}>
          {/* Employee Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.employeeName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>

          <View style={styles.cardTopInfo}>
            <Text style={styles.employeeName}>
              {item.employeeName || 'Unknown'}
            </Text>
            <Text style={styles.employeeEmail}>{item.employeeEmail || ''}</Text>
          </View>

          {/* Amount */}
          <View style={styles.amountBadge}>
            <Text style={styles.amountText}>
              ₹{formatAmount(item.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="calendar-outline" size={13} color="#9CA3AF" />
            <Text style={styles.infoText}>{formatDate(item.expenseDate)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="format-list-numbered" size={13} color="#9CA3AF" />
            <Text style={styles.infoText}>
              {item.entries?.length || 0} items
            </Text>
          </View>
          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => setExpanded(!expanded)}
          >
            <Icon
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={13}
              color="#E8453C"
            />
            <Text style={[styles.infoText, { color: '#E8453C' }]}>
              {expanded ? 'Less' : 'Details'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        {item.description ? (
          <Text style={styles.description} numberOfLines={1}>
            📝 {item.description}
          </Text>
        ) : null}

        {/* Expanded entries */}
        {expanded && item.entries?.length > 0 && (
          <View style={styles.entriesExpanded}>
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
                  ₹{formatAmount(entry.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => onReject(item)}
          >
            <Icon name="close-circle-outline" size={18} color="#F87171" />
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => onApprove(item)}
          >
            <Icon name="check-circle-outline" size={18} color="#fff" />
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────
export default function PendingApprovalsScreen(props) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPendingExpenses();
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

  const fetchPendingExpenses = async () => {
    try {
      const currentUserEmail = auth().currentUser?.email;
      console.log('Approver email:', currentUserEmail);
      const snap = await firestore()
        .collectionGroup('expenses')
        .where('status', '==', 'Pending')
        .orderBy('createdAt', 'desc')
        .get();

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
              expense.employeeUid = expense.userId || '';
            }
            return expense;
          }),
      );

      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setExpenses(data);
      console.log('Filtered expenses:', data.length);
    } catch (error) {
      console.log('Error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // const fetchPendingExpenses = async () => {
  //   try {
  //     const currentUserEmail = auth().currentUser?.email;
  //     console.log('Approver email:', currentUserEmail);

  //     const snap = await firestore()
  //       .collectionGroup('expenses')
  //       .where('status', '==', 'Pending')
  //       .where('approverEmail', '==', currentUserEmail)
  //       .orderBy('createdAt', 'desc')
  //       .get();

  //     console.log('Filtered pending:', snap.size);

  //     const data = await Promise.all(
  //       snap.docs.map(async doc => {
  //         const expense = { id: doc.id, ...doc.data() };

  //         try {
  //           // ✅ Use userId field directly instead of parent path
  //           const uid = expense.userId;
  //           if (uid) {
  //             const userDoc = await firestore()
  //               .collection('users')
  //               .doc(uid)
  //               .get();
  //             const userData = userDoc.data();
  //             expense.employeeName = userData?.displayName || 'Unknown';
  //             expense.employeeEmail = userData?.email || '';
  //             expense.employeeUid = uid;
  //           } else {
  //             expense.employeeName = 'Unknown';
  //             expense.employeeEmail = '';
  //             expense.employeeUid = '';
  //           }
  //         } catch (e) {
  //           console.log('Error fetching employee:', e);
  //           expense.employeeName = 'Unknown';
  //           expense.employeeEmail = '';
  //           expense.employeeUid = expense.userId || '';
  //         }

  //         return expense;
  //       }),
  //     );

  //     // Sort by createdAt
  //     data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  //     setExpenses(data);
  //     console.log('Expenses set:', data.length);
  //   } catch (error) {
  //     console.log('Error:', error.message);
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  // const fetchPendingExpenses = async () => {
  //   try {
  //     console.log('Starting fetch...');

  //     const snap = await firestore()
  //       .collectionGroup('expenses')
  //       .where('status', '==', 'Pending')
  //       .orderBy('createdAt', 'desc')
  //       .get();

  //     console.log('Snap size:', snap.size);
  //     console.log(
  //       'Docs:',
  //       snap.docs.map(d => d.data()),
  //     );
  //   } catch (error) {
  //     console.log('Error message:', error.message);
  //     console.log('Error code:', error.code);
  //   }
  // };

  // const fetchPendingExpenses = async () => {
  //   try {
  //     // Fetch all pending expenses across all users using collectionGroup
  //     const snap = await firestore()
  //       .collectionGroup('expenses')
  //       .where('status', '==', 'Pending')
  //       // .orderBy('createdAt', 'desc')
  //       .get();

  //     console.log('Total pending found:', snap.size); // ✅ add this

  //     // Fetch employee details for each expense
  //     const data = await Promise.all(
  //       snap.docs.map(async doc => {
  //         const expense = { id: doc.id, ...doc.data() };
  //         const parentPath = doc.ref.parent.parent; // users/{uid}

  //         try {
  //           const userDoc = await parentPath.get();
  //           const userData = userDoc.data();
  //           expense.employeeName = userData?.displayName || 'Unknown';
  //           expense.employeeEmail = userData?.email || '';
  //           expense.employeeUid = userData?.uid || '';
  //         } catch (e) {
  //           expense.employeeName = 'Unknown';
  //           expense.employeeEmail = '';
  //           expense.employeeUid = expense.userId || '';
  //         }

  //         return expense;
  //       }),
  //     );

  //     setExpenses(data);
  //   } catch (error) {
  //     console.log('Error fetching pending expenses:', error);
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  const handleApprove = expense => {
    Alert.alert(
      '✅ Approve Expense',
      `Approve ₹${expense.totalAmount} from ${expense.employeeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => processApproval(expense, 'Approved', ''),
        },
      ],
    );
  };

  const handleReject = expense => {
    setSelectedExpense(expense);
    setShowRejectModal(true);
  };

  const processApproval = async (expense, status, reason) => {
    try {
      setProcessingId(expense.id);
      const approverName = auth().currentUser?.displayName || 'Approver';

      // Update expense status in Firestore
      await firestore()
        .collection('users')
        .doc(expense.employeeUid)
        .collection('expenses')
        .doc(expense.id)
        .update({
          status: status,
          rejectionReason: reason || '',
          approvedBy: approverName,
          approvedAt: Date.now(),
        });

      // Send notification to employee
      const isApproved = status === 'Approved';
      await sendNotificationToEmployee(
        expense.employeeUid,
        isApproved ? '✅ Expense Approved!' : '❌ Expense Rejected',
        isApproved
          ? `Your expense of ₹${expense.totalAmount} has been approved by ${approverName}.`
          : `Your expense of ₹${expense.totalAmount} was rejected. Reason: ${reason}`,
        { screen: 'MyExpenses' },
      );

      // Remove from list
      setExpenses(prev => prev.filter(e => e.id !== expense.id));

      Alert.alert(
        isApproved ? '✅ Approved!' : '❌ Rejected!',
        `Expense has been ${status.toLowerCase()} successfully.`,
      );
    } catch (error) {
      console.log('Error processing approval:', error);
      Alert.alert('Error', 'Failed to process. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // Send notification to employee
  const sendNotificationToEmployee = async (
    employeeUid,
    title,
    body,
    data = {},
  ) => {
    try {
      const userDoc = await firestore()
        .collection('users')
        .doc(employeeUid)
        .get();
      const fcmToken = userDoc.data()?.fcmToken;
      console.log('Employee UID:', employeeUid); // ✅ check uid
      console.log('FCM Token:', fcmToken);
      if (!fcmToken) {
        console.log('❌ No FCM token found for employee!');
        return;
      }

      const notifDoc = await firestore()
        .collection('notifications')
        .add({
          to: fcmToken,
          toUid: employeeUid,
          fromUid: auth().currentUser?.uid || '',
          fromName: auth().currentUser?.displayName || 'Approver',
          title,
          body,
          data,
          createdAt: Date.now(),
          sent: false,
        });

      console.log('✅ Notification doc created:', notifDoc.id); // ✅ check doc created
      // if (!fcmToken) return;

      // await firestore()
      //   .collection('notifications')
      //   .add({
      //     to: fcmToken,
      //     toUid: employeeUid,
      //     fromUid: auth().currentUser?.uid || '',
      //     fromName: auth().currentUser?.displayName || 'Approver',
      //     title,
      //     body,
      //     data,
      //     createdAt: Date.now(),
      //     sent: false,
      //   });
      // console.log('✅ Notification doc created:', notifDoc.id); // ✅ check doc created
    } catch (error) {
      console.log('Notification error:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPendingExpenses();
  }, []);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="check-all" size={64} color="#E5E7EB" />
      <Text style={styles.emptyTitle}>All Caught Up!</Text>
      <Text style={styles.emptySubtitle}>No pending expenses to review</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryLeft}>
        <Text style={styles.summaryLabel}>Pending Reviews</Text>
        <Text style={styles.summaryCount}>
          {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.summarySubtitle}>Awaiting your approval</Text>
      </View>
      <View style={styles.summaryIcon}>
        <Icon name="clock-alert-outline" size={36} color="#F59E0B" />
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
          { transform: [{ translateY: headerAnim }], opacity: headerOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => props.navigation.goBack()}
        >
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={onRefresh}>
          <Icon name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8453C" />
          <Text style={styles.loadingText}>Fetching pending expenses...</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) =>
            processingId === item.id ? (
              <View style={styles.processingCard}>
                <ActivityIndicator color="#E8453C" />
                <Text style={styles.processingText}>Processing...</Text>
              </View>
            ) : (
              <PendingCard
                item={item}
                index={index}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )
          }
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

      {/* Reject Modal */}
      <RejectModal
        visible={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedExpense(null);
        }}
        onConfirm={reason => {
          setShowRejectModal(false);
          processApproval(selectedExpense, 'Rejected', reason);
          setSelectedExpense(null);
        }}
      />
    </SafeAreaView>
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

  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: normalise(18),
    marginTop: normalise(16),
    marginBottom: normalise(8),
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
  summaryCount: {
    fontSize: normalise(26),
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  summarySubtitle: { fontSize: normalise(12), color: '#9CA3AF', marginTop: 2 },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card
  cardWrapper: { marginBottom: normalise(12) },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: normalise(14),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalise(10),
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8453C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalise(10),
  },
  avatarText: { color: '#fff', fontSize: normalise(18), fontWeight: '800' },
  cardTopInfo: { flex: 1 },
  employeeName: {
    fontSize: normalise(15),
    fontWeight: '700',
    color: '#1F2937',
  },
  employeeEmail: { fontSize: normalise(11), color: '#9CA3AF', marginTop: 2 },
  amountBadge: {
    backgroundColor: '#F0FFF8',
    paddingHorizontal: normalise(10),
    paddingVertical: normalise(6),
    borderRadius: 10,
  },
  amountText: { fontSize: normalise(15), fontWeight: '800', color: '#34D399' },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: normalise(10),
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalise(8),
  },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: normalise(12), color: '#6B7280', fontWeight: '500' },
  description: {
    fontSize: normalise(12),
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: normalise(8),
  },

  // Expanded Entries
  entriesExpanded: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: normalise(10),
    marginBottom: normalise(8),
  },
  entryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalise(4),
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

  // Action Buttons
  actionRow: { flexDirection: 'row', gap: 10, marginTop: normalise(10) },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: normalise(12),
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  rejectBtnText: {
    color: '#F87171',
    fontSize: normalise(14),
    fontWeight: '700',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: normalise(12),
    borderRadius: 12,
    backgroundColor: '#34D399',
    elevation: 2,
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  approveBtnText: { color: '#fff', fontSize: normalise(14), fontWeight: '700' },

  // Processing
  processingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: normalise(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: normalise(12),
    elevation: 2,
  },
  processingText: {
    fontSize: normalise(14),
    color: '#9CA3AF',
    fontWeight: '600',
  },

  // Empty
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

  // Reject Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
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
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: normalise(6),
  },
  sheetSubtitle: {
    fontSize: normalise(13),
    color: '#9CA3AF',
    marginBottom: normalise(16),
  },
  reasonInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: normalise(14),
    fontSize: normalise(14),
    color: '#1F2937',
    minHeight: normalise(100),
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: normalise(16),
  },
  sheetBtnRow: { flexDirection: 'row', gap: 10 },
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
  rejectConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: normalise(14),
    borderRadius: 12,
    backgroundColor: '#F87171',
  },
  rejectConfirmBtnText: {
    fontSize: normalise(14),
    fontWeight: '700',
    color: '#fff',
  },
});
