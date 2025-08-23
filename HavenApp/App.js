import React, { useContext, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { UserProvider } from "./Context/UserContext";
import { AudioProvider } from "./Context/AudioContext";
import UserContext from "./Context/UserContext";

// Authentication Screens
import WelcomeScreen from "./Screens/WelcomeScreen";
import AboutScreen from "./Screens/AboutScreen";
import IntroScreen from "./Screens/IntroScreen";
import ChooseGender from "./Screens/ChooseGender";
import AgeRangeScreen from "./Screens/Age";
import LifestyleScreen from "./Screens/Lifestyle";
import SignUpScreen from "./Screens/SignUp";
import SignInScreen from "./Screens/SignIn";
import CreateAccountScreen from "./Screens/CreateAccount";

// Main App Screens (After Authentication)
import HomeScreen from "./Screens/Home";
import SettingsScreen from "./Screens/Settings";
import ProfileScreen from "./Screens/Profile";
import InsightsScreen from "./Screens/Insights";
import JournalingScreen from "./Screens/Journaling";
import MeditationScreen from "./Screens/Meditation";
import DepressionScreen from "./Screens/Depression";
import ChatWithHavenScreen from "./Screens/HavenChat";
import HavenChatHistoryScreen from "./Screens/HavenChatHistory";
import MoodScreen from "./Screens/Mood";
import HistoryScreen from "./Screens/History";
import DepressionTest from "./Screens/DepressionTest";
import DepressionResults from "./Screens/DepressionResults";
import DepressionHistory from "./Screens/DepressionHistory";

// Custom Side Menu
import SideMenu from "./Screens/SideMenu";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Authentication Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="ChooseGender" component={ChooseGender} />
      <Stack.Screen name="AgeRange" component={AgeRangeScreen} />
      <Stack.Screen name="Lifestyle" component={LifestyleScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
};

// Main App Drawer Navigator (for authenticated users)
const MainDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <SideMenu {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Insights" component={InsightsScreen} />
      <Drawer.Screen name="Journaling" component={JournalingScreen} />
      <Drawer.Screen name="Meditation" component={MeditationScreen} />
      <Drawer.Screen name="Depression" component={DepressionScreen} />
      <Drawer.Screen name="DepressionTest" component={DepressionTest} />
      <Drawer.Screen name="DepressionResults" component={DepressionResults} />
      <Drawer.Screen name="DepressionHistory" component={DepressionHistory} />
      <Drawer.Screen name="ChatHaven" component={ChatWithHavenScreen} />
      <Drawer.Screen name="HavenChatHistory" component={HavenChatHistoryScreen} />
      <Drawer.Screen name="Mood" component={MoodScreen} />
      <Drawer.Screen name="History" component={HistoryScreen} />
    </Drawer.Navigator>
  );
};

// Root Navigator Component
const RootNavigator = () => {
  const { user, setUser } = useContext(UserContext);
  const [initializing, setInitializing] = useState(true);
  const auth = getAuth();

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      setUser(firebaseUser);
      if (initializing) setInitializing(false);
    });

    return unsubscribe; // Cleanup subscription
  }, []);

  // Show loading screen while checking auth state
  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a74eff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Return appropriate navigator based on auth state
  return user ? <MainDrawer /> : <AuthStack />;
};

const App = () => {
  return (
    <UserProvider>
      <AudioProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AudioProvider>
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2e004f',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});

export default App;