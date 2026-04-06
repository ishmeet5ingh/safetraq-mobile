import { Circle } from './circle';

export type SessionStatus = 'active' | 'paused' | 'ended' | 'expired';

export interface SessionLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  updatedAt: string;
}

export interface ShareSession {
  _id: string;
  ownerUserId: string;
  circleId?: string;
  circle?: Circle;
  title: string;
  status: SessionStatus;
  startedAt: string;
  expiresAt?: string;
  endedAt?: string;
  viewerUserIds: string[];
  latestLocation?: SessionLocation;
  createdAt: string;
  updatedAt: string;
}

export interface StartSessionPayload {
  title: string;
  circleId?: string;
  durationMinutes?: number;
}

export interface ActiveSharer {
  sessionId: string;
  userId: string;
  circleId: string;
  title: string;
  name: string;
  email: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  updatedAt: string;
}