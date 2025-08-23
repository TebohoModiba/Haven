import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LifestyleScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedLifestyle, setSelectedLifestyle] = useState<string | null>(null);

  const lifestyleOptions = [
    { label: 'Calm & quiet 🌙', value: 'calm' },
    { label: 'Busy & productive 💼', value: 'busy' },
    { label: 'Emotionally overwhelmed 💧', value: 'overwhelmed' },
    { label: 'Seeking balance 🌸', value: 'balance' },
    { label: 'Social & active 💃', value: 'social' },
  ];

  useEffect(() => {
    loadSavedLifestyle();
  }, []);

  const loadSavedLifestyle = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        if (parsedProfile.lifestyle) {
          setSelectedLifestyle(parsedProfile.lifestyle);
        }
      }
    } catch (error) {
      console.error('Error loading saved lifestyle:', error);
    }
  };

  const saveLifestyle = async (lifestyle: string) => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      const existingProfile = profile ? JSON.parse(profile) : {};
      
      const updatedProfile = {
        ...existingProfile,
        lifestyle: lifestyle,
        lifestyleUpdated: new Date().toISOString(),
        profileCompleted: new Date().toISOString()
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setSelectedLifestyle(lifestyle);
      
      // Log the complete profile for debugging
      console.log('Complete user profile saved:', updatedProfile);
    } catch (error) {
      console.error('Error saving lifestyle:', error);
      Alert.alert('Error', 'Failed to save your selection. Please try again.');
    }
  };

  const handleNext = () => {
    if (!selectedLifestyle) {
      Alert.alert('Please select your lifestyle', 'This helps Haven recommend the right support for you');
      return;
    }
    navigation.navigate('SignUp');
  };

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Which lifestyle best describes you right now? 🧘🏾‍♀️</Text>
          <Text style={styles.subtitle}>
            This helps Haven recommend support that meets you where you are.
          </Text>

          {lifestyleOptions.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.optionRow,
                selectedLifestyle === value && styles.optionSelected,
              ]}
              onPress={() => saveLifestyle(value)}
            >
              <Text style={styles.checkboxEmoji}>
                {selectedLifestyle === value ? '✅' : '⬜'}
              </Text>
              <Text style={styles.optionText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Arrows */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('AgeRange')}
          >
            <Text style={styles.arrowText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNext}
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
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  container: {
    alignItems: 'center',
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(160, 90, 255, 0.25)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 14,
    width: '85%',
  },
  optionSelected: {
    backgroundColor: 'rgba(160, 90, 255, 0.45)',
  },
  optionText: {
    fontSize: 17,
    color: '#fff',
    marginLeft: 12,
  },
  checkboxEmoji: {
    fontSize: 18,
  },
  navigation: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
  },
  navButton: {
    padding: 10,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#a74eff',
  },
  arrowText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textShadowColor: '#a74eff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});

export default LifestyleScreen;