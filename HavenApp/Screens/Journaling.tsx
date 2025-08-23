import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from "expo-av";

// Define navigation stack types
type RootStackParamList = {
  Home: undefined;
  Journaling: { prompt?: string };
  Mood: { mood: string };
  History: undefined; // ✅ Added History screen
};

type JournalingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Journaling'>;

const poeticQuotes = [
  "“This is your safe space to feel and release.”",
  "“Write like no one's reading, but your heart is listening.”",
  "“Let the silence between words hold your truth.”",
  "“Gentleness lives in your thoughts, let them speak.”",
];

const JournalingScreen: React.FC = () => {
  const navigation = useNavigation<JournalingScreenNavigationProp>();
  const [journalText, setJournalText] = useState('');
  const [currentQuote, setCurrentQuote] = useState(poeticQuotes[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const glowAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    const pick = poeticQuotes[Math.floor(Math.random() * poeticQuotes.length)];
    setCurrentQuote(pick);
    await loadDraft();
    setIsLoading(false);
  };

  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem('journalDraft');
      if (draft) {
        const draftData = JSON.parse(draft);
        setJournalText(draftData.text || '');
        setLastSaved(draftData.lastSaved || null);
      }
    } catch (error) {
      console.error('Error loading journal draft:', error);
    }
  };

  const saveDraft = async (text: string) => {
    try {
      const draftData = {
        text: text,
        lastSaved: new Date().toISOString(),
      };
      await AsyncStorage.setItem('journalDraft', JSON.stringify(draftData));
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const saveJournalEntry = async () => {
    if (!journalText.trim()) {
      Alert.alert('Empty Journal', 'Please write something before saving.');
      return;
    }

    try {
      const existingEntries = await AsyncStorage.getItem('journalEntries');
      const entries = existingEntries ? JSON.parse(existingEntries) : [];

      const newEntry = {
        id: Date.now().toString(),
        text: journalText.trim(),
        date: new Date().toISOString(),
        wordCount: journalText.trim().split(/\s+/).length,
      };

      entries.unshift(newEntry);

      await AsyncStorage.setItem('journalEntries', JSON.stringify(entries));
      await AsyncStorage.removeItem('journalDraft');

      setLastSaved(new Date().toISOString());

      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert(
        'Journal Saved! 🌸',
        'Your thoughts have been safely stored. You can continue writing or start fresh.',
        [
          { text: 'Continue Writing', style: 'default' },
          { text: 'Start Fresh', onPress: () => setJournalText(''), style: 'default' },
        ]
      );

    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    }
  };

  const handleTextChange = (text: string) => {
    setJournalText(text);
    if (text.length > 0) {
      const timeoutId = setTimeout(() => {
        saveDraft(text);
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  };

  const getWordCount = () => {
    if (!journalText.trim()) return 0;
    return journalText.trim().split(/\s+/).length;
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const date = new Date(lastSaved);
    return `Draft saved ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (isLoading) {
    return (
      <ImageBackground
        source={require('../asserts/background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient colors={['#8000a0', '#2e004f']} style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your journal... 🌸</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient colors={['#8000a0', '#2e004f']} style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollArea}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <Text style={styles.headerTitle}>🌿 Journal Your Way to Calm</Text>
            <Text style={styles.headerSubtitle}>
              Every word is a window. Breathe deep and begin.
            </Text>
          </View>

          <Text style={styles.poeticLine}>{currentQuote}</Text>

          <View style={styles.journalWrapper}>
            <View style={styles.journalCard}>
              <TextInput
                placeholder="Start writing here..."
                placeholderTextColor="#666"
                style={styles.journalInput}
                multiline
                scrollEnabled
                value={journalText}
                onChangeText={handleTextChange}
              />

              <View style={styles.journalStats}>
                <Text style={styles.wordCount}>
                  {getWordCount()} words
                </Text>
                {lastSaved && (
                  <Text style={styles.draftStatus}>
                    {formatLastSaved()}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: glowAnim }] }}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !journalText.trim() && styles.saveButtonDisabled
              ]}
              onPress={saveJournalEntry}
              disabled={!journalText.trim()}
            >
              <Text style={styles.saveButtonText}>💾 SAVE JOURNAL</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setJournalText('')}
            >
              <Text style={styles.quickActionText}>🗑️ Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('History')} // ✅ Updated
            >
              <Text style={styles.quickActionText}>📖 History</Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 140,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontStyle: 'italic',
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
    backgroundColor: '#24003d',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#bbb',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  poeticLine: {
    fontSize: 16,
    color: '#E5C7FF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  journalWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  journalCard: {
    width: '92%',
    minHeight: 320,
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#f1d9ff',
    shadowColor: '#a74eff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  journalInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlignVertical: 'top',
    flex: 1,
    minHeight: 250,
  },
  journalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0c4ff',
  },
  wordCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  draftStatus: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#a74eff',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#5e009e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#666',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  quickActionButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default JournalingScreen;