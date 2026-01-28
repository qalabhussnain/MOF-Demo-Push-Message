import {ENDPOINTS} from './endpoints';
import {api} from './apiInstance';

/**
 * ADSPass uses a common wrapper in the document:
 * ResponseResult<T> (Result + Data).
 *
 * Because the exact casing can vary between implementations, this type is permissive.
 */
export type ResponseResult<T> = {
  Result?: unknown;
  Data?: T;
  result?: unknown;
  data?: T;
  message?: string;
  Message?: string;
};

export type RegisteredDeviceDto = {
  deviceUuid?: string;
  DeviceUuid?: string;
  deviceToken?: string;
  DeviceToken?: string;
  platform?: string;
  Platform?: string;
  isActive?: boolean;
  IsActive?: boolean;
};

export type ResolvedUserDto = {
  userId?: number;
  UserId?: number;
  mobileNumber?: string;
  MobileNumber?: string;
  devices?: RegisteredDeviceDto[];
  Devices?: RegisteredDeviceDto[];
};

/**
 * NOTE (from client document):
 * - These endpoints are intended for **service-to-service** use inside MOF backend.
 * - In this demo mobile app we call them directly only as a placeholder.
 *   In a real MOF deployment the mobile app should call MOF backend, and
 *   the backend would call ADSPass using these endpoints.
 */

/**
 * POST /api/devices/GetDeviceInfoByMobileNum?MobileNumber=...
 */
export async function getDeviceInfoByMobileNum(mobileNumber: string) {
  return await api.post<ResponseResult<ResolvedUserDto>>(
    ENDPOINTS.adsPass.devices.getDeviceInfoByMobileNum,
    {
      params: {MobileNumber: mobileNumber},
    },
  );
}

/**
 * POST /api/devices/RegisterDevice?UserId=...&DeviceUuid=...&DeviceToken=...&Platform=...
 */
export async function registerDeviceMapping(args: {
  userId: number;
  deviceUuid: string;
  deviceToken: string;
  platform: 'Android' | 'iOS';
}) {
  return await api.post<ResponseResult<string | null>>(
    ENDPOINTS.adsPass.devices.registerDevice,
    {
      params: {
        UserId: args.userId,
        DeviceUuid: args.deviceUuid,
        DeviceToken: args.deviceToken,
        Platform: args.platform,
      },
    },
  );
}

/**
 * POST /api/devices/UnregisterDevice?UserId=...&DeviceUuid=...
 */
export async function unregisterDeviceMapping(args: {
  userId: number;
  deviceUuid: string;
}) {
  return await api.post<ResponseResult<object>>(
    ENDPOINTS.adsPass.devices.unregisterDevice,
    {
      params: {
        UserId: args.userId,
        DeviceUuid: args.deviceUuid,
      },
    },
  );
}

