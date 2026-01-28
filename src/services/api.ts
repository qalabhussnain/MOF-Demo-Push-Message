/**
 * @deprecated Prefer the new ADSPass API layer under `src/api/`.
 *
 * This file is kept to avoid confusion and as a compatibility layer
 * for any legacy imports that might still reference `src/services/api.ts`.
 */

export {
  getDeviceInfoByMobileNum,
  registerDeviceMapping,
  unregisterDeviceMapping,
} from '../api/adsPassDevices';
