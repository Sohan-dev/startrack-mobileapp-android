/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import showErrorAlert from '../../Utils/Toast';
import LottieView from 'lottie-react-native';
import MyStatusBar from '../../Utils/StatusBar';
import normalise from '../../Utils/Dimen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { sendNotificationToApprover } from '../../Utils/sendNotification';
import { trackExpenseSubmit } from '../../Utils/useAnalytics';

// ── Expense Types ─────────────────────────────────────────────────────────
const EXPENSE_TYPES = [
  { id: 'fuel', label: 'Fuel', icon: 'gas-station', color: '#F59E0B' },
  { id: 'hotel', label: 'Hotel', icon: 'bed', color: '#8B5CF6' },
  { id: 'food', label: 'Food', icon: 'food', color: '#EF4444' },
  { id: 'travel', label: 'Travel', icon: 'airplane', color: '#3B82F6' },
  { id: 'medical', label: 'Medical', icon: 'pill', color: '#10B981' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal', color: '#6B7280' },
];

const APPROVERS = [
  {
    name: 'Amit Das',
    email: 'amit@startrackautomation.in',
  },
  {
    name: 'Aparesh Mondal',
    email: 'aparesh@startrackautomation.in',
  },
  {
    name: 'Manoj Dasgupta',
    email: 'manoj@startrackautomation.in',
  },
  // {
  //   name: 'Shubhankar(Developer)',
  //   email: 'shubhankarkoner.sta@gmail.com',
  // },
];

// ── Type Selector Modal ───────────────────────────────────────────────────
const TypeModal = ({ visible, onSelect, onClose, selected }) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}
    />
    <View style={styles.sheet}>
      <View style={styles.sheetHandle} />
      <Text style={styles.sheetTitle}>Select Expense Type</Text>
      <View style={styles.typeGrid}>
        {EXPENSE_TYPES.map(type => {
          const isActive = selected === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeChip,
                isActive && {
                  backgroundColor: type.color + '18',
                  borderColor: type.color,
                },
              ]}
              onPress={() => {
                onSelect(type);
                onClose();
              }}
            >
              <View
                style={[
                  styles.typeIconWrap,
                  { backgroundColor: type.color + '20' },
                ]}
              >
                <Icon name={type.icon} size={20} color={type.color} />
              </View>
              <Text
                style={[
                  styles.typeChipLabel,
                  isActive && { color: type.color, fontWeight: '700' },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  </Modal>
);

// ── Approver Modal ────────────────────────────────────────────────────────
const ApproverModal = ({ visible, onSelect, onClose, selected }) => (
  <Modal visible={visible} transparent animationType="slide">
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}
    />
    <View style={styles.sheet}>
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
          <Text style={styles.approverName}>{approver.name}</Text>
          {selected?.email === approver.email && (
            <Icon name="check-circle" size={20} color="#E8453C" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  </Modal>
);

// ── Entry Row ─────────────────────────────────────────────────────────────
const EntryRow = ({ entry, onChange, onRemove, showRemove, index }) => {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const typeColor = entry.type?.color || '#9CA3AF';

  return (
    <View style={styles.entryRow}>
      <View style={styles.entryIndex}>
        <Text style={styles.entryIndexText}>{index + 1}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.entryTypeBtn,
          entry.type && {
            borderColor: typeColor,
            backgroundColor: typeColor + '10',
          },
        ]}
        onPress={() => setShowTypeModal(true)}
      >
        {entry.type ? (
          <>
            <Icon name={entry.type.icon} size={15} color={typeColor} />
            <Text style={[styles.entryTypeText, { color: typeColor }]}>
              {entry.type.label}
            </Text>
          </>
        ) : (
          <Text style={styles.entryTypePlaceholder}>Type ▾</Text>
        )}
      </TouchableOpacity>

      <View style={styles.entryAmountWrap}>
        <Text style={styles.rupeeSign}>₹</Text>
        <TextInput
          style={styles.entryAmountInput}
          placeholder="0.00"
          placeholderTextColor="#C4C4C4"
          keyboardType="decimal-pad"
          value={entry.amount}
          onChangeText={val => onChange('amount', val)}
        />
      </View>

      {/* <TouchableOpacity style={styles.cameraBtn}>
        <Icon name="camera-outline" size={18} color="#9CA3AF" />
      </TouchableOpacity> */}

      {showRemove && (
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Icon name="close-circle" size={20} color="#FCA5A5" />
        </TouchableOpacity>
      )}

      <TypeModal
        visible={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        selected={entry.type?.id}
        onSelect={type => onChange('type', type)}
      />
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────
export default function AddExpenseScreen(props) {
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [entries, setEntries] = useState([{ id: 1, type: null, amount: '' }]);
  const [approver, setApprover] = useState(null);
  const [description, setDescription] = useState('');
  const [showApproverModal, setShowApproverModal] = useState(false);
  const nextId = React.useRef(2);
  const [loading, setLoading] = useState(false);
  const [showAnim, setShowAnim] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  // ── Advance Balance ───────────────────────────────────────────────────
  const [advanceBalance, setAdvanceBalance] = useState(0);
  const [advanceIds, setAdvanceIds] = useState([]);

  useEffect(() => {
    fetchAdvanceBalance();
  }, []);

  const fetchAdvanceBalance = async () => {
    try {
      const uid = auth().currentUser?.uid;
      const snap = await firestore()
        .collection('users')
        .doc(uid)
        .collection('advances')
        .get();

      let totalBalance = 0;
      const ids = [];

      snap.forEach(doc => {
        const d = doc.data();
        if (d.status !== 'Approved') return;

        const paid = parseFloat(d.paidAmount ?? 0);
        const usedAlready = parseFloat(d.usedInExpense ?? 0);
        const available = paid - usedAlready;

        console.log(
          `Advance ${doc.id}: paid=${paid} used=${usedAlready} available=${available}`,
        );

        if (available > 0) {
          totalBalance += available;
          ids.push({ id: doc.id, available }); // ✅ store object not just id
        }
      });

      console.log('Total available balance:', totalBalance);
      setAdvanceBalance(totalBalance);
      setAdvanceIds(ids); // ✅ now [{id, available}]
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const addEntry = () => {
    setEntries(prev => [
      ...prev,
      { id: nextId.current++, type: null, amount: '' },
    ]);
  };

  const removeEntry = id => setEntries(prev => prev.filter(e => e.id !== id));

  const updateEntry = (id, field, value) => {
    setEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const totalAmount = entries.reduce(
    (sum, e) => sum + (parseFloat(e.amount) || 0),
    0,
  );
  const advanceDeducted = Math.min(advanceBalance, totalAmount);
  const netPayable = Math.max(totalAmount - advanceDeducted, 0);

  const submitExpense = async () => {
    try {
      const user = auth().currentUser;
      if (!user) {
        console.log('User not logged in');
        return;
      }
      if (!date) {
        showErrorAlert('Please select date');
        return;
      }
      if (entries.length === 0) {
        showErrorAlert('Please enter at least one entry');
        return;
      }
      if (!approver) {
        showErrorAlert('Please select approver');
        return;
      }

      setLoading(true);
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('expenses')
        .add({
          expenseDate: date,
          entries: entries,
          approver: approver?.name || '',
          approverEmail: approver?.email || '',
          description: description,
          totalAmount: totalAmount,
          advanceDeducted: advanceDeducted,
          netPayable: netPayable,
          advanceIds: advanceIds.map(a => a.id),
          createdAt: Date.now(),
          status: 'Pending',
          userId: user.uid,
        });
      await trackExpenseSubmit(totalAmount);
      if (advanceDeducted > 0 && advanceIds.length > 0) {
        let remainingToDeduct = advanceDeducted;

        for (const advance of advanceIds) {
          if (remainingToDeduct <= 0) break;

          const deductThis = Math.min(advance.available, remainingToDeduct);
          remainingToDeduct -= deductThis;

          const advDoc = await firestore()
            .collection('users')
            .doc(user.uid)
            .collection('advances')
            .doc(advance.id)
            .get();

          const currentUsed = parseFloat(advDoc.data()?.usedInExpense ?? 0);

          await firestore()
            .collection('users')
            .doc(user.uid)
            .collection('advances')
            .doc(advance.id)
            .update({
              usedInExpense: currentUsed + deductThis,
            });

          console.log(
            `✅ Advance ${advance.id}: usedInExpense updated to ${
              currentUsed + deductThis
            }`,
          );
        }
      }

      await sendNotificationToApprover(
        approver?.email,
        '📋 New Expense Request',
        `${user.displayName} submitted ₹${totalAmount.toFixed(
          2,
        )} for your approval.`,
        { screen: 'PendingApprovals' },
      );

      // await sendNotificationToSelf(
      //   '🧾 Expense Submitted!',
      //   `Your expense of ₹${totalAmount.toFixed(
      //     2,
      //   )} has been sent to ${approver}.`,
      //   { screen: 'MyExpenses' },
      // );

      showErrorAlert('Expense saved successfully 🔥');
      setLoading(false);
      setShowAnim(true);
      setTimeout(() => {
        props.navigation.goBack();
      }, 3000);
    } catch (error) {
      console.log('Error saving expense:', error);
      setLoading(false);
    }
  };

  const formatDate = d =>
    d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <SafeAreaView style={styles.safe}>
      <MyStatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => props.navigation.goBack()}
        >
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Expense Date */}
        <Text style={styles.sectionLabel}>Expense Date</Text>
        <TouchableOpacity style={styles.card} onPress={() => setShowDate(true)}>
          <View style={styles.dateIconWrap}>
            <Icon name="calendar-month-outline" size={22} color="#E8453C" />
          </View>
          <View style={styles.dateTextWrap}>
            <Text style={styles.dateLabelSmall}>Selected Date</Text>
            <Text style={styles.dateValue}>{formatDate(date)}</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        {showDate && (
          <DateTimePicker
            value={date}
            maximumDate={new Date()}
            mode="date"
            onChange={(e, selected) => {
              setShowDate(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        {/* Expense Entries */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Expense Entries</Text>
          <TouchableOpacity
            style={[
              styles.addEntryBtn,
              entries[entries.length - 1].amount === '' &&
                styles.addEntryBtnDisabled,
            ]}
            onPress={addEntry}
            disabled={entries[entries.length - 1].amount === ''}
          >
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.addEntryText}>Add Row</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.entriesCard}>
          {/* Column Headers */}
          <View style={styles.entryHeader}>
            <Text style={[styles.entryHeaderText, { width: 24 }]}>#</Text>
            <Text style={[styles.entryHeaderText, { flex: 1.2 }]}>Type</Text>
            <Text style={[styles.entryHeaderText, { flex: 1.5 }]}>Amount</Text>
            {/* <Text style={[styles.entryHeaderText, { width: 36 }]}>Pic</Text> */}
          </View>

          {entries.map((entry, idx) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              index={idx}
              onChange={(field, val) => updateEntry(entry.id, field, val)}
              onRemove={() => removeEntry(entry.id)}
              showRemove={entries.length > 1}
            />
          ))}
        </View>

        {/* Approver */}
        <Text style={styles.sectionLabel}>Approver</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowApproverModal(true)}
        >
          <View style={[styles.dateIconWrap, { backgroundColor: '#F0F9FF' }]}>
            <Icon name="account-check-outline" size={22} color="#38BDF8" />
          </View>
          <View style={styles.dateTextWrap}>
            <Text style={styles.dateLabelSmall}>Selected Approver</Text>
            <Text
              style={[
                styles.dateValue,
                !approver && { color: '#C4C4C4', fontWeight: '500' },
              ]}
            >
              {approver?.name || 'Tap to select'}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        {/* Description */}
        <Text style={styles.sectionLabel}>Description</Text>
        <View
          style={[
            styles.card,
            { alignItems: 'flex-start', paddingVertical: normalise(14) },
          ]}
        >
          <View
            style={[
              styles.dateIconWrap,
              { backgroundColor: '#F5F0FF', marginTop: 2 },
            ]}
          >
            <Icon name="text" size={20} color="#A78BFA" />
          </View>
          <TextInput
            style={styles.descInput}
            placeholder="Add a short description..."
            placeholderTextColor="#C4C4C4"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Advance Balance Banner */}
        {advanceBalance > 0 && (
          <View style={styles.advanceBanner}>
            <View style={styles.advanceBannerLeft}>
              <Icon name="wallet-outline" size={20} color="#6366F1" />
              <View>
                <Text style={styles.advanceBannerTitle}>
                  Advance Balance Available
                </Text>
                <Text style={styles.advanceBannerSub}>
                  Will be auto-deducted from this expense
                </Text>
              </View>
            </View>
            <Text style={styles.advanceBannerAmount}>
              ₹
              {advanceBalance.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        )}

        {/* Total Amount Banner */}
        <View style={styles.totalBanner}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalSub}>
              {entries.length} item{entries.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.totalValue}>₹ {totalAmount.toFixed(2)}</Text>
        </View>

        {/* Net Payable Banner — only show if advance deducted */}
        {advanceDeducted > 0 && (
          <View style={styles.netPayableBanner}>
            <View style={styles.netPayableRow}>
              <Text style={styles.netPayableLabel}>Total Expense</Text>
              <Text style={styles.netPayableValue}>
                ₹{totalAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.netPayableRow}>
              <Text style={styles.netPayableLabel}>Advance Deducted</Text>
              <Text style={[styles.netPayableValue, { color: '#6366F1' }]}>
                - ₹{advanceDeducted.toFixed(2)}
              </Text>
            </View>
            <View style={styles.netPayableDivider} />
            <View style={styles.netPayableRow}>
              <Text style={styles.netPayableFinalLabel}>Net Payable</Text>
              <Text style={styles.netPayableFinalValue}>
                ₹{netPayable.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={submitExpense}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="send-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>Submit Expense</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: normalise(24) }} />
      </ScrollView>

      <ApproverModal
        visible={showApproverModal}
        onClose={() => setShowApproverModal(false)}
        selected={approver}
        onSelect={setApprover}
      />

      {showAnim && (
        <View style={styles.successContainer}>
          <LottieView
            source={require('../../assets/success.json')}
            autoPlay
            loop={true}
            style={{ width: 200, height: 200 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6FB' },
  scroll: { flex: 1 },
  container: { paddingHorizontal: normalise(16), paddingBottom: normalise(40) },

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

  // Section
  sectionLabel: {
    fontSize: normalise(12),
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: normalise(18),
    marginBottom: normalise(8),
    marginLeft: normalise(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalise(18),
    marginBottom: normalise(8),
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: normalise(14),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  dateIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalise(12),
  },
  dateTextWrap: { flex: 1 },
  dateLabelSmall: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: normalise(15),
    fontWeight: '700',
    color: '#1F2937',
  },

  // Add Entry Button
  addEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8453C',
    borderRadius: 10,
    paddingHorizontal: normalise(12),
    paddingVertical: normalise(7),
  },
  addEntryBtnDisabled: { backgroundColor: '#FCA5A5' },
  addEntryText: {
    color: '#fff',
    fontSize: normalise(12),
    fontWeight: '700',
  },

  // Entries Card
  entriesCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: normalise(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: normalise(8),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: normalise(8),
    gap: 8,
  },
  entryHeaderText: {
    fontSize: normalise(10),
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Entry Row
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalise(10),
    gap: 8,
  },
  entryIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryIndexText: {
    fontSize: normalise(11),
    fontWeight: '700',
    color: '#6B7280',
  },
  entryTypeBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: normalise(8),
    paddingVertical: normalise(10),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  entryTypeText: {
    fontSize: normalise(12),
    fontWeight: '700',
    flex: 1,
  },
  entryTypePlaceholder: {
    fontSize: normalise(12),
    color: '#C4C4C4',
    flex: 1,
  },
  entryAmountWrap: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: normalise(8),
  },
  rupeeSign: {
    fontSize: normalise(14),
    color: '#6B7280',
    fontWeight: '700',
    marginRight: 4,
  },
  entryAmountInput: {
    flex: 1,
    fontSize: normalise(14),
    color: '#1F2937',
    fontWeight: '600',
    paddingVertical: normalise(10),
  },
  cameraBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    padding: 4,
  },

  // Description
  descInput: {
    flex: 1,
    fontSize: normalise(14),
    color: '#1F2937',
    paddingTop: 0,
    minHeight: normalise(60),
    textAlignVertical: 'top',
  },

  // Advance Balance Banner
  advanceBanner: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: normalise(14),
    marginTop: normalise(20),
    borderWidth: 1.5,
    borderColor: '#6366F120',
  },
  advanceBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: normalise(8),
  },
  advanceBannerTitle: {
    fontSize: normalise(11),
    fontWeight: '700',
    color: '#6366F1',
  },
  advanceBannerSub: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    marginTop: 2,
  },
  advanceBannerAmount: {
    fontSize: normalise(15),
    fontWeight: '800',
    color: '#6366F1',
    textAlign: 'right',
  },

  // Net Payable Banner
  netPayableBanner: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: normalise(14),
    marginBottom: normalise(14),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  netPayableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalise(4),
  },
  netPayableLabel: {
    fontSize: normalise(13),
    color: '#9CA3AF',
    fontWeight: '600',
  },
  netPayableValue: {
    fontSize: normalise(13),
    color: '#1F2937',
    fontWeight: '700',
  },
  netPayableDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: normalise(6),
  },
  netPayableFinalLabel: {
    fontSize: normalise(15),
    fontWeight: '800',
    color: '#1F2937',
  },
  netPayableFinalValue: {
    fontSize: normalise(18),
    fontWeight: '800',
    color: '#34D399',
  },

  // Total Banner
  totalBanner: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    paddingVertical: normalise(16),
    paddingHorizontal: normalise(18),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalise(20),
    marginBottom: normalise(14),
  },
  totalLabel: {
    fontSize: normalise(14),
    fontWeight: '700',
    color: '#fff',
  },
  totalSub: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    marginTop: 2,
  },
  totalValue: {
    fontSize: normalise(22),
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: -0.5,
  },

  // Submit
  submitBtn: {
    backgroundColor: '#E8453C',
    borderRadius: 14,
    paddingVertical: normalise(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#E8453C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: normalise(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Modal
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
    fontSize: normalise(17),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: normalise(18),
  },

  // Type Grid
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: normalise(12),
    paddingVertical: normalise(10),
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: '44%',
  },
  typeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeChipLabel: {
    fontSize: normalise(13),
    fontWeight: '600',
    color: '#4B5563',
  },

  // Approver
  approverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: normalise(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  approverRowActive: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    paddingHorizontal: normalise(8),
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  approverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approverInitial: {
    color: '#fff',
    fontWeight: '800',
    fontSize: normalise(16),
  },
  approverName: {
    flex: 1,
    fontSize: normalise(15),
    color: '#374151',
    fontWeight: '500',
  },

  // Success
  successContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
