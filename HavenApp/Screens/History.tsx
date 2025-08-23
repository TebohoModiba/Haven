import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Journaling: { 
    prompt?: string;
    editEntry?: {
      id: string;
      text: string;
      date: string;
      wordCount: number;
    };
  };
  Mood: { mood: string };
  History: undefined;
};

type HistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

interface JournalEntry {
  id: string;
  text: string;
  date: string;
  wordCount: number;
}

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('journalEntries');
      if (stored) {
        const parsedEntries = JSON.parse(stored);
        // Sort by date, newest first
        parsedEntries.sort((a: JournalEntry, b: JournalEntry) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setEntries(parsedEntries);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
      Alert.alert('Error', 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries])
  );

  const handleDeleteEntry = (entryId: string) => {
    const entryToDelete = entries.find(entry => entry.id === entryId);
    if (!entryToDelete) return;

    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedEntries = entries.filter(entry => entry.id !== entryId);
              await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
              setEntries(updatedEntries);
              Alert.alert('Deleted', 'Journal entry has been deleted successfully.');
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry');
            }
          }
        },
      ]
    );
  };

  const handleClearAllEntries = () => {
    if (entries.length === 0) {
      return;
    }

    Alert.alert(
      'Clear All Entries',
      'Are you sure you want to delete all journal entries? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('journalEntries');
              setEntries([]);
              Alert.alert('Cleared', 'All journal entries have been cleared.');
            } catch (error) {
              console.error('Error clearing entries:', error);
              Alert.alert('Error', 'Failed to clear journal entries');
            }
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 2) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays <= 7) {
        return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
      }
    } catch {
      return 'Invalid date';
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    Alert.alert(
      'Edit Entry',
      'What would you like to do with this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'View Full Text', 
          onPress: () => {
            Alert.alert(
              `Entry from ${formatDate(entry.date)}`,
              entry.text,
              [{ text: 'Close', style: 'default' }],
              { cancelable: true }
            );
          }
        },
        { 
          text: 'Edit Entry', 
          onPress: () => {
            // Navigate to Journaling screen with the entry to edit
            navigation.navigate('Journaling', { 
              editEntry: {
                id: entry.id,
                text: entry.text,
                date: entry.date,
                wordCount: entry.wordCount
              }
            });
          }
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: JournalEntry }) => {
    const formattedDate = formatDate(item.date);

    return (
      <View style={styles.entryCard}>
        <TouchableOpacity
          style={styles.entryContent}
          onPress={() => handleEditEntry(item)}
          activeOpacity={0.7}
        >
          <View style={styles.entryHeader}>
            <Text style={styles.entryDate}>📅 {formattedDate}</Text>
            <Text style={styles.wordCount}>📝 {item.wordCount} word{item.wordCount !== 1 ? 's' : ''}</Text>
          </View>
          <Text style={styles.entryText}>
            {item.text.slice(0, 150)}{item.text.length > 150 ? '...' : ''}
          </Text>
          <Text style={styles.readMore}>Tap to view or edit entry</Text>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('Journaling', { 
              editEntry: {
                id: item.id,
                text: item.text,
                date: item.date,
                wordCount: item.wordCount
              }
            })}
          >
            <Text style={styles.editText}>✏️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteEntry(item.id)}
          >
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient colors={['#8000a0', '#2e004f']} style={styles.overlay}>
        <View style={styles.container}>
          {/* Header with back button and clear all */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            
            {entries.length > 0 && (
              <TouchableOpacity onPress={handleClearAllEntries} style={styles.clearButton}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>📖 Journal History</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loading}>Loading...</Text>
            </View>
          ) : entries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.noEntries}>No journal entries found yet.</Text>
              <Text style={styles.emptySubtext}>Your thoughts and reflections will appear here</Text>
              <TouchableOpacity 
                style={styles.startJournalingButton}
                onPress={() => navigation.navigate('Journaling')}
              >
                <Text style={styles.startJournalingText}>Start Journaling</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                  {entries.length} journal entr{entries.length !== 1 ? 'ies' : 'y'}
                </Text>
              </View>
              
              <FlatList
                data={entries}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, paddingTop: 60 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loading: {
    color: '#eee',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  noEntries: {
    color: '#eee',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 30,
  },
  startJournalingButton: {
    backgroundColor: '#a74eff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startJournalingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statsText: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  list: {
    paddingBottom: 80,
  },
  entryCard: {
    backgroundColor: '#f1d9ff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#a74eff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0c4ff',
  },
  entryContent: {
    flex: 1,
    padding: 20,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 12,
    color: '#7a008b',
    fontWeight: 'bold',
  },
  wordCount: {
    fontSize: 11,
    color: '#7a008b',
    fontStyle: 'italic',
  },
  entryText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  readMore: {
    fontSize: 12,
    color: '#7a008b',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'column',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    flex: 1,
  },
  editText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    flex: 1,
  },
  deleteText: {
    fontSize: 18,
  },
});

export default HistoryScreen;