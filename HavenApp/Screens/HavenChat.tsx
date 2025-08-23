import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

type ChatSession = {
  id: number;
  date: string;
  messages: ChatMessage[];
};

const ChatWithHavenScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const STORAGE_KEY = 'chatHistoryPlain.v1'; // Plaintext storage key

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.loadedChat) {
        console.log('Loading chat with messages:', route.params.loadedChat.length);
        setChat(route.params.loadedChat);
      }
    }, [route.params?.loadedChat])
  );

  useEffect(() => {
    if (route.params?.loadedChat) {
      const timer = setTimeout(() => {
        navigation.setParams({ loadedChat: undefined });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [route.params?.loadedChat, navigation]);

  useEffect(() => {
    if (scrollViewRef.current && chat.length > 0) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: input.trim() };
    const updatedChat: ChatMessage[] = [...chat, newUserMessage];
    setChat(updatedChat);
    setInput('');
    setTyping(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer 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',
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: updatedChat.map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text,
          })),
        }),
      });

      const data = await response.json();
      if (data?.error) throw new Error(data.error.message || 'API Error');

      const reply = data.choices?.[0]?.message?.content?.trim();
      if (reply) {
        setChat((prev) => [...prev, { sender: 'ai', text: reply }]);
      } else {
        throw new Error('No valid AI response received.');
      }
    } catch (error: any) {
      console.error('Groq API error:', error.message);
      setChat((prev) => [
        ...prev,
        { sender: 'ai', text: "😞 Sorry, I couldn't respond right now. Please try again later." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleSaveChat = async () => {
    if (chat.length === 0) {
      Alert.alert('No Chat', 'There are no messages to save.');
      return;
    }

    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      let history: ChatSession[] = [];

      if (existingData) {
        try {
          history = JSON.parse(existingData) as ChatSession[];
        } catch (e) {
          console.warn('Failed to parse existing chat history. Starting fresh.');
          history = [];
        }
      }

      const newSession: ChatSession = {
        id: Date.now(),
        date: new Date().toISOString(),
        messages: chat,
      };

      const newHistory = [...history, newSession];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));

      Alert.alert('Saved', 'This chat has been saved.');
    } catch (err) {
      console.error('Error saving chat:', err);
      Alert.alert('Error', 'Failed to save chat. Please try again.');
    }
  };

  const getDecryptedHistory = async (): Promise<ChatSession[]> => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored) as ChatSession[];
    } catch (e) {
      console.warn('Failed to parse saved chat history.');
      return [];
    }
  };

  const handleNewChat = () => {
    if (chat.length === 0) {
      return;
    }

    Alert.alert(
      'New Chat',
      'Start a new conversation? Current chat will be lost unless saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'New Chat',
          onPress: () => {
            setChat([]);
            setInput('');
            navigation.setParams({ loadedChat: undefined });
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <LinearGradient colors={['#2e004f', '#24003d']} style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => (navigation as any).navigate('HavenChatHistory')}>
              <Text style={styles.historyButton}>📜</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
              <Text style={styles.newChatText}>+</Text>
            </TouchableOpacity>

            <Image source={require('../asserts/chat.png')} style={styles.avatar} />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>Haven</Text>
              <Text style={styles.subtitle}>Your emotional companion</Text>
            </View>
            <Text style={styles.moodBadge}>😊</Text>
          </View>

          {/* Chat Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {chat.length === 0 && (
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome! How are you feeling today?</Text>
              </View>
            )}
            {chat.map((msg, index) => (
              <View
                key={index}
                style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}
              >
                <Text style={styles.bubbleText}>{msg.text}</Text>
              </View>
            ))}
            {typing && (
              <View style={styles.aiBubble}>
                <Text style={styles.typingDots}>● ● ●</Text>
              </View>
            )}
          </ScrollView>

          {chat.length > 0 && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChat}>
              <Text style={styles.saveText}>💾 Save Chat</Text>
            </TouchableOpacity>
          )}

          {/* Input */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="What's on your heart today?"
              placeholderTextColor="#ccc"
              value={input}
              onChangeText={setInput}
              cursorColor="#fff"
              multiline
            />
            <TouchableOpacity onPress={handleSend} disabled={!input.trim()}>
              <Text style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}>➤</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomColor: '#ffffff10',
    borderBottomWidth: 1,
  },
  backButton: { marginRight: 10, padding: 4 },
  backText: { color: '#fff', fontSize: 22, fontWeight: '600' },
  historyButton: { color: '#fff', fontSize: 20, marginRight: 10 },
  newChatButton: {
    marginRight: 10,
    padding: 4,
    backgroundColor: '#ffffff20',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  avatar: { width: 48, height: 48, marginRight: 12, borderRadius: 24, backgroundColor: '#fff' },
  nameContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 13, color: '#ccc', fontStyle: 'italic' },
  moodBadge: { fontSize: 20 },
  chatArea: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  chatContainer: { paddingBottom: 80 },
  welcomeContainer: { alignItems: 'center', marginTop: 50, marginBottom: 20 },
  welcomeText: { color: '#ccc', fontSize: 16, fontStyle: 'italic', textAlign: 'center' },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 10, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#a74eff' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#ffffff15' },
  bubbleText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  typingDots: { fontSize: 18, color: '#ccc', paddingHorizontal: 6, fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#ffffff30',
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 6,
  },
  saveText: { fontSize: 14, color: '#ccc' },
  inputBar: {
    backgroundColor: '#2e004f',
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 14,
    borderTopColor: '#ffffff10',
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff15',
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    fontSize: 14,
    maxHeight: 120,
  },
  sendButton: { fontSize: 20, color: '#fff', marginLeft: 14 },
  sendButtonDisabled: { color: '#666' },
});

export default ChatWithHavenScreen;