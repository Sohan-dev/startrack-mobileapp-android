/* eslint-disable react-native/no-inline-styles */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  BackHandler,
} from 'react-native';
import MyStatusBar from '../../Utils/StatusBar';
import normalise from '../../Utils/Dimen';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  ADVANCE_PAY_NAVIGATION,
  APPROVER_NAVIGATION,
  DASHBOARD_NAVIGATION,
  PROFILE_NAVIGATION,
} from '../../Navigation/route_names';
import { useDispatch } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { getHomeData } from '../../redux/action/ProfileAction';
import usePushNotification from '../../Utils/usePushNotification';
import { useFocusEffect } from '@react-navigation/native';
import showErrorAlert from '../../Utils/Toast';

const EMPLOYEE_MENU = [
  {
    id: 1,
    title: 'Add Expense',
    icon: 'plus-circle-outline',
    path: DASHBOARD_NAVIGATION.app_grid_add_expense_screen,
    color: '#FF6B6B',
    bg: '#FFF0F0',
  },
  {
    id: 2,
    title: 'My Expenses',
    icon: 'file-document-outline',
    path: DASHBOARD_NAVIGATION.app_grid_my_expence,
    color: '#4ECDC4',
    bg: '#F0FFFE',
  },
  {
    id: 3,
    title: 'Employees',
    icon: 'account-group-outline',
    path: '',
    color: '#A78BFA',
    bg: '#F5F0FF',
  },
  {
    id: 4,
    title: 'Request Advances',
    icon: 'cash-fast',
    path: ADVANCE_PAY_NAVIGATION.proceed_to_req_advance_pay,
    color: '#36b781',
    bg: '#EEF2FF',
  },
  {
    id: 4,
    title: 'My Advances',
    icon: 'cash-fast',
    path: ADVANCE_PAY_NAVIGATION.my_advance_pay_list,
    color: '#8fcc49',
    bg: '#EEF2FF',
  },
  // {
  //   id: 4,
  //   title: 'Approved',
  //   icon: 'check-decagram-outline',
  //   path: '',
  //   color: '#34D399',
  //   bg: '#F0FFF8',
  // },
  // {
  //   id: 5,
  //   title: 'Rejected',
  //   icon: 'close-octagon-outline',
  //   path: '',
  //   color: '#FB923C',
  //   bg: '#FFF5F0',
  // },
  // {
  //   id: 6,
  //   title: 'Reports',
  //   icon: 'chart-areaspline',
  //   path: '',
  //   color: '#38BDF8',
  //   bg: '#F0F9FF',
  // },
];

const APPROVER_MENU = [
  {
    id: 1,
    title: 'Pending',
    icon: 'clock-alert-outline',
    path: APPROVER_NAVIGATION.approver_pending_expense,
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    id: 2,
    title: 'All Expenses',
    icon: 'format-list-bulleted',
    path: APPROVER_NAVIGATION.approver_all_expense_history,
    color: '#4ECDC4',
    bg: '#F0FFFE',
  },
  {
    id: 3,
    title: 'Advances Pay',
    icon: 'cash-fast',
    path: 'MyAdvances',
    color: '#6366F1',
    bg: '#EEF2FF',
  },
  // {
  //   id: 4,
  //   title: 'Rejected',
  //   icon: 'close-octagon-outline',
  //   path: '',
  //   color: '#FB923C',
  //   bg: '#FFF5F0',
  // },
  // {
  //   id: 5,
  //   title: 'Employees',
  //   icon: 'account-group-outline',
  //   path: '',
  //   color: '#A78BFA',
  //   bg: '#F5F0FF',
  // },
  // {
  //   id: 6,
  //   title: 'Reports',
  //   icon: 'chart-areaspline',
  //   path: '',
  //   color: '#38BDF8',
  //   bg: '#F0F9FF',
  // },
];

