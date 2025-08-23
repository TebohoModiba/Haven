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

const AgeRangeScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  const ageOptions = [
    { label: 'Under 18 🐣', value: 'under18' },
    { label: '18 and above 🌱', value: '18plus' },
    { label: '25 and above 🌼', value: '25plus' },
  ];

  useEffect(() => {
    loadSavedAge();
  }, []);

  const loadSavedAge = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        if (parsedProfile.ageRange) {
          setSelectedAge(parsedProfile.ageRange);
        }
      }
    } catch (error) {
      console.error('Error loading saved age range:', error);
    }
  };

  const saveAgeRange = async (ageRange: string) => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      const existingProfile = profile ? JSON.parse(profile) : {};
      
      const updatedProfile = {
        ...existingProfile,
        ageRange: ageRange,
        ageRangeUpdated: new Date().toISOString()
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setSelectedAge(ageRange);
    } catch (error) {
      console.error('Error saving age range:', error);
      Alert.alert('Error', 'Failed to save your selection. Please try again.');
    }
  };

  const handleNext = () => {
    if (!selectedAge) {
      Alert.alert('Please select your age range', 'This helps Haven provide age-appropriate support');
      return;
    }
    navigation.navigate('Lifestyle');
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
          <Text style={styles.title}>Which age range feels right for you? 🌸</Text>
          <Text style={styles.subtitle}>
            This helps Haven gently personalize your support.
          </Text>

          {ageOptions.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.optionRow,
                selectedAge === value && styles.optionSelected,
              ]}
              onPress={() => saveAgeRange(value)}
            >
              <Text style={styles.checkboxEmoji}>
                {selectedAge === value ? '✅' : '⬜'}
              </Text>
              <Text style={styles.optionText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Arrows */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('ChooseGender')}
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
  checkboxEmoji: {
    fontSize: 18,
  },
  optionText: {
    fontSize: 17,
    color: '#fff',
    marginLeft: 12,
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

export default AgeRangeScreen;