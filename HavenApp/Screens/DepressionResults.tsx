import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  DepressionTest: undefined;
  DepressionResults: {
    score: number;
    answers: number[];
    timestamp: string;
  };
  DepressionHistory: undefined;
  ChatHaven: undefined;
  Meditation: undefined;
};

type DepressionResultsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DepressionResults'>;
type DepressionResultsRouteProp = RouteProp<RootStackParamList, 'DepressionResults'>;

export interface DepressionTestResult {
  id: string;
  score: number;
  answers: number[];
  timestamp: string;
  depressionType: string;
}

function getDepressionType(score: number): string {
  if (score <= 4) return 'Minimal or no depression';
  if (score <= 9) return 'Mild depression';
  if (score <= 14) return 'Moderate depression';
  if (score <= 19) return 'Moderately severe depression';
  return 'Severe depression';
}

function getRecommendation(score: number): string {
  if (score <= 4) return 'You seem to be doing well! Continue your self-care practices and stay connected with supportive people.';
  if (score <= 9) return 'Consider talking to Haven or a mental health professional. Small steps toward support can make a big difference.';
  if (score <= 14) return 'It would be beneficial to speak with a mental health professional. You deserve support and care.';
  if (score <= 19) return 'Please consider reaching out to a mental health professional soon. Your wellbeing matters.';
  return 'We strongly encourage you to seek professional help immediately. If you\'re having thoughts of self-harm, please contact emergency services or a crisis helpline.';
}

function getScoreColor(score: number): string {
  if (score <= 4) return '#4CAF50'; // Green
  if (score <= 9) return '#FFC107'; // Amber
  if (score <= 14) return '#FF9800'; // Orange
  if (score <= 19) return '#FF5722'; // Deep Orange
  return '#F44336'; // Red
}

function getEncouragingMessage(score: number): string {
  if (score <= 4) return '✨ You\'re showing great resilience!';
  if (score <= 9) return '💜 Every step toward healing matters.';
  if (score <= 14) return '🌟 Your courage to seek understanding is admirable.';
  if (score <= 19) return '💙 You are not alone in this journey.';
  return '❤️ Your life has value and meaning.';
}

const DepressionResults: React.FC = () => {
  const navigation = useNavigation<DepressionResultsNavigationProp>();
  const route = useRoute<DepressionResultsRouteProp>();
  const { score, answers, timestamp } = route.params;

  const [isSaving, setIsSaving] = useState(false);

  const depressionType = getDepressionType(score);
  const recommendation = getRecommendation(score);
  const scoreColor = getScoreColor(score);
  const encouragingMessage = getEncouragingMessage(score);

  useEffect(() => {
    saveResult();
  }, []);

  const saveResult = async () => {
    try {
      setIsSaving(true);
      
      const result: DepressionTestResult = {
        id: `depression_${Date.now()}`,
        score,
        answers,
        timestamp,
        depressionType,
      };

      // Get existing results
      const existingResultsJson = await AsyncStorage.getItem('depressionTestHistory');
      const existingResults: DepressionTestResult[] = existingResultsJson 
        ? JSON.parse(existingResultsJson) 
        : [];

      // Add new result to the beginning of the array
      const updatedResults = [result, ...existingResults];

      // Keep only the last 50 results to prevent storage bloat
      const limitedResults = updatedResults.slice(0, 50);

      // Save to AsyncStorage
      await AsyncStorage.setItem('depressionTestHistory', JSON.stringify(limitedResults));
      
      console.log('Depression test result saved successfully');
    } catch (error) {
      console.error('Error saving depression test result:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetakeTest = () => {
    Alert.alert(
      'Retake Assessment',
      'Are you sure you want to take the assessment again?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Retake', 
          onPress: () => navigation.navigate('DepressionTest'),
          style: 'default'
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            onPress={() => navigation.navigate('DepressionTest')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <Text style={styles.headerTitle}>📊 Your Assessment Results</Text>
            <Text style={styles.headerSubtitle}>
              Completed on {formatDate(timestamp)}
            </Text>
          </View>

          <Text style={styles.encouragingMessage}>{encouragingMessage}</Text>

          <View style={[styles.scoreBox, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>
              Score: {score}/27
            </Text>
            <Text style={styles.resultType}>{depressionType}</Text>
            
            {/* Progress bar visualization */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(score / 27) * 100}%`,
                      backgroundColor: scoreColor
                    }
                  ]} 
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>0</Text>
                <Text style={styles.progressLabel}>Minimal</Text>
                <Text style={styles.progressLabel}>Mild</Text>
                <Text style={styles.progressLabel}>Moderate</Text>
                <Text style={styles.progressLabel}>Severe</Text>
                <Text style={styles.progressLabel}>27</Text>
              </View>
            </View>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>💜 Personalized Guidance</Text>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>

          {score > 14 && (
            <View style={styles.emergencyBox}>
              <Text style={styles.emergencyTitle}>🚨 Immediate Support Available</Text>
              <Text style={styles.emergencyText}>
                South Africa Emergency: 📞 0800 456 789{"\n"}
                Suicide Crisis Helpline: 📞 0800 12 13 14{"\n"}
                Lifeline Support: 🌐 0861 322 322{"\n\n"}
                Remember: Seeking help is a sign of strength, not weakness.
              </Text>
            </View>
          )}

          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>🌟 Next Steps</Text>
            
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('ChatHaven')}
            >
              <Text style={styles.buttonText}>Talk with Haven 💬</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Meditation')}
            >
              <Text style={styles.secondaryButtonText}>Try Guided Meditation 🧘🏾</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('DepressionHistory')}
            >
              <Text style={styles.secondaryButtonText}>View Test History 📈</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetakeTest}
            >
              <Text style={styles.retakeButtonText}>Retake Assessment</Text>
            </TouchableOpacity>
          </View>

          {isSaving && (
            <View style={styles.savingIndicator}>
              <Text style={styles.savingText}>Saving result... ✨</Text>
            </View>
          )}
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
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 8,
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
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 22,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  encouragingMessage: {
    fontSize: 16,
    color: '#E5C7FF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  scoreBox: {
    backgroundColor: '#2e004f',
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultType: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    marginTop: 10,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 10,
    color: '#888',
  },
  recommendationBox: {
    backgroundColor: '#2e004f',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#a74eff60',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 22,
  },
  emergencyBox: {
    backgroundColor: '#8B0000',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  emergencyText: {
    fontSize: 14,
    color: '#FFE4E4',
    lineHeight: 22,
  },
  actionSection: {
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#a74eff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 12,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#a74eff',
    marginBottom: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#a74eff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomActions: {
    alignItems: 'center',
    marginTop: 20,
  },
  retakeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#666',
  },
  retakeButtonText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  savingIndicator: {
    backgroundColor: 'rgba(167, 78, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  savingText: {
    color: '#a74eff',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default DepressionResults;