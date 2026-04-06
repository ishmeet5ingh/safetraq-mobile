export const API_BASE_URL = 'http://192.168.1.72:5002/api';
export const SOCKET_BASE_URL = 'http://192.168.1.69:5002';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
} as const;

export const LOCATION_UPDATE_INTERVAL = 12000;

export const SESSION_DURATIONS = [
  { label: '15 min', minutes: 15 },
  { label: '1 hour', minutes: 60 },
  { label: '4 hours', minutes: 240 },
  { label: 'Until I stop', minutes: 0 },
] as const;
