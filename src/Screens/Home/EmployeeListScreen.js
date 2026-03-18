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
  TextInput,
  Modal,
  Linking,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';

// ── Profile Modal ─────────────────────────────────────────────────────────
const ProfileModal = ({ visible, employee, onClose }) => {
  if (!employee) return null;

  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible]);

  const formatDate = ts => {
    if (!ts) return 'N/A';
    try {
      return new Date(ts).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const handleCall = () => {
    if (!employee.phoneNumber) return;
    Linking.openURL(`tel:${employee.phoneNumber}`);
  };

  const handleEmail = () => {
    if (!employee.email) return;
    Linking.openURL(`mailto:${employee.email}`);
  };

  // const handleWhatsApp = () => {
  //   if (!employee.phoneNumber) return;
  //   const phone = employee.phoneNumber.replace(/[^0-9]/g, '');
  //   Linking.openURL(`whatsapp://send?phone=91${phone}`);
  // };

  const handleWhatsApp = () => {
    if (!employee.phoneNumber) return;

    // ✅ Clean number — remove spaces, dashes, brackets
    const phone = employee.phoneNumber.replace(/[^0-9]/g, '');

    // ✅ Add country code if not present
    const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;

    // ✅ Try wa.me link — works on all devices
    const url = `https://wa.me/${fullPhone}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // ✅ Fallback — direct whatsapp intent
          Linking.openURL(`whatsapp://send?phone=${fullPhone}`);
        }
      })
      .catch(error => {
        console.log('WhatsApp error:', error);
        Alert.alert(
          'WhatsApp Not Found',
          'Please install WhatsApp to use this feature.',
        );
      });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.sheetHandle} />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.modalAvatarSection}>
            {employee.photoURL ? (
              <Image
                source={{ uri: employee.photoURL }}
                style={styles.modalAvatar}
              />
            ) : (
              <View style={styles.modalAvatarFallback}>
                <Text style={styles.modalAvatarText}>
                  {employee.displayName?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}

            {/* Role Badge */}
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor:
                    employee.role === 'approver' ? '#FFF9E6' : '#EFF6FF',
                },
              ]}
            >
              <Icon
                name={employee.role === 'approver' ? 'shield-crown' : 'account'}
                size={12}
                color={employee.role === 'approver' ? '#F59E0B' : '#3B82F6'}
              />
              <Text
                style={[
                  styles.roleBadgeText,
                  {
                    color: employee.role === 'approver' ? '#F59E0B' : '#3B82F6',
                  },
                ]}
              >
                {employee.role === 'approver' ? 'Approver' : 'Employee'}
              </Text>
            </View>

            <Text style={styles.modalName}>
              {employee.displayName || 'Unknown'}
            </Text>
            <Text style={styles.modalEmail}>{employee.email || ''}</Text>
          </View>

          {/* Info Cards */}
          <View style={styles.infoSection}>
            {employee.phoneNumber ? (
              <View style={styles.infoRow}>
                <View
                  style={[styles.infoIconWrap, { backgroundColor: '#F0FFF8' }]}
                >
                  <Icon name="phone-outline" size={18} color="#34D399" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{employee.phoneNumber}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.infoRow}>
              <View
                style={[styles.infoIconWrap, { backgroundColor: '#EFF6FF' }]}
              >
                <Icon name="email-outline" size={18} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {employee.email || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View
                style={[styles.infoIconWrap, { backgroundColor: '#FFF5F5' }]}
              >
                <Icon name="clock-outline" size={18} color="#F87171" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Last Active</Text>
                <Text style={styles.infoValue}>
                  {formatDate(employee.lastLogin)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View
                style={[styles.infoIconWrap, { backgroundColor: '#F5F0FF' }]}
              >
                <Icon name="calendar-outline" size={18} color="#A78BFA" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Joined</Text>
                <Text style={styles.infoValue}>
                  {formatDate(employee.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Buttons */}
          <Text style={styles.contactLabel}>Contact</Text>
          <View style={styles.contactRow}>
            {/* Call */}
            <TouchableOpacity
              style={[
                styles.contactBtn,
                { backgroundColor: '#F0FFF8' },
                !employee.phoneNumber && { opacity: 0.4 },
              ]}
              onPress={handleCall}
              disabled={!employee.phoneNumber}
            >
              <Icon name="phone" size={24} color="#34D399" />
              <Text style={[styles.contactBtnText, { color: '#34D399' }]}>
                Call
              </Text>
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity
              style={[
                styles.contactBtn,
                { backgroundColor: '#F0FFF8' },
                !employee.phoneNumber && { opacity: 0.4 },
              ]}
              onPress={handleWhatsApp}
              disabled={!employee.phoneNumber}
            >
              <Icon name="whatsapp" size={24} color="#25D366" />
              <Text style={[styles.contactBtnText, { color: '#25D366' }]}>
                WhatsApp
              </Text>
            </TouchableOpacity>

            {/* Email */}
            <TouchableOpacity
              style={[styles.contactBtn, { backgroundColor: '#EFF6FF' }]}
              onPress={handleEmail}
            >
              <Icon name="email" size={24} color="#3B82F6" />
              <Text style={[styles.contactBtnText, { color: '#3B82F6' }]}>
                Email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ── Employee Card ─────────────────────────────────────────────────────────
function EmployeeCard({ item, index, onPress }) {
  const slideAnim = useRef(new Animated.Value(40)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 50,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatLastActive = ts => {
    if (!ts) return 'Never';
    try {
      const diff = Date.now() - ts;
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return new Date(ts).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      });
    } catch {
      return 'N/A';
    }
  };

  const isOnline = item.lastLogin && Date.now() - item.lastLogin < 300000; // 5 mins

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(item)}
        activeOpacity={0.75}
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {item.displayName?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          {/* Online dot */}
          <View
            style={[
              styles.onlineDot,
              { backgroundColor: isOnline ? '#34D399' : '#E5E7EB' },
            ]}
          />
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.displayName || 'Unknown'}
            </Text>
            <View
              style={[
                styles.roleChip,
                {
                  backgroundColor:
                    item.role === 'approver' ? '#FFF9E6' : '#EFF6FF',
                },
              ]}
            >
              <Text
                style={[
                  styles.roleChipText,
                  { color: item.role === 'approver' ? '#F59E0B' : '#3B82F6' },
                ]}
              >
                {item.role === 'approver' ? '👑 Approver' : '👤 Employee'}
              </Text>
            </View>
          </View>

          <Text style={styles.cardEmail} numberOfLines={1}>
            {item.email || ''}
          </Text>

          <View style={styles.cardBottomRow}>
            {item.phoneNumber ? (
              <View style={styles.cardMeta}>
                <Icon name="phone-outline" size={11} color="#9CA3AF" />
                <Text style={styles.cardMetaText}>{item.phoneNumber}</Text>
              </View>
            ) : null}
            <View style={styles.cardMeta}>
              <Icon name="clock-outline" size={11} color="#9CA3AF" />
              <Text style={styles.cardMetaText}>
                {formatLastActive(item.lastLogin)}
              </Text>
            </View>
          </View>
        </View>

        {/* Chevron */}
        <Icon name="chevron-right" size={18} color="#D1D5DB" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────
export default function EmployeeListScreen(props) {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchEmployees();
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
    applyFilter();
  }, [search, activeFilter, employees]);

  const fetchEmployees = async () => {
    try {
      const currentUid = auth().currentUser?.uid;
      const snap = await firestore().collection('users').get();
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== currentUid); // exclude self
      data.sort((a, b) =>
        (a.displayName || '').localeCompare(b.displayName || ''),
      );
      setEmployees(data);
      setFiltered(data);
    } catch (error) {
      console.log('Error fetching employees:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = () => {
    let result = [...employees];

    // Role filter
    if (activeFilter === 'Employees')
      result = result.filter(e => e.role !== 'approver');
    if (activeFilter === 'Approvers')
      result = result.filter(e => e.role === 'approver');

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        e =>
          e.displayName?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.phoneNumber?.includes(q),
      );
    }

    setFiltered(result);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmployees();
  }, []);

  const FILTER_TABS = ['All', 'Employees', 'Approvers'];

  const totalCount = employees.length;
  const employeeCount = employees.filter(e => e.role !== 'approver').length;
  const approverCount = employees.filter(e => e.role === 'approver').length;

  const renderHeader = () => (
    <View>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderTopColor: '#E8453C' }]}>
          <Text style={[styles.summaryNum, { color: '#E8453C' }]}>
            {totalCount}
          </Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: '#3B82F6' }]}>
          <Text style={[styles.summaryNum, { color: '#3B82F6' }]}>
            {employeeCount}
          </Text>
          <Text style={styles.summaryLabel}>Employees</Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: '#F59E0B' }]}>
          <Text style={[styles.summaryNum, { color: '#F59E0B' }]}>
            {approverCount}
          </Text>
          <Text style={styles.summaryLabel}>Approvers</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Icon name="magnify" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email or phone..."
          placeholderTextColor="#C4C4C4"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              activeFilter === tab && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(tab)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === tab && styles.filterTabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.resultCount}>
        {filtered.length} member{filtered.length !== 1 ? 's' : ''} found
      </Text>
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
        <View>
          <Text style={styles.headerTitle}>Team Members</Text>
          <Text style={styles.headerSubtitle}>{totalCount} members</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={onRefresh}>
          <Icon name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8453C" />
          <Text style={styles.loadingText}>Loading team...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <EmployeeCard
              item={item}
              index={index}
              onPress={emp => {
                setSelectedEmployee(emp);
                setShowModal(true);
              }}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="account-group-outline" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Members Found</Text>
              <Text style={styles.emptySubtitle}>Try a different search</Text>
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

      {/* Profile Modal */}
      <ProfileModal
        visible={showModal}
        employee={selectedEmployee}
        onClose={() => {
          setShowModal(false);
          setSelectedEmployee(null);
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
    paddingBottom: normalise(32),
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

  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: normalise(16),
    marginBottom: normalise(12),
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: normalise(12),
    borderTopWidth: 3,
    elevation: 2,
    alignItems: 'center',
  },
  summaryNum: { fontSize: normalise(22), fontWeight: '800' },
  summaryLabel: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: normalise(12),
    marginBottom: normalise(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: normalise(14),
    color: '#1F2937',
    paddingVertical: 0,
  },

  // Filters
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: normalise(10) },
  filterTab: {
    flex: 1,
    paddingVertical: normalise(8),
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  filterTabActive: { backgroundColor: '#FFF0F0', borderColor: '#E8453C' },
  filterTabText: {
    fontSize: normalise(12),
    fontWeight: '600',
    color: '#9CA3AF',
  },
  filterTabTextActive: { color: '#E8453C', fontWeight: '700' },
  resultCount: {
    fontSize: normalise(12),
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: normalise(8),
    marginLeft: normalise(4),
  },

  // Card
  cardWrapper: { marginBottom: normalise(8) },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: normalise(14),
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8453C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: normalise(20), fontWeight: '800' },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardInfo: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalise(3),
  },
  cardName: {
    fontSize: normalise(14),
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 6,
  },
  roleChip: {
    paddingHorizontal: normalise(7),
    paddingVertical: normalise(3),
    borderRadius: 20,
  },
  roleChipText: { fontSize: normalise(10), fontWeight: '700' },
  cardEmail: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    marginBottom: normalise(4),
  },
  cardBottomRow: { flexDirection: 'row', gap: 12 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardMetaText: { fontSize: normalise(11), color: '#9CA3AF' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: normalise(20),
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: normalise(16),
  },
  modalAvatarSection: { alignItems: 'center', marginBottom: normalise(20) },
  modalAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: normalise(10),
  },
  modalAvatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E8453C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalise(10),
  },
  modalAvatarText: {
    color: '#fff',
    fontSize: normalise(36),
    fontWeight: '800',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: normalise(10),
    paddingVertical: normalise(4),
    borderRadius: 20,
    marginBottom: normalise(8),
  },
  roleBadgeText: { fontSize: normalise(12), fontWeight: '700' },
  modalName: {
    fontSize: normalise(22),
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: normalise(4),
  },
  modalEmail: { fontSize: normalise(13), color: '#9CA3AF' },
  infoSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: normalise(4),
    marginBottom: normalise(16),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: normalise(12),
    gap: 12,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: normalise(13),
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 2,
  },
  contactLabel: {
    fontSize: normalise(12),
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: normalise(10),
  },
  contactRow: { flexDirection: 'row', gap: 10, marginBottom: normalise(16) },
  contactBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: normalise(14),
    borderRadius: 14,
    gap: 6,
  },
  contactBtnText: { fontSize: normalise(12), fontWeight: '700' },
  closeBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: normalise(14),
    alignItems: 'center',
    marginBottom: normalise(8),
  },
  closeBtnText: {
    fontSize: normalise(15),
    fontWeight: '700',
    color: '#6B7280',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: normalise(60),
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
  },
});
