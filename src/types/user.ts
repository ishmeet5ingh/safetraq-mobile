export interface CurrentLocation {
  type: 'Point';
  coordinates: [number, number];
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isOnline: boolean;
  currentLocation?: CurrentLocation;
  createdAt: string;
  updatedAt: string;
}