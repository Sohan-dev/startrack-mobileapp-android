/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  BackHandler,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApp } from '@react-native-firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import MyStatusBar from '../../Utils/StatusBar';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import showErrorAlert from '../../Utils/Toast';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DASHBOARD_NAVIGATION } from '../../Navigation/route_names';
import { Colors } from '../../Themes/Themes';

// ── Icons (text-based fallback if no icon lib) ─────────────────────────────
const Icon = ({ name, size = 18, color = '#4a6278' }) => {
  const icons = {
    calendar: '📅',
    camera: '📷',
    plus: '＋',
    chevron: '›',
    fuel: '⛽',
    hotel: '🏨',
    food: '🍽️',
    travel: '✈️',
    medical: '💊',
    other: '📋',
    close: '✕',
  };
  return <Text style={{ fontSize: size }}>{icons[name] || '•'}</Text>;
};

// ── Expense Types ───────────────────────────────────────────────────────────
const EXPENSE_TYPES = [
  { id: 'fuel', label: 'Fuel', icon: 'fuel' },
  { id: 'hotel', label: 'Hotel', icon: 'hotel' },
  { id: 'food', label: 'Food', icon: 'food' },
  { id: 'travel', label: 'Travel', icon: 'travel' },
  { id: 'medical', label: 'Medical', icon: 'medical' },
  { id: 'other', label: 'Other', icon: 'other' },
];

const APPROVERS = [
  'Amit Das',
  'Aparesh Mondal',
  'Rishav Dasgupta',
  'Shubhankar(Developer)',
];

