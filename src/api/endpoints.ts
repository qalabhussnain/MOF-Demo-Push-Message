/**
 * Endpoint registry (single source of truth).
 *
 * Keep these as RELATIVE paths. The base URL is configured once in `apiInstance.ts`.
 */
export const ENDPOINTS = {
  adsPass: {
    devices: {
      getDeviceInfoByMobileNum: '/api/devices/GetDeviceInfoByMobileNum',
      registerDevice: '/api/devices/RegisterDevice',
      unregisterDevice: '/api/devices/UnregisterDevice',
    },
  },
} as const;

