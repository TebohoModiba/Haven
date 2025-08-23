import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DepressionTestResult } from './DepressionResults';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  DepressionTest: undefined;
  DepressionResults: {
    score: number;
    answers: number[];
    timestamp: string;
  };
  DepressionHistory: undefined;
};

type DepressionHistoryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'DepressionHistory'>;

function getScoreColor(score: number): string {
  if (score <= 4) return '#4CAF50'; // Green
  if (score <= 9) return '#FFC107'; // Amber
  if (score <= 14) return '#FF9800'; // Orange
  if (score <= 19) return '#FF5722'; // Deep Orange
  return '#F44336'; // Red
}

function getScoreEmoji(score: number): string {
  if (score <= 4) return '😊';
  if (score <= 9) return '😐';
  if (score <= 14) return '😟';
  if (score <= 19) return '😞';
  return '😢';
}

function getTrend(current: number, previous: number): string {
  if (current < previous) return '📈'; // Improving (score decreasing)
  if (current > previous) return '📉'; // Worsening (score increasing)
  return '➖'; // No change
}

const DepressionHistory: React.FC = () => {
  const navigation = useNavigation<DepressionHistoryNavigationProp>();
  const [results, setResults] = useState<DepressionTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '30days' | '90days' | '1year'>('all');

  useFocusEffect(
    React.useCallback(() => {
      loadResults();
    }, [])
  );

  const loadResults = async () => {
    try {
      setIsLoading(true);
      const resultsJson = await AsyncStorage.getItem('depressionTestHistory');
      if (resultsJson) {
        const parsedResults: DepressionTestResult[] = JSON.parse(resultsJson);
        setResults(parsedResults);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Error loading depression test history:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (selectedPeriod === 'all') return results;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedPeriod) {
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        filterDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return results.filter(result => new Date(result.timestamp) >= filterDate);
  }, [results, selectedPeriod]);

  const statistics = useMemo(() => {
    if (filteredResults.length === 0) {
      return {
        averageScore: 0,
        lowestScore: 0,
        highestScore: 0,
        trend: 'No data',
        totalTests: 0,
        improvementCount: 0,
      };
    }

    const scores = filteredResults.map(r => r.score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const lowestScore = Math.min(...scores);
    const highestScore = Math.max(...scores);
    
    let improvementCount = 0;
    for (let i = 1; i < filteredResults.length; i++) {
      if (filteredResults[i-1].score > filteredResults[i].score) {
        improvementCount++;
      }
    }

    const trend = filteredResults.length > 1 
      ? getTrend(filteredResults[0].score, filteredResults[1].score)
      : '➖';

    return {
      averageScore,
      lowestScore,
      highestScore,
      trend,
      totalTests: filteredResults.length,
      improvementCount,
    };
  }, [filteredResults]);

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all your depression test history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('depressionTestHistory');
              setResults([]);
              Alert.alert('Success', 'History cleared successfully.');
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPeriodButton = (period: typeof selectedPeriod, label: string) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        selectedPeriod === period && styles.selectedPeriodButton
      ]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text style={[
        styles.periodButtonText,
        selectedPeriod === period && styles.selectedPeriodButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderResultItem = ({ item, index }: { item: DepressionTestResult; index: number }) => {
    const previousResult = index < filteredResults.length - 1 ? filteredResults[index + 1] : null;
    const trend = previousResult ? getTrend(item.score, previousResult.score) : '';

    return (
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(item.score) }]}>
              {item.score}
            </Text>
            <Text style={styles.scoreEmoji}>{getScoreEmoji(item.score)}</Text>
            {trend && <Text style={styles.trendEmoji}>{trend}</Text>}
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultType}>{item.depressionType}</Text>
            <Text style={styles.resultDate}>{formatDate(item.timestamp)}</Text>
          </View>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${(item.score / 27) * 100}%`,
                backgroundColor: getScoreColor(item.score)
              }
            ]}
          />
        </View>
      </View>
    );
  };

  const renderSimpleChart = () => {
    if (filteredResults.length < 2) return null;

    const maxScore = Math.max(...filteredResults.map(r => r.score));
    const chartHeight = 120;
    const chartWidth = width - 80;
    
    const points = filteredResults.slice(0, 10).reverse().map((result, index) => {
      const x = (index / Math.max(filteredResults.slice(0, 10).length - 1, 1)) * chartWidth;
      const y = chartHeight - ((result.score / Math.max(maxScore, 27)) * chartHeight);
      return { x, y, score: result.score };
    });

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>📊 Score Trend (Last 10 Tests)</Text>
        <View style={styles.chart}>
          {points.map((point, index) => (
            <View
              key={index}
              style={[
                styles.chartPoint,
                {
                  left: point.x - 3,
                  top: point.y - 3,
                  backgroundColor: getScoreColor(point.score),
                }
              ]}
            >
              <Text style={styles.chartPointText}>{point.score}</Text>
            </View>
          ))}
          
          {/* Draw lines between points */}
          {points.map((point, index) => {
            if (index === 0) return null;
            const prevPoint = points[index - 1];
            const distance = Math.sqrt(
              Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
            );
            const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * 180 / Math.PI;
            
            return (
              <View
                key={`line-${index}`}
                style={[
                  styles.chartLine,
                  {
                    left: prevPoint.x,
                    top: prevPoint.y,
                    width: distance,
                    transform: [{ rotate: `${angle}deg` }],
                  }
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ImageBackground
        source={require('../asserts/background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient colors={['#2e004f', '#000']} style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your history... ✨</Text>
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
      <LinearGradient colors={['#2e004f', '#000']} style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollArea}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <Text style={styles.headerTitle}>📈 Assessment History</Text>
            <Text style={styles.headerSubtitle}>
              Track your mental health journey over time
            </Text>
          </View>

          {results.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>📋 No History Yet</Text>
              <Text style={styles.emptyStateText}>
                Take your first depression assessment to start tracking your mental health journey.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('DepressionTest')}
              >
                <Text style={styles.buttonText}>Take Assessment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Period Filter */}
              <View style={styles.periodContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {renderPeriodButton('all', 'All Time')}
                  {renderPeriodButton('30days', 'Last 30 Days')}
                  {renderPeriodButton('90days', 'Last 3 Months')}
                  {renderPeriodButton('1year', 'Last Year')}
                </ScrollView>
              </View>

              {/* Statistics */}
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>📊 Your Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{statistics.totalTests}</Text>
                    <Text style={styles.statLabel}>Total Tests</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: getScoreColor(statistics.averageScore) }]}>
                      {statistics.averageScore}
                    </Text>
                    <Text style={styles.statLabel}>Average Score</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: getScoreColor(statistics.lowestScore) }]}>
                      {statistics.lowestScore}
                    </Text>
                    <Text style={styles.statLabel}>Best Score</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{statistics.improvementCount}</Text>
                    <Text style={styles.statLabel}>Improvements</Text>
                  </View>
                </View>
              </View>

              {/* Simple Chart */}
              {renderSimpleChart()}

              {/* Results List */}
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>📋 Recent Results</Text>
                <FlatList
                  data={filteredResults}
                  keyExtractor={(item) => item.id}
                  renderItem={renderResultItem}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  ListEmptyComponent={() => (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No results found for this period.</Text>
                    </View>
                  )}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('DepressionTest')}
                >
                  <Text style={styles.buttonText}>Take New Assessment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dangerButton}
                  onPress={clearHistory}
                >
                  <Text style={styles.dangerButtonText}>Clear All History</Text>
                </TouchableOpacity>
              </View>
            </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#a74eff',
    fontSize: 16,
    fontStyle: 'italic',
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
  emptyState: {
    backgroundColor: '#2e004f',
    padding: 30,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  periodContainer: {
    marginBottom: 20,
  },
  periodButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedPeriodButton: {
    backgroundColor: '#a74eff',
  },
  periodButtonText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#2e004f',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#a74eff60',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1a1a2e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#a74eff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#2e004f',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#a74eff60',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    height: 120,
    position: 'relative',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
  },
  chartPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chartPointText: {
    position: 'absolute',
    top: -20,
    left: -8,
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  chartLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#a74eff80',
  },
  resultsContainer: {
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#2e004f',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a74eff40',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  scoreEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  trendEmoji: {
    fontSize: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 12,
    color: '#ccc',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  separator: {
    height: 12,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#a74eff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
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
  dangerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#FF4444',
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DepressionHistory;