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

const ChooseGender: React.FC = () => {
  const navigation = useNavigation();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const genderOptions = [
    { label: 'Female 👩', value: 'female' },
    { label: 'Male 👨', value: 'male' },
    { label: 'Other 🧑', value: 'other' },
    { label: 'Prefer not to say 🙈', value: 'unspecified' },
  ];

  useEffect(() => {
    loadSavedGender();
  }, []);

  const loadSavedGender = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        const parsedProfile = JSON.parse(profile);
        if (parsedProfile.gender) {
          setSelectedGender(parsedProfile.gender);
        }
      }
    } catch (error) {
      console.error('Error loading saved gender:', error);
    }
  };

  const saveGender = async (gender: string) => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      const existingProfile = profile ? JSON.parse(profile) : {};
      
      const updatedProfile = {
        ...existingProfile,
        gender: gender,
        genderUpdated: new Date().toISOString()
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setSelectedGender(gender);
    } catch (error) {
      console.error('Error saving gender:', error);
      Alert.alert('Error', 'Failed to save your selection. Please try again.');
    }
  };

  const handleNext = () => {
    if (!selectedGender) {
      Alert.alert('Please make a selection', 'How you identify helps Haven provide better support');
      return;
    }
    navigation.navigate('AgeRange');
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
          <Text style={styles.title}>How do you identify? 🌸</Text>
          <Text style={styles.subtitle}>Tap the option that feels most true to you:</Text>

          {genderOptions.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.optionRow,
                selectedGender === value && styles.optionSelected,
              ]}
              onPress={() => saveGender(value)}
              activeOpacity={0.8}
            >
              <Text style={styles.checkboxEmoji}>
                {selectedGender === value ? '✅' : '⬜'}
              </Text>
              <Text style={styles.optionText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation Arrows */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Intro')}
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
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(160, 90, 255, 0.25)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
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
    backgroundColor: 'rgba(167, 78, 255, 0.15)',
    shadowColor: '#a74eff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  arrowText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textShadowColor: '#a74eff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});

export default ChooseGender;