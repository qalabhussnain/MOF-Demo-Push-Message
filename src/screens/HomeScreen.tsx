import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {unregisterDeviceMapping} from '../api/adsPassDevices';
import {clearSavedAuth, getSavedAuth} from '../storage/auth';

interface HomeScreenProps {
  route: {
    params?: {
      email?: string;
    };
  };
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({route, navigation}) => {
  const userEmail = route.params?.email || 'User';

  const handleLogout = async () => {
    try {
      const saved = await getSavedAuth();
      if (saved) {
        try {
          await unregisterDeviceMapping({
            userId: saved.userId,
            deviceUuid: saved.deviceUuid,
          });
        } catch (apiError) {
          console.warn('Failed to unregister device mapping:', apiError);
        }
        await clearSavedAuth();
      }
    } catch (storageError) {
      console.warn('Failed to clear auth data:', storageError);
    } finally {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          You have successfully logged in.
        </Text>

        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoLabel}>Email:</Text>
          <Text style={styles.userInfoValue}>{userEmail}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            This screen keeps the app active and ready to receive notifications.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  userInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  userInfoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 32,
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
