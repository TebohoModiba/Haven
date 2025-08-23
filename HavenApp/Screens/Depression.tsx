import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Image,
  Switch,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';

type RootStackParamList = {
  Home: undefined;
  Journaling: { prompt?: string };
  Mood: { mood: string };
  ChatHaven: undefined;
  Meditation: undefined;
  Insights: undefined;
  ChatWithHaven: undefined;
  Profile: undefined;
};

type DepressionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Depression'>;

const poeticLines = [
  "Even shadows have a shape.",
  "The weight you carry is real—and it can be shared.",
  "Light doesn't erase darkness—it sits beside it.",
];

const DepressionScreen: React.FC = () => {
  const navigation = useNavigation<DepressionScreenNavigationProp>();
  const [ambientOn, setAmbientOn] = useState(false);
  const [poeticQuote, setPoeticQuote] = useState(poeticLines[0]);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const randomLine = poeticLines[Math.floor(Math.random() * poeticLines.length)];
    setPoeticQuote(randomLine);
  }, []);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.warn('Error setting up audio mode:', error);
      }
    };

    setupAudio();
  }, []);

  useEffect(() => {
    const toggleSound = async () => {
      try {
        if (ambientOn) {
          if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }

          const { sound } = await Audio.Sound.createAsync(
            require('../asserts/ambient.mp3'),
            {
              shouldPlay: true,
              isLooping: true,
              volume: 0.5,
            }
          );

          soundRef.current = sound;
          setIsAudioLoaded(true);
        } else {
          if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
          setIsAudioLoaded(false);
        }
      } catch (err) {
        console.warn('Error managing ambient sound:', err);
        setIsAudioLoaded(false);
      }
    };

    toggleSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(console.warn);
        soundRef.current = null;
      }
    };
  }, [ambientOn]);

  const pulseButton = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient colors={['#2e004f', '#000']} style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollArea}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <Text style={styles.headerTitle}>🕯️ Understanding Depression</Text>
            <Text style={styles.headerSubtitle}>
              Emotional clarity begins with gentle awareness
            </Text>
          </View>

          <Text style={styles.poeticLine}>{poeticQuote}</Text>

          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>What is Depression?</Text>
            <Text style={styles.sectionText}>
              Depression isn't weakness—it's a condition where emotions feel heavy, motivation fades, and connection dims. Sleep, energy, and self-worth may all be affected.
              {"\n\n"}Haven sees you—and honors your journey with warmth and guidance.
            </Text>
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => {
                pulseButton();
                navigation.navigate('DepressionTest');
              }}
            >
              <Text style={styles.buttonText}>Depression Test</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.infoBox}>
            <Text style={styles.sectionTitle}>Need Immediate Help?</Text>
            <Text style={styles.sectionText}>
              South Africa Emergency Line: 📞 0800 456 789{"\n"}
              Suicide Crisis Helpline: 📞 0800 12 13 14{"\n"}
              Lifeline National Support: 🌐 0861 322 322
            </Text>
            <Text style={styles.sectionText}>
              If you're overwhelmed, know that reaching out is a brave and healing act.
            </Text>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Ambient Sound</Text>
            <Switch
              value={ambientOn}
              onValueChange={setAmbientOn}
              thumbColor={ambientOn ? '#a74eff' : '#ccc'}
              trackColor={{ false: '#777', true: '#d8b4ff' }}
            />
            {ambientOn && !isAudioLoaded && (
              <Text style={styles.loadingText}>Loading...</Text>
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => {
                pulseButton();
                navigation.navigate('ChatHaven');
              }}
            >
              <Text style={styles.buttonText}>Talk with Haven 💬</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => navigation.navigate('Meditation')}
          >
            <Text style={styles.buttonText}>Try Guided Meditation 🧘🏾</Text>
          </TouchableOpacity>

          <View style={styles.bottomNav}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Image source={require('../asserts/homeIcon.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Insights')}>
              <Image source={require('../asserts/Insights.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ChatWithHaven')}>
              <Image source={require('../asserts/chat.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image source={require('../asserts/profile.png')} style={styles.navIcon} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1 },
  scrollArea: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerBox: {
    backgroundColor: '#2e004f',
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#ccc',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  poeticLine: {
    fontSize: 15,
    color: '#E5C7FF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#2e004f',
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#a74eff60',
  },
  sectionTitle: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 21,
  },
  supportButton: {
    backgroundColor: '#a74eff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#a74eff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomNav: {
    backgroundColor: '#2e004f',
    paddingVertical: 16,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 30,
    marginTop: 16,
  },
  navIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 14,
    color: '#eee',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 12,
    color: '#a74eff',
    fontStyle: 'italic',
  },
});

export default DepressionScreen;