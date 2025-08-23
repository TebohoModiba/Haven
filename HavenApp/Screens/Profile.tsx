import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../Context/UserContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, userData, setUserData } = useUser();
  const [moodLogDays, setMoodLogDays] = useState(0);
  const [logStreak, setLogStreak] = useState(0);

  const MOOD_LOG_KEY = '@mood_log';
  const STREAK_KEY = '@log_streak';
  const LAST_LOG_DATE_KEY = '@last_log_date';
  const SIGNUP_DATE_KEY = '@signup_date';

  useEffect(() => {
    const initializeTracking = async () => {
      if (user) {
        try {
          // Check if signup date exists
          const signupDate = await AsyncStorage.getItem(SIGNUP_DATE_KEY);
          if (!signupDate) {
            // New user, set signup date
            const today = new Date().toISOString().split('T')[0];
            await AsyncStorage.setItem(SIGNUP_DATE_KEY, today);
            await AsyncStorage.setItem(MOOD_LOG_KEY, '0');
            await AsyncStorage.setItem(STREAK_KEY, '0');
            await AsyncStorage.setItem(LAST_LOG_DATE_KEY, '');
            setMoodLogDays(0);
            setLogStreak(0);
          } else {
            // Existing user, load data
            const moodLog = await AsyncStorage.getItem(MOOD_LOG_KEY);
            const streak = await AsyncStorage.getItem(STREAK_KEY);
            const lastLogDate = await AsyncStorage.getItem(LAST_LOG_DATE_KEY);

            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const todayStr = today.toISOString().split('T')[0];
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            let moodLogCount = parseInt(moodLog || '0');
            let streakCount = parseInt(streak || '0');

            // Check if a new day has passed to update streak
            if (lastLogDate !== todayStr) {
              // Simulate a mood log for this example (in a real app, this would be triggered by user action)
              moodLogCount += 1;
              if (lastLogDate === yesterdayStr || lastLogDate === '') {
                streakCount += 1;
              } else {
                streakCount = 1; // Reset streak if more than one day missed
              }
              await AsyncStorage.setItem(MOOD_LOG_KEY, moodLogCount.toString());
              await AsyncStorage.setItem(STREAK_KEY, streakCount.toString());
              await AsyncStorage.setItem(LAST_LOG_DATE_KEY, todayStr);
            }

            setMoodLogDays(moodLogCount);
            setLogStreak(streakCount);
          }
        } catch (error) {
          console.error('Error initializing tracking:', error);
        }
      } else {
        // Reset when user is not signed in
        setMoodLogDays(0);
        setLogStreak(0);
      }
    };

    initializeTracking();
  }, [user]);

  const getDisplayName = () => {
    if (userData?.fullName) {
      return userData.fullName;
    } else if (user?.displayName) {
      return user.displayName;
    } else {
      return 'Haven User';
    }
  };

  const getEmail = () => {
    if (userData?.email) {
      return userData.email;
    } else if (user?.email) {
      return user.email;
    } else {
      return 'No email provided';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      navigation.navigate('SignUp');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient colors={['#8000a0', '#2e004f']} style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollArea}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Image source={require('../asserts/profile.png')} style={styles.userIcon} />
            <Text style={styles.userName}>{getDisplayName()}</Text>
            <Text style={styles.userEmail}>{getEmail()}</Text>
            <Text style={styles.userSubtitle}>Let's see how far we've come 😌</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Mood Log:</Text>
              <Text style={styles.statValue}>{moodLogDays} Days</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Log Streak:</Text>
              <Text style={styles.statValue}>{logStreak} Days</Text>
            </View>
          </View>

          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>💜 Keep Going, You're Growing ✊</Text>
            <Text style={styles.messageText}>
              Every emotion you've logged, every moment you've paused to reflect—that's progress.{"\n"}
              It's okay if healing feels messy.{"\n"}
              You're showing up, and that's brave.{"\n"}
              Take a breath, celebrate the small wins, and know that Haven is here every step of the way.{"\n"}
              You've got this.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Journals entered:</Text>
              <Text style={styles.statValue}>1 Entry</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statTitle}>Saved Quotes:</Text>
              <Text style={styles.statValue}>2</Text>
            </View>
          </View>

          <View style={styles.centeredButtonGroup}>
            {!user ? (
              <>
                <TouchableOpacity style={styles.supportButton} onPress={() => navigation.navigate('CreateAccount')}>
                  <Text style={styles.supportText}>Create Account 🔐</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.supportButton} onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.supportText}>Sign In 🙋🏾‍♀️</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
              
              </>
            )}
          </View>

          <View style={styles.statusBox}>
            <Text style={styles.statusTitle}>Account Status</Text>
            <Text style={styles.statusText}>
              {user ? `✅ Signed in as ${getDisplayName()}` : '❌ Not signed in - Create an account to save your progress!'}
            </Text>
          </View>

          <View style={styles.timelineBox}>
            <Text style={styles.timelineLabel}>🌈 Your Emotional Timeline</Text>
            <View style={styles.timelineRow}>
              {['😊', '😐', '😞', '😭', '😴'].map((mood, index) => (
                <Text key={index} style={styles.timelineMood}>{mood}</Text>
              ))}
            </View>
            
          </View>
          <View>
               <TouchableOpacity style={styles.supportButton} onPress={() => {}}>
                  <Text style={styles.supportText}>Backup My Journey 💾</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.supportButton, styles.signOutButton]} onPress={handleSignOut}>
                  <Text style={styles.supportText}>Sign Out 👋</Text>
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: '#a74eff',
    marginTop: 4,
  },
  userSubtitle: {
    fontSize: 16,
    color: '#ccc',
    fontStyle: 'italic',
    marginTop: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: '#2e004f',
    padding: 14,
    borderRadius: 16,
    width: '48%',
  },
  statTitle: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 6,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 16,
    color: '#a74eff',
    fontWeight: '700',
  },
  messageBox: {
    backgroundColor: '#2e004f',
    padding: 16,
    borderRadius: 18,
    marginBottom: 24,
  },
  messageTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    textAlign: 'center',
  },
  centeredButtonGroup: {
    alignItems: 'center',
    marginBottom: 24,
  },
  supportButton: {
    backgroundColor: '#a74eff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
    width: 240,
  },
  signOutButton: {
    backgroundColor: '#a74eff',
  },
  supportText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderRadius: 18,
    marginBottom: 24,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  timelineBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    borderRadius: 18,
    marginBottom: 24,
    alignItems: 'center',
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  timelineMood: {
    fontSize: 30,
  },
  bottomNav: {
    backgroundColor: '#2e004f',
    paddingVertical: 16,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 30,
    marginTop: 10,
  },
  navIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
});

export default ProfileScreen;