import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { LOCATION_UPDATE_INTERVAL } from '../utils/constants';

export interface DeviceLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
}

export type TrackingMode = 'balanced' | 'high';

class LocationService {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const finePermission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
      const coarsePermission = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;

      const hasFine = await PermissionsAndroid.check(finePermission);
      const hasCoarse = await PermissionsAndroid.check(coarsePermission);

      if (hasFine || hasCoarse) {
        return true;
      }

      const granted = await PermissionsAndroid.request(
        finePermission,
        {
          title: 'Location Permission',
          message:
            'SafeTraq needs location access only while an active live session is running.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    const status = await Geolocation.requestAuthorization('whenInUse');
    return status === 'granted';
  }

  getCurrentLocation(): Promise<DeviceLocation> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed ?? undefined,
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
          forceRequestLocation: true,
          showLocationDialog: true,
        },
      );
    });
  }

  async startTracking(
    onLocation: (location: DeviceLocation) => void | Promise<void>,
    onError?: (error: unknown) => void,
    mode: TrackingMode = 'balanced',
  ): Promise<void> {
    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    this.stopTracking();

    const interval = mode === 'high' ? 7000 : LOCATION_UPDATE_INTERVAL;

    const run = async (): Promise<void> => {
      try {
        const location = await this.getCurrentLocation();
        await onLocation(location);
      } catch (error) {
        onError?.(error);
      }
    };

    await run();

    this.intervalId = setInterval(() => {
      void run();
    }, interval);
  }

  stopTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default new LocationService();
