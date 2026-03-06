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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
// import ImageCropPicker from 'react-native-image-crop-picker';
// import storage from '@react-native-firebase/storage';
import normalise from '../../Utils/Dimen';
import MyStatusBar from '../../Utils/StatusBar';
import { useDispatch } from 'react-redux';
import { getLogout } from '../../redux/action/AuthAction';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const FIELDS = [
  {
    key: 'displayName',
    label: 'Full Name',
    icon: 'account-outline',
    keyboard: 'default',
  },
  {
    key: 'email',
    label: 'Email Address',
    icon: 'email-outline',
    keyboard: 'email-address',
    editable: false,
  },
  {
    key: 'phoneNumber',
    label: 'Phone Number',
    icon: 'phone-outline',
    keyboard: 'phone-pad',
  },
];

export default function ProfileScreen(props) {
  const [userData, setUserData] = useState({});
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const headerAnim = useRef(new Animated.Value(-50)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  useEffect(() => {
    fetchProfile();
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

  const fetchProfile = async () => {
    try {
      const uid = auth().currentUser?.uid;
      const doc = await firestore().collection('users').doc(uid).get();
      if (doc.exists) {
        setUserData(doc.data());
        setEditData(doc.data());
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // const handleChangePhoto = async () => {
  //   try {
  //     const image = await ImageCropPicker.openPicker({
  //       width: 400,
  //       height: 400,
  //       cropping: true,
  //       cropperCircleOverlay: true,
  //       compressImageQuality: 0.7,
  //     });

  //     setUploadingPhoto(true);
  //     const uid = auth().currentUser?.uid;
  //     const ref = storage().ref(`profile_photos/${uid}.jpg`);
  //     await ref.putFile(image.path);
  //     const url = await ref.getDownloadURL();

  //     await firestore().collection('users').doc(uid).update({ photoURL: url });
  //     await auth().currentUser.updateProfile({ photoURL: url });

  //     setUserData(prev => ({ ...prev, photoURL: url }));
  //     setEditData(prev => ({ ...prev, photoURL: url }));
  //     Alert.alert('Success', 'Profile photo updated!');
  //   } catch (error) {
  //     if (error.code !== 'E_PICKER_CANCELLED') {
  //       Alert.alert('Error', 'Failed to update photo');
  //       console.log('Photo error:', error);
  //     }
  //   } finally {
  //     setUploadingPhoto(false);
  //   }
  // };

  const handleSave = async () => {
    try {
      setSaving(true);
      const uid = auth().currentUser?.uid;

      await firestore()
        .collection('users')
        .doc(uid)
        .update({
          displayName: editData.displayName || '',
          phoneNumber: editData.phoneNumber || '',
        });

      await auth().currentUser.updateProfile({
        displayName: editData.displayName || '',
      });

      setUserData(prev => ({ ...prev, ...editData }));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.log('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ Step 1 — Revoke Google access (forces account picker next time)
              await GoogleSignin.revokeAccess();

              // ✅ Step 2 — Sign out from Google
              await GoogleSignin.signOut();

              // ✅ Step 3 — Sign out from Firebase
              await auth().signOut();

              // ✅ Step 4 — Clear Redux state
              dispatch(getLogout());
            } catch (error) {
              console.log('Logout error:', error);
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  // const handleLogout = () => {
  //   Alert.alert(
  //     'Logout',
  //     'Are you sure you want to logout?',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Logout',
  //         style: 'destructive',
  //         onPress: () => dispatch(getLogout()),
  //       },
  //     ],
  //     { cancelable: false },
  //   );
  // };

  const formatDate = dateStr => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E8453C" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MyStatusBar barStyle="light-content" backgroundColor={'#E8453C'} />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: headerAnim }],
            opacity: headerOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => props.navigation.goBack()}
        >
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            if (isEditing) {
              setEditData(userData);
              setIsEditing(false);
            } else {
              setIsEditing(true);
            }
          }}
        >
          <Icon
            name={isEditing ? 'close' : 'pencil-outline'}
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {uploadingPhoto ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator color="#E8453C" size="large" />
              </View>
            ) : userData.photoURL ? (
              <Image
                source={{ uri: userData.photoURL }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {userData.displayName?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}

            {/* Camera Button */}
            <TouchableOpacity
              style={styles.cameraBtn}
              // onPress={handleChangePhoto}
              disabled={uploadingPhoto}
            >
              <Icon name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>
            {userData.displayName || 'User'}
          </Text>
          <Text style={styles.profileEmail}>{userData.email || ''}</Text>

          {/* Member Since Badge */}
          <View style={styles.memberBadge}>
            <Icon name="shield-check-outline" size={13} color="#E8453C" />
            <Text style={styles.memberText}>
              Member since {formatDate(userData.createdAt)}
            </Text>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account Details</Text>

          {FIELDS.map((field, index) => (
            <View key={field.key} style={styles.fieldCard}>
              <View style={styles.fieldIcon}>
                <Icon name={field.icon} size={20} color="#E8453C" />
              </View>
              <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {isEditing && field.editable !== false ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={editData[field.key] || ''}
                    onChangeText={text =>
                      setEditData(prev => ({ ...prev, [field.key]: text }))
                    }
                    keyboardType={field.keyboard}
                    placeholder={`Enter ${field.label}`}
                    placeholderTextColor="#C4C4C4"
                  />
                ) : (
                  <Text style={styles.fieldValue}>
                    {userData[field.key] || 'Not provided'}
                  </Text>
                )}
              </View>
              {field.editable === false && (
                <Icon name="lock-outline" size={16} color="#D1D5DB" />
              )}
            </View>
          ))}
        </View>

        {/* Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <Icon name="login" size={20} color="#34D399" />
              <View style={styles.activityText}>
                <Text style={styles.activityLabel}>Last Login</Text>
                <Text style={styles.activityValue}>
                  {formatDate(userData.lastLogin)}
                </Text>
              </View>
            </View>
            <View style={styles.activityDivider} />
            <View style={styles.activityItem}>
              <Icon name="calendar-plus" size={20} color="#38BDF8" />
              <View style={styles.activityText}>
                <Text style={styles.activityLabel}>Account Created</Text>
                <Text style={styles.activityValue}>
                  {formatDate(userData.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="content-save-outline" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#E8453C" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: normalise(24) }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
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

  scrollContent: {
    paddingHorizontal: normalise(16),
    paddingBottom: normalise(16),
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: normalise(24),
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: normalise(12),
  },
  avatar: {
    width: normalise(100),
    height: normalise(100),
    borderRadius: normalise(50),
    borderWidth: 3,
    borderColor: '#E8453C',
  },
  avatarPlaceholder: {
    width: normalise(100),
    height: normalise(100),
    borderRadius: normalise(50),
    backgroundColor: '#FFF0F0',
    borderWidth: 3,
    borderColor: '#E8453C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: normalise(38),
    fontWeight: '800',
    color: '#E8453C',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8453C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
  },
  profileName: {
    fontSize: normalise(22),
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  profileEmail: {
    fontSize: normalise(13),
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: normalise(12),
    paddingVertical: normalise(5),
    borderRadius: 20,
    marginTop: normalise(10),
  },
  memberText: {
    fontSize: normalise(11),
    color: '#E8453C',
    fontWeight: '600',
  },

  // Section
  section: {
    marginBottom: normalise(16),
  },
  sectionLabel: {
    fontSize: normalise(12),
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: normalise(10),
    marginLeft: normalise(4),
  },

  // Field Card
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: normalise(14),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalise(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  fieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: normalise(12),
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: normalise(10),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: normalise(14),
    color: '#1F2937',
    fontWeight: '600',
  },
  fieldInput: {
    fontSize: normalise(14),
    color: '#1F2937',
    fontWeight: '600',
    padding: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E8453C',
    paddingBottom: 2,
  },

  // Activity Card
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: normalise(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: normalise(6),
  },
  activityText: {
    flex: 1,
  },
  activityLabel: {
    fontSize: normalise(11),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  activityValue: {
    fontSize: normalise(14),
    color: '#1F2937',
    fontWeight: '600',
    marginTop: 2,
  },
  activityDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: normalise(6),
  },

  // Save Button
  saveBtn: {
    backgroundColor: '#E8453C',
    borderRadius: 14,
    paddingVertical: normalise(15),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: normalise(12),
    elevation: 4,
    shadowColor: '#E8453C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: normalise(15),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Logout Button
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: normalise(15),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    elevation: 1,
  },
  logoutText: {
    color: '#E8453C',
    fontSize: normalise(15),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
