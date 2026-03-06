/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView, // ✅ from react-native not gesture-handler
} from 'react-native';
import { useDispatch } from 'react-redux';
import MyStatusBar from '../../Utils/StatusBar';
import GoogleLoginButton from '../../Utils/GoogleLoginButton';
import { getSignIn } from '../../redux/action/AuthAction';
import { Images } from '../../Themes/Themes';
import normalise from '../../Utils/Dimen';

const { width, height } = Dimensions.get('window');

export default function Login(props) {
  const dispatch = useDispatch();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const line1Anim = useRef(new Animated.Value(0)).current;
  const line2Anim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(100)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(120, [
        Animated.timing(line1Anim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(line2Anim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlide, {
          toValue: 0,
          tension: 50,
          friction: 12,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const saveLoginResp = data => {
    if (data) dispatch(getSignIn(data?._user));
  };

  return (
    // ✅ Root is just a plain View with red bg — no flex issues
    <View style={styles.root}>
      <MyStatusBar barStyle="light-content" backgroundColor="#E8453C" />

      {/* ── Full Red Header ───────────────────────────── */}
      <Animated.View style={[styles.redHeader, { opacity: headerAnim }]}>
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />
        <View style={styles.circleMid} />

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: logoAnim, transform: [{ scale: logoScale }] },
          ]}
        >
          <View style={styles.logoCircle}>
            <Image
              source={Images.logo}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>
        </Animated.View>

        {/* Brand */}
        <Animated.Text style={[styles.brandName, { opacity: line1Anim }]}>
          StarTrack
        </Animated.Text>
        <Animated.Text style={[styles.brandSub, { opacity: line2Anim }]}>
          AUTOMATION
        </Animated.Text>
      </Animated.View>

      {/* ── White Bottom Card (Scrollable) ───────────── */}
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <Animated.View
          style={[
            styles.card,
            { opacity: cardAnim, transform: [{ translateY: cardSlide }] },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.handle} />

          <Text style={styles.cardTitle}>Welcome Back! 👋</Text>
          <Text style={styles.cardSubtitle}>
            Sign in with your company Google account to manage and track your
            expenses seamlessly.
          </Text>

          {/* Feature Icons */}
          <View style={styles.featuresRow}>
            {[
              { icon: '🧾', label: 'Submit Expenses' },
              { icon: '✅', label: 'Get Approvals' },
              { icon: '📊', label: 'View Reports' },
            ].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={styles.featureIconWrap}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Google Button */}
          <Animated.View style={[styles.btnWrap, { opacity: btnAnim }]}>
            <GoogleLoginButton onSuccess={data => saveLoginResp(data)} />
          </Animated.View>

          <Text style={styles.disclaimer}>
            By signing in you agree to our{' '}
            <Text style={styles.disclaimerLink}>Terms & Privacy Policy</Text>
          </Text>

          <Text style={styles.companyText}>
            StarTrack Automation India Private Limited
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ✅ root is full screen red bg — no flex:1 issues with ScrollView
  root: {
    flex: 1,
    backgroundColor: '#E8453C',
  },

  // Red Header — fixed height based on screen
  redHeader: {
    height: height * 0.42, // ✅ fixed height — 42% of screen
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  circleTopRight: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    bottom: 0,
    left: -width * 0.15,
  },
  circleMid: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: normalise(40),
    left: normalise(20),
  },

  // Logo
  logoWrap: { marginBottom: normalise(16) },
  logoCircle: {
    width: normalise(110),
    height: normalise(110),
    borderRadius: normalise(55),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  logo: { width: normalise(75), height: normalise(75) },

  // Brand
  brandName: {
    fontSize: normalise(34),
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: normalise(13),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 5,
    marginTop: -2,
  },

  // ScrollView
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // White Card
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: normalise(24),
    paddingTop: normalise(8),
    paddingBottom: normalise(40),
    minHeight: height * 0.6, // ✅ ensures card fills rest of screen
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    marginTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: normalise(20),
    marginTop: normalise(8),
  },
  cardTitle: {
    fontSize: normalise(24),
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: normalise(8),
  },
  cardSubtitle: {
    fontSize: normalise(13),
    color: '#9CA3AF',
    lineHeight: normalise(20),
    marginBottom: normalise(20),
  },

  // Features
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalise(20),
  },
  featureItem: { alignItems: 'center', flex: 1 },
  featureIconWrap: {
    width: normalise(48),
    height: normalise(48),
    borderRadius: normalise(14),
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalise(6),
  },
  featureIcon: { fontSize: normalise(22) },
  featureLabel: {
    fontSize: normalise(10),
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: normalise(20),
  },

  btnWrap: { alignItems: 'center', marginBottom: normalise(14) },

  disclaimer: {
    fontSize: normalise(11),
    color: '#C4C4C4',
    textAlign: 'center',
    lineHeight: normalise(16),
    marginBottom: normalise(12),
  },
  disclaimerLink: { color: '#E8453C', fontWeight: '600' },
  companyText: {
    textAlign: 'center',
    fontSize: normalise(10),
    color: '#D1D5DB',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
