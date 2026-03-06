/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import showErrorAlert from '../../Utils/Toast';
import MyStatusBar from '../../Utils/StatusBar';
import normalise from '../../Utils/Dimen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
    name: 'Rishav Dasgupta',
    email: 'manoj@startrackautomation.in',
  },
  {
    name: 'Shubhankar(Developer)',
    email: 'shubhankarkoner.sta@gmail.com',
  },
];

// ── Type Modal ────────────────────────────────────────────────────────────
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
          value={String(entry.amount || '')}
          onChangeText={val => onChange('amount', val)}
        />
      </View>

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
export default function EditExpenseScreen(props) {
  const expense = props.route?.params?.expense;

  // Parse date safely from Firestore timestamp or string
  const parseDate = raw => {
    if (!raw) return new Date();
    if (raw?.toDate) return raw.toDate();
    if (raw?.seconds) return new Date(raw.seconds * 1000);
    return new Date(raw);
  };

  const [date, setDate] = useState(parseDate(expense?.expenseDate));
  const [showDate, setShowDate] = useState(false);
  const [entries, setEntries] = useState(
    expense?.entries?.length
      ? expense.entries.map((e, i) => ({ ...e, id: i + 1 }))
      : [{ id: 1, type: null, amount: '' }],
  );
  const [approver, setApprover] = useState(expense?.approver || '');
  const [approverEmail, setApproverEmail] = useState(
    expense?.approverEmail || '',
  );
  const [updateApprover, setUpdateApproverEmail] = useState(null);
  const [description, setDescription] = useState(expense?.description || '');
  const [showApproverModal, setShowApproverModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const nextId = React.useRef(entries.length + 1);

  const isReadOnly = expense?.status !== 'Pending';

  console.log(expense?.approver, '..../....');

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

  const formatDate = d =>
    d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const handleUpdate = async () => {
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

    Alert.alert(
      'Update Expense',
      'Are you sure you want to update this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: () => saveUpdate() },
      ],
    );
  };

  const saveUpdate = async () => {
    try {
      setLoading(true);
      const uid = auth().currentUser?.uid;

      await firestore()
        .collection('users')
        .doc(uid)
        .collection('expenses')
        .doc(expense.id)
        .update({
          expenseDate: date,
          entries: entries,
          approver: updateApprover?.name || expense?.approver,
          approverEmail: updateApprover?.email || expense?.approverEmail,
          description: description,
          totalAmount: totalAmount,
          updatedAt: Date.now(),
        });

      showErrorAlert('Expense updated successfully ✅');
      setTimeout(() => {
        props.navigation.goBack();
      }, 1500);
    } catch (error) {
      console.log('Update error:', error);
      Alert.alert('Error', 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>
          {isReadOnly ? 'View Expense' : 'Edit Expense'}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Read-only Banner */}
      {isReadOnly && (
        <View
          style={[
            styles.statusBanner,
            expense?.status === 'Approved'
              ? { backgroundColor: '#F0FFF8', borderColor: '#34D399' }
              : { backgroundColor: '#FFF5F5', borderColor: '#F87171' },
          ]}
        >
          <Icon
            name={
              expense?.status === 'Approved'
                ? 'check-circle-outline'
                : 'close-circle-outline'
            }
            size={18}
            color={expense?.status === 'Approved' ? '#34D399' : '#F87171'}
          />
          <Text
            style={[
              styles.statusBannerText,
              { color: expense?.status === 'Approved' ? '#34D399' : '#F87171' },
            ]}
          >
            This expense is {expense?.status} and cannot be edited
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Expense Date */}
        <Text style={styles.sectionLabel}>Expense Date</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => !isReadOnly && setShowDate(true)}
          activeOpacity={isReadOnly ? 1 : 0.7}
        >
          <View style={styles.dateIconWrap}>
            <Icon name="calendar-month-outline" size={22} color="#E8453C" />
          </View>
          <View style={styles.dateTextWrap}>
            <Text style={styles.dateLabelSmall}>Selected Date</Text>
            <Text style={styles.dateValue}>{formatDate(date)}</Text>
          </View>
          {!isReadOnly && (
            <Icon name="chevron-right" size={20} color="#D1D5DB" />
          )}
          {isReadOnly && <Icon name="lock-outline" size={18} color="#D1D5DB" />}
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
          {!isReadOnly && (
            <TouchableOpacity
              style={[
                styles.addEntryBtn,
                entries[entries.length - 1]?.amount === '' &&
                  styles.addEntryBtnDisabled,
              ]}
              onPress={addEntry}
              disabled={entries[entries.length - 1]?.amount === ''}
            >
              <Icon name="plus" size={16} color="#fff" />
              <Text style={styles.addEntryText}>Add Row</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.entriesCard}>
          <View style={styles.entryHeader}>
            <Text style={[styles.entryHeaderText, { width: 24 }]}>#</Text>
            <Text style={[styles.entryHeaderText, { flex: 1.2 }]}>Type</Text>
            <Text style={[styles.entryHeaderText, { flex: 1.5 }]}>Amount</Text>
          </View>
          {entries.map((entry, idx) =>
            isReadOnly ? (
              // Read-only entry view
              <View key={entry.id || idx} style={styles.readOnlyEntry}>
                <View style={styles.entryIndex}>
                  <Text style={styles.entryIndexText}>{idx + 1}</Text>
                </View>
                <View
                  style={[
                    styles.readOnlyType,
                    {
                      backgroundColor: (entry.type?.color || '#6B7280') + '15',
                    },
                  ]}
                >
                  <Icon
                    name={entry.type?.icon || 'dots-horizontal'}
                    size={14}
                    color={entry.type?.color || '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.readOnlyTypeText,
                      { color: entry.type?.color || '#6B7280' },
                    ]}
                  >
                    {entry.type?.label || 'N/A'}
                  </Text>
                </View>
                <Text style={styles.readOnlyAmount}>
                  ₹ {parseFloat(entry.amount || 0).toFixed(2)}
                </Text>
              </View>
            ) : (
              <EntryRow
                key={entry.id || idx}
                entry={entry}
                index={idx}
                onChange={(field, val) => updateEntry(entry.id, field, val)}
                onRemove={() => removeEntry(entry.id)}
                showRemove={entries.length > 1}
              />
            ),
          )}
        </View>

        {/* Approver */}
        <Text style={styles.sectionLabel}>Approver</Text>
        <TouchableOpacity
          style={styles.card}
          onPress={() => !isReadOnly && setShowApproverModal(true)}
          activeOpacity={isReadOnly ? 1 : 0.7}
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
              {updateApprover?.name || expense.approver}
            </Text>
          </View>

          {!isReadOnly && (
            <Icon name="chevron-right" size={20} color="#D1D5DB" />
          )}
          {isReadOnly && <Icon name="lock-outline" size={18} color="#D1D5DB" />}
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
            style={[styles.descInput, isReadOnly && { color: '#6B7280' }]}
            placeholder="No description"
            placeholderTextColor="#C4C4C4"
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!isReadOnly}
          />
        </View>

        {/* Total Banner */}
        <View style={styles.totalBanner}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalSub}>
              {entries.length} item{entries.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.totalValue}>₹ {totalAmount.toFixed(2)}</Text>
        </View>

        {/* Update Button — only for Pending */}
        {!isReadOnly && (
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="content-save-edit-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>Update Expense</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: normalise(30) }} />
      </ScrollView>

      <ApproverModal
        visible={showApproverModal}
        onClose={() => setShowApproverModal(false)}
        selected={approver}
        onSelect={setUpdateApproverEmail}
      />
    </SafeAreaView>
  );
}

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

  // Status Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: normalise(16),
    marginTop: normalise(12),
    padding: normalise(12),
    borderRadius: 12,
    borderWidth: 1.5,
  },
  statusBannerText: {
    fontSize: normalise(13),
    fontWeight: '600',
    flex: 1,
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

  // Add Entry
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
  addEntryText: { color: '#fff', fontSize: normalise(12), fontWeight: '700' },

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

  // Entry Row (editable)
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
  entryTypeText: { fontSize: normalise(12), fontWeight: '700', flex: 1 },
  entryTypePlaceholder: { fontSize: normalise(12), color: '#C4C4C4', flex: 1 },
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
  removeBtn: { padding: 4 },

  // Read-only Entry
  readOnlyEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalise(8),
    gap: 8,
  },
  readOnlyType: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: normalise(10),
    paddingVertical: normalise(8),
  },
  readOnlyTypeText: { fontSize: normalise(12), fontWeight: '700' },
  readOnlyAmount: {
    flex: 1.5,
    fontSize: normalise(14),
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'right',
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
  totalLabel: { fontSize: normalise(14), fontWeight: '700', color: '#fff' },
  totalSub: { fontSize: normalise(11), color: '#9CA3AF', marginTop: 2 },
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
});
