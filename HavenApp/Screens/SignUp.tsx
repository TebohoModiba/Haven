import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import UserContext from '../Context/UserContext';

type RootStackParamList = {
  Home: undefined;
  CreateAccount: undefined;
};

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [fadeAnim] = useState(new Animated.Value(0));
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSkipForNow = () => {
    // Set a guest user object to indicate the user is using the app without account
    // Mock a User object for guest usage
    const guestUser = {
      uid: 'guest_user',
      email: 'guest@haven.app',
      displayName: 'Guest User',
      emailVerified: false,
      isAnonymous: true,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      phoneNumber: null,
      photoURL: null,
      isGuest: true,
    } as any;
    
    // Set the user in context - this will automatically trigger the navigation
    // to MainDrawer in your RootNavigator because user becomes truthy
    setUser(guestUser);
    
    // No need to manually navigate - the RootNavigator will handle this
    // based on the user state change
  };

  const handleCreateAccount = () => {
    navigation.navigate('CreateAccount');
  };

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          {/* Glowing Title */}
          <LinearGradient
            colors={['#4a1760', '#6e2a9b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headingGlow}
          >
            <Text style={styles.heading}>✨ Start your journey with Haven ✨</Text>
          </LinearGradient>

          <Text style={styles.subtext}>
            You deserve a space that understands you 💜🌈
          </Text>

          {/* Fade-in Bullet List */}
          <Text style={styles.bullets}>✨ Create your account to:</Text>
          <Animated.Text style={styles.bullets}>📊 Track your emotions</Animated.Text>
          <Animated.Text style={styles.bullets}>🗒️ Journal your thoughts</Animated.Text>
          <Animated.Text style={styles.bullets}>🎥 Watch mood-based videos</Animated.Text>
          <Animated.Text style={styles.bullets}>💬 Connect with a caring companion</Animated.Text>

          <Animated.Text style={styles.footer}>
            Every mood matters. Every day counts 🌻
          </Animated.Text>

          {/* SIGN UP Button with Dark Purple Glow */}
          <TouchableOpacity
            onPress={handleCreateAccount}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#4a1760', '#6e2a9b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signUpButton}
            >
              <Text style={styles.signUpText}>SIGN UP ✨</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip Option - Simple Navigation */}
          <TouchableOpacity onPress={handleSkipForNow} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip for now 🌙</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: 'rgba(45, 20, 80, 0.35)', // 🌌 deeper dark purple panel
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headingGlow: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    letterSpacing: 0.8,
  },
  subtext: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  bullets: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'left',
    width: '100%',
    marginBottom: 6,
    lineHeight: 22,
  },
  footer: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  signUpButton: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
    backgroundColor: 'transparent',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1,
  },
  skipText: {
    marginTop: 16,
    fontSize: 15,
    color: '#ccc',
    textAlign: 'center',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;