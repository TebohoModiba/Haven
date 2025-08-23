import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IntroScreen: React.FC = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');

  const isNameValid = !!name.trim();

  const saveName = async () => {
    if (!isNameValid) {
      Alert.alert('Please enter your name', 'Your name helps Haven personalize your experience');
      return;
    }

    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify({
        name: name.trim(),
        timestamp: new Date().toISOString()
      }));
      
      Alert.alert(
        'Welcome! 🌸', 
        `Nice to meet you, ${name.trim()}! Your name has been saved successfully.`,
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('ChooseGender'),
            style: 'default'
          }
        ]
      );
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Error', 'Failed to save your name. Please try again.');
    }
  };

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <Text style={styles.greeting}>Hi there ☀️</Text>
          <Text style={styles.message}>
            I'm Haven, your gentle AI companion through life's ups and downs.
          </Text>
          <Text style={styles.message}>
            Before we begin, may I know your name? 😊
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Type your name here"
            placeholderTextColor="#ccc"
            value={name}
            onChangeText={setName}
            onSubmitEditing={saveName}
            returnKeyType="done"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            !isNameValid && { opacity: 0.5 }
          ]}
          onPress={saveName}
          disabled={!isNameValid}
        >
          <Text style={styles.saveText}>Save✨🌸</Text>
        </TouchableOpacity>

        {/* Navigation Arrows */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('About')}
          >
            <Text style={styles.navArrow}>←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              !isNameValid && { opacity: 0.5 }
            ]}
            onPress={() => {
              if (isNameValid) {
                saveName();
              } else {
                Alert.alert('Please enter your name', 'Your name helps Haven personalize your experience');
              }
            }}
            disabled={!isNameValid}
          >
            <Text style={styles.navArrow}>→</Text>
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
    paddingBottom: 120,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  input: {
    marginTop: 28,
    width: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#a74eff',
  },
  saveButton: {
    backgroundColor: '#3b0661ff',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    alignSelf: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
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
  navArrow: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textShadowColor: '#a74eff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});

export default IntroScreen;