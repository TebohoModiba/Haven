import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Audio } from "expo-av"; // Importing Audio for audio context

const InsightsScreen: React.FC = () => {
    const navigation = useNavigation();
  return (
    <ImageBackground
      source={require('../asserts/Insights2.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient colors={['#8000a0', '#2e004f']} style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollArea}>
          
          {/* Header Section */}
          <View style={styles.headerContainer}>
               {/* 🔙 Back to Home */}
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
            <Text style={styles.headerTitle}>YOUR DAILY INSIGHTS😌</Text>
            <Text style={styles.headerSubtitle}>AI powered progress and patterns.</Text>
            
            <Text style={styles.headerNote}>A Snapshot of your emotional journey</Text>
          </View>

          {/* Mood Today */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📚 Mood Today:</Text>
            <Text style={styles.infoText}>You felt mostly Calm and Reflective.</Text>
          </View>

          {/* Thought for Today */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>💡 Thought for Today:</Text>
            <View style={styles.thoughtRow}>
              <Text style={styles.infoText}>Healing isn’t linear—and that’s okay.</Text>
             
            </View>
          </View>

          {/* Updated Support Section */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>🌱 Need extra support?</Text>
            <Text style={styles.infoText}>
              Here's a few ways to feel supported, without going anywhere:
            </Text>

            <View style={styles.supportRow}>
              <View style={styles.supportOptionBox}>
                <Text style={styles.supportOptionTitle}>📞 Crisis Lines</Text>
                <Text style={styles.supportOptionText}>
                  If you're in urgent distress, talking to someone trained can help you feel safe again.
                </Text>
              </View>

              <View style={styles.supportOptionBox}>
                <Text style={styles.supportOptionTitle}>🌐 Resources</Text>
                <Text style={styles.supportOptionText}>
                  Articles, guides, and warm knowledge to help you understand your journey.
                </Text>
              </View>

              <View style={styles.supportOptionBox}>
                <Text style={styles.supportOptionTitle}>💬 Talk to Someone</Text>
                <Text style={styles.supportOptionText}>
                  Sometimes the bravest thing is reaching out. You deserve to be heard.
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Navigation */}
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ccc',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  headerImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
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
  headerNote: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#2e004f',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#ccc',
  },
  thoughtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookmarkIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  supportRow: {
    marginTop: 16,
    rowGap: 14,
  },
  supportOptionBox: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    borderRadius: 14,
  },
  supportOptionTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 6,
  },
  supportOptionText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  bottomNav: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 30,
    backgroundColor: '#2e004f',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 30,
  },
  navIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
});

export default InsightsScreen;