import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../hooks/hooks';
import { initializeAuth } from './reduxStore/reduxSlices/authSlice';
import { getBankStatus } from './utils/storage';

const { width } = Dimensions.get('window');

const Index = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const isAuthenticated = !!auth?.isAuthenticated;
  const isInitialized = !!auth?.isInitialized;
  const loading = !!auth?.loading;

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    const redirectUser = async () => {
      if (!isInitialized) return;

      // If logged in -> check bank status
      if (isAuthenticated) {
        try {
          console.log('🔐 User logged in, checking bank status...');
          const bankStatus = await getBankStatus();
          if (bankStatus === 'completed') {
            console.log('🏡 Bank updated → Opening HostelDetails');
            router.replace('/HostelDetails');
          } else {
            console.log('🏠 Bank pending → Opening HostelOwnerHome');
            router.replace('/tabs/HostelOwnerHome');
          }
          return;
        } catch (e) {
          console.warn('Error reading bank status on index redirect', e);
          router.replace('/tabs/HostelOwnerHome');
          return;
        }
      }

      // Not authenticated -> show welcome screen
      console.log('👤 No user logged in → Show welcome screen');
      setTimeout(() => {
        Animated.sequence([
          Animated.parallel([
            Animated.spring(logoScale, {
              toValue: 1,
              friction: 4,
              useNativeDriver: true,
            }),
            Animated.timing(logoTranslateY, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]).start();
        setShowContent(true);
      }, 300);
    };

    redirectUser();
  }, [isInitialized, isAuthenticated, router]);

  const handleGetStarted = () => router.push('/OwnerRegister');
  const handleLogin = () => router.push('/HostelOwnerLogin');

  if (!isInitialized || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CBB17" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CBB17" />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showContent && (
        <>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
              },
            ]}
          >
            <Image
              source={require('../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>

          <Text style={styles.title}>Fyndom Owner</Text>

          <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
            Powering your hostel management experience
          </Animated.Text>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get Started →</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} style={styles.loginLink} activeOpacity={0.7}>
            <Text style={styles.loginText}>Already verified? Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  logoContainer: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: -30,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#121212',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#555555',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
  },
  getStartedButton: {
    backgroundColor: '#4CBB17',
    paddingVertical: 20,
    paddingHorizontal: 55,
    borderRadius: 40,
    shadowColor: '#4CBB17',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: 2,
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 25,
    padding: 10,
  },
  loginText: {
    color: '#079802',
    fontSize: 18,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});

export default Index;