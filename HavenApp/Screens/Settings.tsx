import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut, deleteUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import UserContext from '../Context/UserContext';
import { RootStackParamList } from '../App';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const auth = getAuth();
  const db = getFirestore();

  const getAllAsyncStorageData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await AsyncStorage.multiGet(keys);
      
      const asyncData: Record<string, any> = {};
      stores.forEach(([key, value]) => {
        try {
          asyncData[key] = JSON.parse(value);
        } catch {
          asyncData[key] = value;
        }
      });
      
      return asyncData;
    } catch (error) {
      console.error('Error getting AsyncStorage data:', error);
      return {};
    }
  };

  const getAllFirebaseData = async (userId: string) => {
    try {
      const firebaseData: Record<string, any> = {};

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        firebaseData['userProfile'] = userDoc.data();
      }

      const journalSnapshot = await getDocs(collection(db, 'users', userId, 'journalEntries'));
      firebaseData['journalEntries'] = journalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const moodSnapshot = await getDocs(collection(db, 'users', userId, 'moodHistory'));
      firebaseData['moodHistory'] = moodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const meditationSnapshot = await getDocs(collection(db, 'users', userId, 'meditationSessions'));
      firebaseData['meditationSessions'] = meditationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const chatSnapshot = await getDocs(collection(db, 'users', userId, 'chatHistory'));
      firebaseData['chatHistory'] = chatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return firebaseData;
    } catch (error) {
      console.error('Error getting Firebase data:', error);
      return {};
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOut(auth);
              setUser(null);
              // Fixed: Navigate to Welcome screen for logout (user needs to login again)
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
              Alert.alert('Success', 'You have been logged out successfully.');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'Backup Data',
      'This will create a backup of your personal data including journal entries, mood history, and preferences from both local storage and cloud storage.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Backup',
          onPress: async () => {
            if (!user?.uid) {
              Alert.alert('Error', 'No user logged in. Please login first.');
              return;
            }

            setIsLoading(true);
            try {
              const asyncStorageData = await getAllAsyncStorageData();
              const firebaseData = await getAllFirebaseData(user.uid);

              const backupData = {
                timestamp: new Date().toISOString(),
                userId: user.uid,
                userEmail: user.email,
                asyncStorageData,
                firebaseData,
                appVersion: '1.0.0',
                backupVersion: '1.0',
              };

              const backupId = `backup_${Date.now()}`;
              await setDoc(doc(db, 'users', user.uid, 'backups', backupId), backupData);
              await AsyncStorage.setItem(`backup_${Date.now()}`, JSON.stringify(backupData));

              Alert.alert(
                'Backup Complete',
                `Your data has been backed up successfully!\n\nBackup ID: ${backupId}\nTimestamp: ${new Date().toLocaleString()}`,
                [{ text: 'OK' }]
              );

            } catch (error) {
              console.error('Backup error:', error);
              Alert.alert(
                'Backup Failed',
                `Failed to create backup: ${error.message || 'Unknown error'}. Please try again.`
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDisableAccount = () => {
    Alert.alert(
      'Disable Account',
      'Disabling your account will temporarily deactivate it. You can reactivate it by logging in again. Your data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Disable',
              'Are you sure you want to disable your account?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Disable',
                  style: 'destructive',
                  onPress: async () => {
                    if (!user?.uid) {
                      Alert.alert('Error', 'No user logged in.');
                      return;
                    }

                    setIsLoading(true);
                    try {
                      await setDoc(doc(db, 'users', user.uid), {
                        accountStatus: 'disabled',
                        disabledAt: new Date().toISOString(),
                        lastActive: new Date().toISOString()
                      }, { merge: true });

                      await signOut(auth);
                      setUser(null);

                      Alert.alert(
                        'Account Disabled',
                        'Your account has been disabled. You can reactivate it by logging in again.',
                        [{ 
                          text: 'OK', 
                          onPress: () => navigation.reset({ 
                            index: 0, 
                            routes: [{ name: 'Welcome' }] // Fixed: Navigate to Welcome for disabled account
                          }) 
                        }]
                      );
                    } catch (error) {
                      console.error('Disable account error:', error);
                      Alert.alert('Error', 'Failed to disable account. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      '⚠️ WARNING: This action cannot be undone. All your data including journal entries, mood history, and account information will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete your account and ALL associated data. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'I Understand, Delete',
                  style: 'destructive',
                  onPress: async () => {
                    if (!user?.uid) {
                      Alert.alert('Error', 'No user logged in.');
                      return;
                    }

                    setIsLoading(true);
                    try {
                      const userId = user.uid;
                      const subcollections = ['journalEntries', 'moodHistory', 'meditationSessions', 'chatHistory', 'backups'];

                      for (const subcollection of subcollections) {
                        const snapshot = await getDocs(collection(db, 'users', userId, subcollection));
                        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
                        await Promise.all(deletePromises);
                      }

                      await deleteDoc(doc(db, 'users', userId));
                      await AsyncStorage.clear();

                      if (auth.currentUser) {
                        await deleteUser(auth.currentUser);
                      }

                      setUser(null);

                      Alert.alert(
                        'Account Deleted',
                        'Your account and all associated data have been permanently deleted.',
                        [{ 
                          text: 'OK', 
                          onPress: () => navigation.reset({ 
                            index: 0, 
                            routes: [{ name: 'Welcome' }] // Fixed: Navigate to Welcome after account deletion
                          }) 
                        }]
                      );
                    } catch (error) {
                      console.error('Delete account error:', error);
                      let errorMessage = 'Failed to delete account. Please try again.';
                      if (error.code === 'auth/requires-recent-login') {
                        errorMessage = 'Please logout and login again before deleting your account.';
                      }
                      Alert.alert('Error', errorMessage);
                    } finally {
                      setIsLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const SettingItem: React.FC<{
    title: string;
    onPress: () => void;
    color?: string;
    icon?: string;
  }> = ({ title, onPress, color = '#fff', icon }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={isLoading}>
      <View style={styles.settingItemLeft}>
        {icon && <Text style={styles.settingIcon}>{icon}</Text>}
        <Text style={[styles.settingText, { color }]}>{title}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient colors={['#2e004f', '#000']} style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>⚙️ Settings</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>👤 {user?.email || 'Guest User'}</Text>
              <Text style={styles.userStatus}>Active Account</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Management</Text>
              <View style={styles.sectionContent}>
                <SettingItem
                  title="Backup Data"
                  onPress={handleBackupData}
                  color="#4CAF50"
                  icon="💾"
                />

                <SettingItem
                  title="Logout"
                  onPress={handleLogout}
                  color="#FF9500"
                  icon="🚪"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danger Zone</Text>
              <View style={styles.sectionContent}>
                <SettingItem
                  title="Disable Account"
                  onPress={handleDisableAccount}
                  color="#FF6B6B"
                  icon="⏸️"
                />

                <SettingItem
                  title="Delete Account"
                  onPress={handleDeleteAccount}
                  color="#FF3B30"
                  icon="🗑️"
                />
              </View>
            </View>

            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Account deletion is permanent and cannot be undone. All your data including journal entries, mood history, meditation sessions, and chat history will be lost forever.
              </Text>
            </View>
          </ScrollView>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <LinearGradient colors={['#2e004f', '#a74eff']} style={styles.loadingContainer}>
                <Text style={styles.loadingText}>✨ Processing...</Text>
              </LinearGradient>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { 
    flex: 1 
  },
  overlay: { 
    flex: 1 
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2e004f',
    borderBottomWidth: 1,
    borderBottomColor: '#a74eff40',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userInfo: {
    backgroundColor: '#2e004f',
    padding: 20,
    borderRadius: 18,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a74eff60',
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5C7FF',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: '#2e004f',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#a74eff40',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#a74eff20',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 20,
    color: '#a74eff',
    fontWeight: '300',
  },
  warningContainer: {
    backgroundColor: '#8B0000',
    padding: 20,
    borderRadius: 18,
    marginTop: 30,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  warningText: {
    fontSize: 14,
    color: '#FFE4E4',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 18,
    minWidth: 150,
    alignItems: 'center',
    shadowColor: '#a74eff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default SettingsScreen;