import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const guidedMeditations = [
  {
    label: 'Breath it Out',
    image: require('../asserts/breath.png'),
    url: 'https://youtu.be/DbDoBzGY3vo?si=n2J0TkYioTYeY7-1',
  },
  {
    label: 'Body Calm',
    image: require('../asserts/breath.png'),
    url: 'https://youtu.be/3X0hEHop8ec?si=7-qWjBFWq_Du1_16',
  },
];

const healingOptions = [
  {
    label: 'Rain at Dusk',
    image: require('../asserts/rain.png'),
    url: 'https://youtu.be/8plwv25NYRo?si=L-9iWDQ_1rG11WR3',
  },
  {
    label: 'Evening Rewind',
    image: require('../asserts/evening.png'),
    url: 'https://youtu.be/-IONwI1zbBA?si=Wj6ALonpvTxFLoak',
  },
  {
    label: 'Ocean Whispers',
    image: require('../asserts/ocean.png'),
    url: 'https://www.youtube.com/watch?v=la_AEFO8m7U',
  },
];

const affirmations = [
  'Your breath is the doorway to peace.',
  'Gentleness is strength in slow motion.',
  'You deserve rest, not just productivity.',
  'Even a moment of stillness matters.',
];

const MeditationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [affirmation, setAffirmation] = useState('');
  const [timeQuote, setTimeQuote] = useState('');

  useEffect(() => {
    const random = affirmations[Math.floor(Math.random() * affirmations.length)];
    setAffirmation(random);

    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeQuote('🌅 Begin gently. The world rises with you.');
    } else if (hour < 18) {
      setTimeQuote('🌤️ Take a pause. The day is yours to soften.');
    } else {
      setTimeQuote('🌙 You’ve done enough. Rest is revolutionary.');
    }
  }, []);

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("Sorry, can't open this link.");
    }
  };

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient colors={['#2e004f', '#000']} style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollArea}>
          {/* 🔙 Back to Home */}
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          {/* 🧘🏾 Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Let’s take a moment for you</Text>
            <Text style={styles.headerSubtitle}>Breathe, Unwind, Reset.</Text>
            <Text style={styles.affirmation}>{affirmation}</Text>
            <Text style={styles.timeQuote}>{timeQuote}</Text>
          </View>

          {/* 🔹 Guided Meditations */}
          <Text style={styles.sectionTitle}>Guided Meditations</Text>
          <View style={styles.cardRow}>
            {guidedMeditations.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.card}
                onPress={() => openLink(item.url)}
              >
                <Image source={item.image} style={styles.cardImage} />
                <Text style={styles.cardLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🔸 Sound & Visual Healing */}
          <Text style={styles.sectionTitle}>Sounds and Visual Healing</Text>
          <View style={styles.cardRow}>
            {healingOptions.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.card}
                onPress={() => openLink(item.url)}
              >
                <Image source={item.image} style={styles.cardImage} />
                <Text style={styles.cardLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 🧭 Bottom Navigation */}
          <View style={styles.bottomNav}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Image source={require('../asserts/homeIcon.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Insights')}>
              <Image source={require('../asserts/Insights.png')} style={styles.navIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ChatWithHaven')}>
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
    paddingBottom: 80,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ccc',
    fontStyle: 'italic',
  },
  affirmation: {
    fontSize: 14,
    color: '#E5C7FF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  timeQuote: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 20,
    marginBottom: 12,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: '#2e004f',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
    backgroundColor: '#2e004f',
  },
  cardLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomNav: {
    backgroundColor: '#2e004f',
    paddingVertical: 14,
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

export default MeditationScreen;