function AnimatedCard({ item, index, onPress }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 80,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(pressAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  const handlePressOut = () =>
    Animated.spring(pressAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }],
          opacity: scaleAnim,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.card, { backgroundColor: item.bg }]}
      >
        <View
          style={[styles.decorCircle, { backgroundColor: item.color + '18' }]}
        />
        <View
          style={[styles.iconContainer, { backgroundColor: item.color + '22' }]}
        >
          <Icon name={item.icon} size={28} color={item.color} />
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View
          style={[styles.arrowBadge, { backgroundColor: item.color + '15' }]}
        >
          <Icon name="arrow-right" size={12} color={item.color} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Dashboard(props) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const headerAnim = useRef(new Animated.Value(-60)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const backPressedOnce = useRef(false);
  const dispatch = useDispatch();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (backPressedOnce.current) {
          // Second press — exit app
          BackHandler.exitApp();
          return true;
        }

        // First press — show toast
        backPressedOnce.current = true;
        showErrorAlert('Press back again to exit');

        // Reset after 2 seconds
        setTimeout(() => {
          backPressedOnce.current = false;
        }, 2000);

        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

  usePushNotification(props.navigation);

  useEffect(() => {
    fetchUserData();
    fetchExpenseCounts();
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

  const fetchUserData = async () => {
    try {
      const uid = auth().currentUser?.uid;
      const doc = await firestore().collection('users').doc(uid).get();
      if (doc.exists) {
        const data = doc.data();
        // dispatch(getHomeData(data));
        setUserData(data);
        // fetchExpenseCounts(uid, data.role);
      }
    } catch (error) {
      console.log('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseCounts = async () => {
    try {
      var role = '';
      const uid = auth().currentUser?.uid;
      const doc = await firestore().collection('users').doc(uid).get();
      if (doc.exists) {
        const data = doc.data();
        role = data?.role;
      }
      if (role === 'approver') {
        const currentUserEmail = auth().currentUser?.email;
        const snap = await firestore().collectionGroup('expenses').get();
        const all = snap.docs.map(d => d.data());

        setPendingCount(
          all.filter(
            e => e.status === 'Pending' && e.approverEmail === currentUserEmail,
          ).length,
        );
        setApprovedCount(
          all.filter(
            e =>
              e.status === 'Approved' && e.approverEmail === currentUserEmail,
          ).length,
        );
        setRejectedCount(
          all.filter(
            e =>
              e.status === 'Rejected' && e.approverEmail === currentUserEmail,
          ).length,
        );
        setLoading(false);
      } else {
        // Employee — own expenses only
        const base = firestore()
          .collection('users')
          .doc(uid)
          .collection('expenses');

        const snap = await base.get();
        const all = snap.docs.map(d => d.data());

        setPendingCount(all.filter(e => e.status === 'Pending').length);
        setApprovedCount(all.filter(e => e.status === 'Approved').length);
        setRejectedCount(all.filter(e => e.status === 'Rejected').length);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log('Error fetching counts:', error);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const isApprover = userData?.role === 'approver';
  const MENU = isApprover ? APPROVER_MENU : EMPLOYEE_MENU;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8453C" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MyStatusBar barStyle="light-content" backgroundColor={'#E8453C'} />

      <Animated.View
        style={[
          styles.header,
          { transform: [{ translateY: headerAnim }], opacity: headerOpacity },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.greetingText}>{greeting()},</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginTop: 2,
            }}
          >
            <Text style={styles.nameText}>
              {userData?.displayName?.split(' ')[0] || 'User'} 👋
            </Text>
            {/* <View
              style={[
                styles.roleBadge,
                isApprover
                  ? { backgroundColor: '#FFD700' }
                  : { backgroundColor: 'rgba(255,255,255,0.25)' },
              ]}
            >
              <Icon
                name={isApprover ? 'shield-check' : 'account'}
                size={11}
                color={isApprover ? '#1F2937' : '#fff'}
              />
              <Text
                style={[
                  styles.roleBadgeText,
                  { color: isApprover ? '#1F2937' : '#fff' },
                ]}
              >
                {isApprover ? 'Approver' : 'Employee'}
              </Text>
            </View> */}
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Icon name="bell-outline" size={22} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={[styles.headerBtn, styles.avatarBtn]}
            onPress={() => dispatch(getLogout())}
          >
            <Icon name="account-outline" size={22} color="#fff" />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[styles.headerBtn, styles.avatarBtn]}
            onPress={() =>
              props.navigation.navigate(PROFILE_NAVIGATION.app_profile_screen)
            }
          >
            <Icon name="account-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
            {pendingCount}
          </Text>
          <Text style={styles.statLabel}>
            {isApprover ? 'To Review' : 'Pending'}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#34D399' }]}>
            {approvedCount}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FB923C' }]}>
            {rejectedCount}
          </Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>
        {isApprover ? 'Approver Actions' : 'Quick Actions'}
      </Text>

      <View style={styles.grid}>
        {MENU.map((item, index) => (
          <AnimatedCard
            key={item.id}
            item={item}
            index={index}
            onPress={() => item.path && props.navigation.navigate(item.path)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FB' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#E8453C',
    paddingHorizontal: normalise(16),
    paddingTop: normalise(12),
    paddingBottom: normalise(18),
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
  headerLeft: { flex: 1 },
  greetingText: { color: 'rgba(255,255,255,0.8)', fontSize: normalise(12) },
  nameText: { color: '#fff', fontSize: normalise(20), fontWeight: '700' },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: normalise(8),
    paddingVertical: normalise(3),
    borderRadius: 20,
  },
  roleBadgeText: { fontSize: normalise(10), fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBtn: { backgroundColor: 'rgba(255,255,255,0.25)' },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE234',
    borderWidth: 1.5,
    borderColor: '#E8453C',
  },
  statsBanner: {
    backgroundColor: '#fff',
    marginHorizontal: normalise(16),
    marginTop: normalise(16),
    borderRadius: 16,
    paddingVertical: normalise(14),
    paddingHorizontal: normalise(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: {
    fontSize: normalise(22),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: { width: 1, height: 36, backgroundColor: '#F0F0F0' },
  sectionLabel: {
    fontSize: normalise(13),
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginHorizontal: normalise(20),
    marginTop: normalise(20),
    marginBottom: normalise(4),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: normalise(12),
    paddingTop: normalise(8),
  },
  cardWrapper: { width: '50%', padding: normalise(6) },
  card: {
    borderRadius: 18,
    padding: normalise(16),
    height: normalise(120),
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
    elevation: 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  decorCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -20,
    right: -20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalise(10),
  },
  cardTitle: { fontSize: normalise(13), fontWeight: '700', color: '#1F2937' },
  arrowBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
