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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';

// ── Notification icon & color based on title ──────────────────────────────
const getNotifStyle = title => {
  const t = title?.toLowerCase() || '';
  if (t.includes('approved') || t.includes('approval'))
    return { icon: 'check-circle-outline', color: '#34D399', bg: '#F0FFF8' };
  if (t.includes('rejected') || t.includes('reject'))
    return { icon: 'close-circle-outline', color: '#F87171', bg: '#FFF5F5' };
  if (t.includes('paid') || t.includes('payment'))
    return { icon: 'cash-check', color: '#6366F1', bg: '#EEF2FF' };
  if (t.includes('advance'))
    return { icon: 'cash-fast', color: '#F59E0B', bg: '#FFFBEB' };
  if (t.includes('expense') || t.includes('request'))
    return { icon: 'file-document-outline', color: '#3B82F6', bg: '#EFF6FF' };
  return { icon: 'bell-outline', color: '#9CA3AF', bg: '#F9FAFB' };
};

// ── Notification Card ─────────────────────────────────────────────────────
function NotifCard({ item, index, onPress }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 40,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const { icon, color, bg } = getNotifStyle(item.title);

  const formatTime = ts => {
    if (!ts) return '';
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
      return '';
    }
  };

  return (
    <Animated.View
      style={[{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}
    >
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <Icon name={icon} size={24} color={color} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text
              style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}
              numberOfLines={1}
            >
              {item.title || 'Notification'}
            </Text>
            <Text style={styles.cardTime}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.cardBody} numberOfLines={2}>
            {item.body || ''}
          </Text>
          {item.fromName ? (
            <View style={styles.fromRow}>
              <Icon name="account-outline" size={11} color="#9CA3AF" />
              <Text style={styles.fromText}>{item.fromName}</Text>
            </View>
          ) : null}
        </View>

        {/* Unread dot */}
        {!item.read && (
          <View style={[styles.unreadDot, { backgroundColor: color }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────
export default function NotificationScreen(props) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchNotifications();
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

  const fetchNotifications = async () => {
    try {
      const uid = auth().currentUser?.uid;

      const snap = await firestore()
        .collection('notifications')
        .where('toUid', '==', uid)
        .orderBy('createdAt', 'desc')
        .get();

      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async item => {
    if (item.read) {
      // navigate if already read
      navigateToScreen(item);
      return;
    }
    try {
      await firestore()
        .collection('notifications')
        .doc(item.id)
        .update({ read: true });
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, read: true } : n)),
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
      navigateToScreen(item);
    } catch (error) {
      console.log('Mark read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(
        unread.map(n =>
          firestore()
            .collection('notifications')
            .doc(n.id)
            .update({ read: true }),
        ),
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.log('Mark all read error:', error);
    }
  };

  const navigateToScreen = item => {
    const screen = item.data?.screen;
    if (!screen || !props.navigation) return;
    try {
      props.navigation.navigate(screen);
    } catch (e) {
      console.log('Navigation error:', e);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderText}>
        {notifications.length} notification
        {notifications.length !== 1 ? 's' : ''}
      </Text>
      {unreadCount > 0 && (
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}
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
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
          )}
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={onRefresh}>
          <Icon name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E8453C" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <NotifCard item={item} index={index} onPress={markAsRead} />
          )}
          ListHeaderComponent={notifications.length > 0 ? renderHeader : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="bell-off-outline" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>You're all caught up!</Text>
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: normalise(11),
    textAlign: 'center',
    marginTop: 2,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // List header
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: normalise(16),
    marginBottom: normalise(10),
    paddingHorizontal: normalise(4),
  },
  listHeaderText: {
    fontSize: normalise(13),
    color: '#9CA3AF',
    fontWeight: '600',
  },
  markAllText: { fontSize: normalise(13), color: '#E8453C', fontWeight: '700' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: normalise(14),
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: normalise(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardUnread: {
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 3,
    borderLeftColor: '#E8453C',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalise(4),
  },
  cardTitle: {
    fontSize: normalise(13),
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  cardTitleUnread: { fontWeight: '800', color: '#1F2937' },
  cardTime: { fontSize: normalise(11), color: '#C4C4C4', flexShrink: 0 },
  cardBody: {
    fontSize: normalise(12),
    color: '#6B7280',
    lineHeight: normalise(17),
  },
  fromRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: normalise(5),
  },
  fromText: { fontSize: normalise(11), color: '#9CA3AF' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: normalise(4),
    flexShrink: 0,
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
});
