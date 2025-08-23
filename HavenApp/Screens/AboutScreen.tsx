import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const AboutScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Welcome Title */}
          <View style={styles.container}>
            <Text style={styles.heading}>Haven,</Text>
            <Text style={styles.tagline}>A safe space in your pocket. 🌙</Text>
          </View>

          {/* Description */}
          <View style={styles.container}>
            <Text style={styles.description}>
              Haven AI is your mental health companion—here to guide you through
              the highs and lows with empathy and care. 🐥
            </Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.featureBlock}>
            <Text style={styles.feature}>📒 Log your emotions daily</Text>
          </View>
          <View style={styles.featureBlock}>
            <Text style={styles.feature}>🎥 Explore mood-based videos</Text>
          </View>
          <View style={styles.featureBlock}>
            <Text style={styles.feature}>📓 Journal your thoughts</Text>
          </View>
          <View style={styles.featureBlock}>
            <Text style={styles.feature}>💬 Chat when you need a friend</Text>
          </View>

          {/* Final Encouragement */}
          <View style={styles.container}>
            <Text style={styles.softText}>You're not alone.</Text>
          </View>
        </ScrollView>

        {/* Dual Navigation Arrows */}
        <View style={styles.navigationRow}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.arrowText}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Intro')}
          >
            <Text style={styles.arrowText}>→</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1 },
  scroll: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  featureBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    width: '75%',
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#fff',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
  feature: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
  },
  softText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#fff',
    textAlign: 'center',
  },
  navigationRow: {
    position: 'absolute',
    bottom: 80, // ⬆️ lifted from 40 to sit higher
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  navButton: {
    padding: 10,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#700683ff',
    backgroundColor: 'rgba(167, 78, 255, 0.15)', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  arrowText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: '#4d1188ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default AboutScreen;