// ── Type Selector Modal ─────────────────────────────────────────────────────
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
        {EXPENSE_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeChip,
              selected === type.id && styles.typeChipActive,
            ]}
            onPress={() => {
              onSelect(type);
              onClose();
            }}
          >
            <Icon name={type.icon} size={22} />
            <Text
              style={[
                styles.typeChipLabel,
                selected === type.id && styles.typeChipLabelActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </Modal>
);

// ── Approver Modal ──────────────────────────────────────────────────────────
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
      {APPROVERS.map(name => (
        <TouchableOpacity
          key={name}
          style={[
            styles.approverRow,
            selected === name && styles.approverRowActive,
          ]}
          onPress={() => {
            onSelect(name);
            onClose();
          }}
        >
          <View style={styles.approverAvatar}>
            <Text style={styles.approverInitial}>{name[0]}</Text>
          </View>
          <Text
            style={[
              styles.approverName,
              selected === name && styles.approverNameActive,
            ]}
          >
            {name}
          </Text>
          {selected === name && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      ))}
    </View>
  </Modal>
);

// ── Entry Row ───────────────────────────────────────────────────────────────
const EntryRow = ({ entry, onChange, onRemove, showRemove }) => {
  const [showTypeModal, setShowTypeModal] = useState(false);

  return (
    <View style={styles.entryRow}>
      {/* Type selector */}
      <TouchableOpacity
        style={styles.entryTypeBtn}
        onPress={() => setShowTypeModal(true)}
      >
        {entry.type ? (
          <>
            <Icon name={entry.type.icon} size={16} />
            <Text style={styles.entryTypeText}>{entry.type.label}</Text>
          </>
        ) : (
          <Text style={styles.entryTypePlaceholder}>Type</Text>
        )}
        <Text style={styles.entryTypeChevron}>▾</Text>
      </TouchableOpacity>

      {/* Amount input */}
      <TextInput
        style={styles.entryAmountInput}
        placeholder="Amount"
        placeholderTextColor="#aab4be"
        keyboardType="decimal-pad"
        value={entry.amount}
        onChangeText={val => onChange('amount', val)}
      />

      {/* Camera */}
      <TouchableOpacity style={styles.cameraBtn}>
        <Icon name="camera" size={18} color="#5a7a92" />
      </TouchableOpacity>

      {/* Remove */}
      {showRemove && (
        <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
          <Text style={styles.removeBtnText}>✕</Text>
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

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function AddExpenseCopy(props) {
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [entries, setEntries] = useState([{ id: 1, type: null, amount: '' }]);
  const [approver, setApprover] = useState('');
  const [description, setDescription] = useState('');
  const [showApproverModal, setShowApproverModal] = useState(false);
  const nextId = React.useRef(2);
  const [loading, setLoading] = useState(false);
  const [showAnim, setShowAnim] = useState(false);

  const isDarkMode = useColorScheme() === 'dark';
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

  const totalAmount = entries.reduce((sum, e) => {
    const val = parseFloat(e.amount) || 0;
    return sum + val;
  }, 0);

  const handleSubmit = () => {
    submitExpense();
  };

  //   useFocusEffect(
  //   React.useCallback(() => {
  //     const onBackPress = () => {
  //       props.navigation.navigate(DASHBOARD_NAVIGATION.app_grid_expense_screen);
  //       return true;
  //     };

  //     BackHandler.addEventListener('hardwareBackPress', onBackPress);

  //     return () => {
  //       BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  //     };
  //   }, [])
  // );

  //_____________________ Submit Expence ___________________________________//

  const submitExpense = async () => {
    //  setLoading(true);
    try {
      const user = auth().currentUser;

      if (!user) {
        console.log('User not logged in');
        setLoading(false);
        return;
      }

      if (!date) {
        showErrorAlert('Please select date');
        return;
      } else if (entries.length === 0) {
        showErrorAlert('Please enter atleast one entry');
        return;
      } else if (!approver) {
        showErrorAlert('Please select approver');
        return;
      } else {
        setLoading(true);
        await firestore()
          .collection('users')
          .doc(user.uid)
          .collection('expenses')
          .add({
            expenseDate: date,
            entries: entries,
            approver: approver,
            description: description,
            totalAmount: totalAmount,
            createdAt: Date.now(),
            status: 'Pending',
            userId: user.uid,
          });
        showErrorAlert('Expense saved successfully 🔥');
        setLoading(false);
        setShowAnim(!loading);

        setTimeout(() => {
          props.navigation.goBack();
        }, 3000);
        console.log('Expense saved successfully 🔥');
      }
    } catch (error) {
      console.log('Error saving expense:', error);
    }
  };
  if (loading) return;
  <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.safe}>
      <MyStatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.white}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.heading}>Add Expense</Text>
        <Text style={styles.subheading}>Fill in the details below</Text>

        {/* Expense Date */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Expense Date</Text>
          <TouchableOpacity
            style={styles.dateRow}
            onPress={() => setShowDate(true)}
          >
            <Icon name="calendar" size={20} color="#1e3a5f" />
            <Text style={styles.dateText}>{date.toDateString()}</Text>
          </TouchableOpacity>
        </View>

        {showDate && (
          <DateTimePicker
            value={date}
            maximumDate={Date.now()}
            mode="date"
            onChange={(e, selected) => {
              setShowDate(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        {/* Expense Entries */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>Expense Entries</Text>
            <TouchableOpacity
              style={styles.addEntryBtn}
              onPress={addEntry}
              disabled={entries[0].amount === ''}
            >
              <Icon name="plus" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {entries.map((entry, idx) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onChange={(field, val) => updateEntry(entry.id, field, val)}
              onRemove={() => removeEntry(entry.id)}
              showRemove={entries.length > 1}
            />
          ))}
        </View>

        {/* Approver */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Approver</Text>
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => setShowApproverModal(true)}
          >
            <Text style={[styles.selectText, !approver && styles.placeholder]}>
              {approver || 'Select Approver'}
            </Text>
            <Text style={{ color: '#8a9bb0', fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Description</Text>
          <TextInput
            style={styles.descInput}
            placeholder="Add short description"
            placeholderTextColor="#aab4be"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹ {totalAmount.toFixed(2)}</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.submitText}>Submit Expense</Text>
        </TouchableOpacity>
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

// ── Styles ──────────────────────────────────────────────────────────────────
const BLUE = '#00bd42';
const LIGHT_BG = '#eef1f6';
const CARD_BG = '#ffffff';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT_BG },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },

  heading: { fontSize: 28, fontWeight: '800', color: '#1a2b3c', marginTop: 8 },
  subheading: { fontSize: 14, color: '#7a8d9e', marginBottom: 20 },

  // Cards
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a2b3c',
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  // Date
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: LIGHT_BG,
    borderRadius: 10,
    padding: 12,
  },
  dateText: { fontSize: 15, fontWeight: '600', color: '#1a2b3c' },

  // Add entry button
  addEntryBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Entry row
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },

  entryTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: LIGHT_BG,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 11,
    minWidth: 100,
  },
  entryTypeText: { fontSize: 13, fontWeight: '600', color: BLUE, flex: 1 },
  entryTypePlaceholder: { fontSize: 13, color: '#aab4be', flex: 1 },
  entryTypeChevron: { fontSize: 12, color: '#8a9bb0' },

  entryAmountInput: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1a2b3c',
  },
  cameraBtn: {
    backgroundColor: LIGHT_BG,
    borderRadius: 10,
    padding: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    padding: 8,
  },
  removeBtnText: { color: '#e05c5c', fontSize: 14, fontWeight: '600' },

  // Select field
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: LIGHT_BG,
    borderRadius: 10,
    padding: 13,
  },
  selectText: { fontSize: 14, color: '#1a2b3c', fontWeight: '500' },
  placeholder: { color: '#aab4be' },

  // Description
  descInput: {
    backgroundColor: LIGHT_BG,
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
    color: '#1a2b3c',
    minHeight: 48,
  },

  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a2b3c' },
  totalValue: { fontSize: 20, fontWeight: '800', color: BLUE },

  // Submit
  submitBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Modal / Bottom Sheet
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#dde2ea',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a2b3c',
    marginBottom: 18,
  },

  // Type grid
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: LIGHT_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeChipActive: { backgroundColor: '#e8f0f8', borderColor: BLUE },
  typeChipLabel: { fontSize: 13, fontWeight: '600', color: '#4a6278' },
  typeChipLabelActive: { color: BLUE },

  // Approver rows
  approverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f3f7',
  },
  approverRowActive: {
    backgroundColor: '#f0f5fb',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  approverAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approverInitial: { color: '#fff', fontWeight: '700', fontSize: 15 },
  approverName: { flex: 1, fontSize: 15, color: '#2a3d50', fontWeight: '500' },
  approverNameActive: { color: BLUE, fontWeight: '700' },
  checkmark: { color: BLUE, fontSize: 18, fontWeight: '700' },
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
