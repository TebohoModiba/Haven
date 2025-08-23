import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatSession {
  id: number;
  date: string;
  messages: { sender: 'user' | 'ai'; text: string }[];
}

const HavenChatHistory: React.FC = () => {
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem('chatHistory');
      if (data) {
        const parsedHistory: ChatSession[] = JSON.parse(data).map((session: any) => ({
          ...session,
          id: Number(session.id), // ensure id is always a number
        }));

        // Sort by date, newest first
        parsedHistory.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      Alert.alert('Error', 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleChatPress = (session: ChatSession) => {
    console.log('Navigating to chat with', session.messages.length, 'messages');
    (navigation as any).navigate('ChatHaven', { 
      loadedChat: session.messages 
    });
  };

  const handleDeleteChat = (sessionId: number) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedHistory = history.filter(session => session.id !== sessionId);
              await AsyncStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
              setHistory(updatedHistory);
              Alert.alert('Deleted', 'Chat has been deleted successfully.');
            } catch (error) {
              console.error('Error deleting chat:', error);
              Alert.alert('Error', 'Failed to delete chat');
            }
          }
        },
      ]
    );
  };

  const handleClearAllHistory = () => {
    if (history.length === 0) {
      return;
    }

    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all saved chats? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('chatHistory');
              setHistory([]);
              Alert.alert('Cleared', 'All chat history has been cleared.');
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear chat history');
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

      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    } catch {
      return 'Invalid date';
    }
  };

  const getPreviewText = (messages: ChatSession['messages']) => {
    const firstUserMessage = messages.find(msg => msg.sender === 'user');
    if (firstUserMessage) {
      return firstUserMessage.text.length > 40 
        ? firstUserMessage.text.slice(0, 40) + '...' 
        : firstUserMessage.text;
    }
    return 'No messages';
  };

  return (
    <LinearGradient colors={['#2e004f', '#24003d']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Saved Chats</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={handleClearAllHistory} style={styles.clearButton}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loading}>Loading...</Text>
            </View>
          ) : history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.empty}>No saved chats yet</Text>
              <Text style={styles.emptySubtext}>Your conversations with Haven will appear here</Text>
              <TouchableOpacity 
                style={styles.startChatButton}
                onPress={() => (navigation as any).navigate('ChatHaven')}
              >
                <Text style={styles.startChatText}>Start New Chat</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                  {history.length} saved conversation{history.length !== 1 ? 's' : ''}
                </Text>
              </View>
              
              {history.map((session) => (
                <View key={session.id} style={styles.chatCard}>
                  <TouchableOpacity
                    style={styles.chatContent}
                    onPress={() => handleChatPress(session)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.chatHeader}>
                      <Text style={styles.date}>
                        {formatDate(session.date)}
                      </Text>
                      <Text style={styles.messageCount}>
                        {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <Text style={styles.preview}>
                      {getPreviewText(session.messages)}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteChat(session.id)}
                  >
                    <Text style={styles.deleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backText: { 
    color: '#fff', 
    fontSize: 24, 
    paddingHorizontal: 8 
  },
  title: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold',
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loading: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 16
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  empty: { 
    color: '#ccc', 
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 10
  },
  emptySubtext: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 30,
  },
  startChatButton: {
    backgroundColor: '#a74eff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startChatText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statsText: {
    color: '#bbb',
    fontSize: 14,
    fontStyle: 'italic',
  },
  chatCard: {
    backgroundColor: '#ffffff15',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff10',
  },
  chatContent: {
    flex: 1,
    padding: 16
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  date: { 
    color: '#bbb', 
    fontSize: 12,
    fontWeight: '500'
  },
  messageCount: {
    color: '#999',
    fontSize: 11,
    flexShrink: 1,
  },
  preview: { 
    color: '#fff', 
    fontSize: 14,
    lineHeight: 20
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
  },
  deleteText: {
    fontSize: 18
  }
});

export default HavenChatHistory;