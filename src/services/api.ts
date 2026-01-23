/**
 * API Service for device registration
 * Currently using dummy/mock implementation since backend API is not available
 */

const API_BASE_URL = 'https://your-backend-api.com/api'; // Replace with actual API URL

export interface DeviceRegistrationRequest {
  email: string;
  fcmToken: string;
  deviceId?: string;
  platform: 'android' | 'ios';
}

export interface DeviceRegistrationResponse {
  success: boolean;
  message?: string;
  deviceId?: string;
}

/**
 * Register device with backend API
 * @param email User email
 * @param fcmToken FCM device token
 * @returns Promise<boolean> - true if registration successful
 */
export const registerDevice = async (
  email: string,
  fcmToken: string,
): Promise<boolean> => {
  try {
    const deviceInfo: DeviceRegistrationRequest = {
      email,
      fcmToken,
      platform: 'android', // You can detect this dynamically
      deviceId: fcmToken, // Using FCM token as device identifier for now
    };

    // TODO: Replace with actual API call when backend is ready
    // For now, this is a mock implementation
    console.log('Registering device:', deviceInfo);

    // Simulate API call
    const response = await fetch(`${API_BASE_URL}/devices/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deviceInfo),
    }).catch(() => {
      // If API is not available, log and return false
      console.warn(
        'Backend API not available. Device registration skipped.',
      );
      return null;
    });

    if (response && response.ok) {
      const data: DeviceRegistrationResponse = await response.json();
      console.log('Device registered successfully:', data);
      return data.success;
    }

    // If API call fails, log warning but don't block user
    console.warn('Device registration failed, but continuing...');
    return false;
  } catch (error) {
    console.error('Error registering device:', error);
    return false;
  }
};
