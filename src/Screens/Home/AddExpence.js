/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import ImagePicker from 'react-native-image-crop-picker';
import MyStatusBar from '../../Utils/StatusBar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddExpenseScreen() {
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [approver, setApprover] = useState('');
  const [description, setDescription] = useState('');
  const [entries, setEntries] = useState([{ amount: '', receipt: null }]);

  const isDarkMode = useColorScheme() === 'dark';
  const totalAmount = entries.reduce((sum, item) => {
    const value = parseFloat(item.amount);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const addEntry = () => {
    setEntries([...entries, { amount: '', receipt: null }]);
  };

  const removeEntry = index => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
  };

  const pickReceipt = index => {
    Alert.alert('Upload Receipt', 'Choose an option', [
      { text: 'Camera', onPress: () => openCamera(index) },
      { text: 'Gallery', onPress: () => openGallery(index) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openCamera = index => {
    ImagePicker.openCamera({
      width: 800,
      height: 800,
      cropping: true,
      compressImageQuality: 0.7,
    })
      .then(image => {
        attachReceipt(image, index);
      })
      .catch(() => {});
  };

  const openGallery = index => {
    ImagePicker.openPicker({
      cropping: true,
      compressImageQuality: 0.7,
    })
      .then(image => {
        attachReceipt(image, index);
      })
      .catch(() => {});
  };

  const attachReceipt = (image, index) => {
    const updated = [...entries];
    updated[index].receipt = image;
    setEntries(updated);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F6FA' }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <MyStatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {/* Header */}
        <Text style={styles.header}>Add Expense</Text>
        <Text style={styles.subHeader}>Fill in the details below</Text>

        {/* Date Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Expense Date</Text>
          <TouchableOpacity
            style={styles.rowInput}
            onPress={() => setShowDate(true)}
          >
            <Icon name="calendar-month-outline" size={22} color="#0A3D62" />
            <Text style={styles.inputText}>{date.toDateString()}</Text>
          </TouchableOpacity>
        </View>

        {showDate && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(e, selected) => {
              setShowDate(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        {/* Expense Entries */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.label}>Expense Entries</Text>
            <TouchableOpacity onPress={addEntry}>
              <Icon name="plus-circle" size={22} color="#0A3D62" />
            </TouchableOpacity>
          </View>

          {entries.map((item, index) => (
            <View key={index} style={styles.entryRow}>
              <TextInput
                placeholder="Amount"
                keyboardType="numeric"
                placeholderTextColor={'#928d8d'}
                value={item.amount}
                onChangeText={text => {
                  const updated = [...entries];
                  updated[index].amount = text;
                  setEntries(updated);
                }}
                style={styles.amountInput}
              />
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => pickReceipt(index)}
              >
                <Icon name="camera-outline" size={22} color="#0A3D62" />
              </TouchableOpacity>
              {entries.length > 1 && (
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => removeEntry(index)}
                >
                  <Icon name="trash-can-outline" size={22} color="#e84118" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Approver */}
        <View style={styles.card}>
          <Text style={styles.label}>Approver</Text>
          <View style={styles.dropdown}>
            <Picker selectedValue={approver} onValueChange={setApprover}>
              <Picker.Item label="Select Approver" value="" color="#928d8d" />
              <Picker.Item label="Manager A" value="a" />
              <Picker.Item label="Manager B" value="b" />
            </Picker>
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            placeholder="Add short description"
            multiline
            placeholderTextColor={'#928d8d'}
            numberOfLines={4}
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹ {totalAmount.toFixed(2)}</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitText}>Submit Expense</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2f3640',
  },
  subHeader: {
    fontSize: 14,
    color: '#718093',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    color: '#2f3640',
    marginBottom: 8,
  },
  rowInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    padding: 14,
    borderRadius: 12,
  },
  inputText: {
    marginLeft: 10,
    fontWeight: '500',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  amountInput: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    borderRadius: 10,
    padding: 12,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
  },
  dropdown: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
  },
  textArea: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#0A3D62',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  totalCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2f3640',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A3D62',
  },
});
