import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../Context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebaseConfig';
import Icon from 'react-native-vector-icons/Ionicons';

const moods = ['😊', '😡', '😭', '😵', '😐', '🥺', '😴', '🤔', '😄', '😞'];

const featureOptions = [
  { label: 'Journaling', image: require('../asserts/journaling.png'), screen: 'Journaling' },
  { label: 'Depression', image: require('../asserts/depression.png'), screen: 'Depression' },
  { label: 'Meditation', image: require('../asserts/Meditation.png'), screen: 'Meditation' },
  { label: 'Chat with Haven', image: require('../asserts/havenChat.png'), screen: 'ChatHaven' },
];

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Journaling: undefined;
  Depression: undefined;
  Meditation: undefined;
  ChatHaven: undefined;
  Insights: undefined;
  Profile: undefined;
  Mood: { mood: string };
  DepressionTest: undefined;
  DepressionResults: {
    score: number;
    answers: number[];
    timestamp: string;
  };
  DepressionHistory: undefined;
};

const HomeScreen = () => {
  const navigation = useNavigation<import('@react-navigation/native').NavigationProp<RootStackParamList>>();
  const { user, userData } = useUser();
  const [selectedMood, setSelectedMood] = useState(null);
  const [userName, setUserName] = useState('Friend');

  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];
  const slideAnim = useState(new Animated.Value(-250))[0]; // for side menu

  const [isSideMenuOpen, setSideMenuOpen] = useState(false);

  // Animate fade-in
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  // Animate side menu slide
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isSideMenuOpen ? 0 : -250,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSideMenuOpen]);

  // Fetch user name
  useEffect(() => {
    const getUserName = async () => {
      try {
        if (userData?.fullName) {
          const firstName = userData.fullName.split(' ')[0];
          setUserName(firstName);
          return;
        }
        if (auth.currentUser?.displayName) {
          const firstName = auth.currentUser.displayName.split(' ')[0];
          setUserName(firstName);
          return;
        }
        const storedProfile = await AsyncStorage.getItem('userProfile');
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          if (parsed.name) {
            const firstName = parsed.name.split(' ')[0];
            setUserName(firstName);
            return;
          }
        }
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (parsed.fullName) {
            const firstName = parsed.fullName.split(' ')[0];
            setUserName(firstName);
            return;
          }
        }
        const storedEmail = await AsyncStorage.getItem('userEmail');
        if (storedEmail) {
          const emailName = storedEmail.split('@')[0];
          const capName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          setUserName(capName);
          return;
        }
        setUserName('Friend');
      } catch (err) {
        console.log('Error getting user name:', err);
        setUserName('Friend');
      }
    };
    getUserName();
  }, [userData, user]);

  const handleMoodPress = (mood) => {
    setSelectedMood(mood);
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    navigation.navigate('Mood', { mood });
  };

  return (
    <ImageBackground source={require('../asserts/background.png')} style={styles.background} resizeMode="cover">
      <LinearGradient colors={['#2e004f', '#000']} style={styles.overlay}>

        {/* Hamburger icon */}
        <TouchableOpacity
          style={styles.hamburgerIconContainer}
          onPress={() => setSideMenuOpen(true)}
        >
          <Icon name="menu" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>HAVEN</Text>
          <Text style={styles.headerSubtitle}>Your Mental Health AI Companion</Text>
          {/* Settings icon */}
          <TouchableOpacity
            style={styles.settingsIconContainer}
            onPress={() => navigation.navigate('Settings')}
          >
            <Icon name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollArea}>
          {/* Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hello {userName} 👋🏾</Text>
            <Text style={styles.prompt}>How are you feeling today?</Text>
          </View>

          {/* Mood selection */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
              {moods.map((mood) => (
                <TouchableOpacity key={mood} onPress={() => handleMoodPress(mood)}>
                  <Animated.Text
                    style={[
                      styles.moodIcon,
                      selectedMood === mood && styles.moodSelected,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    {mood}
                  </Animated.Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {selectedMood && (
            <Text style={styles.moodFeedback}>
              You're feeling {selectedMood} today. Let's take care of that together 💫
            </Text>
          )}

          <Text style={styles.poeticLine}>Every mood tells a story. Let's listen gently. 🌙</Text>

          {/* Work on section */}
          <View style={styles.sectionPromptContainer}>
            <Text style={styles.sectionPrompt}>What would you like to work on?</Text>
          </View>

          {/* Feature options */}
          <Animated.View style={[styles.featureGrid, { opacity: fadeAnim }]}>
            {featureOptions.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.featureCard}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.85}
              >
                <Image source={item.image} style={styles.featureImage} />
                <Text style={styles.featureLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </ScrollView>

        {/* Bottom nav */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image source={require('../asserts/homeIcon.png')} style={styles.navIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Insights')}>
            <Image source={require('../asserts/Insights.png')} style={styles.navIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ChatHaven')}>
            <Image source={require('../asserts/chat.png')} style={styles.navIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image source={require('../asserts/profile.png')} style={styles.navIcon} />
          </TouchableOpacity>
        </View>

      </LinearGradient>

      {/* Side menu overlay */}
      {isSideMenuOpen && (
        <Animated.View style={[styles.sideMenu, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.sideMenuContent}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSideMenuOpen(false)}
            >
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Menu items */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setSideMenuOpen(false); navigation.navigate('History'); }}
            >
              <Text style={styles.menuText}>JournalHistory</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setSideMenuOpen(false); navigation.navigate('HavenChatHistory'); }}
            >
              <Text style={styles.menuText}>ChatHistory</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setSideMenuOpen(false); navigation.navigate('ChatHaven'); }}
            >
              <Text style={styles.menuText}>Chat with Haven</Text>
            </TouchableOpacity>
            {/* FIXED: The "Test" button now navigates to 'DepressionTest' */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => { setSideMenuOpen(false); navigation.navigate('DepressionTest'); }}
            >
              <Text style={styles.menuText}>Test</Text>
            </TouchableOpacity>
            {/* You can add more menu items here */}
          </View>
        </Animated.View>
      )}

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1 },
  scrollArea: {
    paddingBottom: 120,
    paddingHorizontal: 16,
  },

  // Hamburger Icon
  hamburgerIconContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 30,
    padding: 4,
  },

  headerBox: {
    backgroundColor: '#2e004f',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  settingsIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  greetingContainer: { marginBottom: 24 },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  prompt: { fontSize: 16, color: '#ccc' },
  moodScroll: { marginBottom: 24, paddingHorizontal: 10 },
  moodIcon: {
    fontSize: 32,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#400070',
    marginRight: 12,
    color: '#fff',
  },
  moodSelected: { backgroundColor: '#a74eff' },
  moodFeedback: {
    fontSize: 16,
    color: '#D8B4FF',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  poeticLine: {
    fontSize: 15,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionPromptContainer: {
    marginBottom: 20,
    backgroundColor: '#2e004f',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  sectionPrompt: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  featureGrid: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    rowGap: 20,
    marginBottom: 24,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#2e004f',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    elevation: 4,
  },
  featureImage: {
    width: '100%',
    height: 130,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
    backgroundColor: '#2e004f',
  },
  featureLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    backgroundColor: '#2e004f',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  navIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },

  // Side menu styles
  sideMenu: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 250,
    backgroundColor: '#2e004f',
    zIndex: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  sideMenuContent: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 30,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  menuText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HomeScreen;