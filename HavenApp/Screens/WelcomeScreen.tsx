import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(108, 91, 123, 0.3)', 'rgba(39, 29, 72, 0.6)']}
        style={styles.gradient}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.title}>
            Welcome to <Text style={styles.havenGlow}>Haven 🌿</Text>
          </Text>
          <Text style={styles.subtitle}>
            Your gentle mental health AI companion — always here, always listening.
          </Text>
          

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('About')}
            >
              <Text style={styles.text1}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  havenGlow: {
    color: '#A685FF',
    textShadowColor: 'rgba(166, 133, 255, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#e6e6fa',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  buttonContainer: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#6441A5',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 40,
    shadowColor: '#BBA6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  text1: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 2,
    textShadowColor: 'rgba(100, 65, 165, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default WelcomeScreen;