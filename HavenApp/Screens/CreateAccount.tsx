import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { createUserWithEmailAndPassword, updateProfile, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useUser } from '../Context/UserContext';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setUserData } = useUser();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
      android: '306280760812-mifklo2ehir22n133qhndlt0ljceseef.apps.googleusercontent.com',
      web: '306280760812-j3jt08pm65uidhoq5mpmqa2hgbv45bof.apps.googleusercontent.com',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          const user = userCredential.user;
          setUserData({
            fullName: user.displayName || '',
            email: user.email || '',
            uid: user.uid,
          });
          Alert.alert('Success', 'Signed in with Google!', [
            { text: 'OK', onPress: () => navigation.navigate('Home') },
          ]);
        })
        .catch((error) => {
          console.error('Google Sign-In Error:', error);
          Alert.alert('Sign In Error', error.message || 'Google sign-in failed.');
        });
    }
  }, [response]);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName,
      });

      setUserData({
        fullName: fullName,
        email: email,
        uid: user.uid,
      });

      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Home');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Firebase Error:', error);
      Alert.alert('Sign Up Error', error.message || 'Something went wrong');
    }
  };

  return (
    <ImageBackground
      source={require('../asserts/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']} style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Create Account 🌸</Text>

          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#ccc"
            style={styles.input}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          {/* Password Field */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#ccc"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Field */}
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#ccc"
              style={styles.passwordInput}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpText}>SIGN UP ✨</Text>
          </TouchableOpacity>

          {/* Google Sign-Up */}
          <TouchableOpacity
            style={[styles.signUpButton, { backgroundColor: '#6d11c9ff', marginTop: 16 }]}
            disabled={!request}
            onPress={() => promptAsync()}
          >
            <Text style={styles.signUpText}>Sign Up with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.signInText}>
              Already have an account? <Text style={{ textDecorationLine: 'underline' }}>SIGN IN</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  container: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 30,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#a74eff',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#a74eff',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#6d11c9ff',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
    marginTop: 12,
    elevation: 4,
  },
  signUpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.1,
  },
  signInText: {
    marginTop: 26,
    color: '#ccc',
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CreateAccountScreen;