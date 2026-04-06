export interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
}

export interface SessionLocationPayload {
  sessionId: string;
  userId: string;
  circleId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  updatedAt: string;
  name?: string;
  email?: string;
}

export interface SocketStatusPayload {
  userId: string;
  isOnline: boolean;
  lastSeenAt: string;
}
