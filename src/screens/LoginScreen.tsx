import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {registerDeviceMapping} from '../api/adsPassDevices';
import {saveAuth} from '../storage/auth';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Dummy login validation
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      // Dummy authentication - accept any credentials
      // In a real app, this would call an authentication API
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000)); // Simulate API call

      // Get FCM token (silently in background)
      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);

      // ADSPass placeholder call (non-blocking for demo):
      // NOTE: Replace `userId` and `deviceUuid` with real values from your auth/device layer.
      try {
        const platform = Platform.OS === 'android' ? 'Android' : 'iOS';
        const deviceUuid = `device-${fcmToken.slice(0, 12)}`;
        const userId = 0;

        await registerDeviceMapping({
          userId,
          deviceUuid,
          deviceToken: fcmToken,
          platform,
        });

        // Store credentials + device info in AsyncStorage
        try {
          await saveAuth({
            email: email.trim(),
            password: password.trim(),
            userId,
            deviceUuid,
          });
        } catch (storageError) {
          console.warn('Failed to save auth data:', storageError);
        }
      } catch {
        // Swallow errors: user login should not be blocked by device mapping in this demo app.
      }

      // Navigate to Home screen with user email
      navigation.replace('Home', {email: email.trim()});
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        error.message || 'An error occurred during login',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Enter your credentials to continue</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: Any credentials will work (dummy authentication)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    marginTop: 20,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LoginScreen;
