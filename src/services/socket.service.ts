import { io, Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../utils/constants';
import { SessionLocationPayload } from '../types/socket';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_BASE_URL, {
      transports: ['websocket'],
      auth: { token },
      forceNew: true,
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emitJoinSession(sessionId: string): void {
    this.socket?.emit('session:join', { sessionId });
  }

  emitLeaveSession(sessionId: string): void {
    this.socket?.emit('session:leave', { sessionId });
  }

  emitSessionLocationUpdate(payload: {
    sessionId: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
  }): void {
    this.socket?.emit('session:location:update', payload);
  }

  onConnected(callback: (payload: { userId: string; message: string }) => void): () => void {
    this.socket?.on('tracking:connected', callback);
    return () => this.socket?.off('tracking:connected', callback);
  }

  onSessionLocation(callback: (payload: SessionLocationPayload) => void): () => void {
    this.socket?.on('session:location:broadcast', callback);
    return () => this.socket?.off('session:location:broadcast', callback);
  }

  onSessionUpdated(
    callback: (payload: { sessionId: string; status: string; circleId?: string }) => void,
  ): () => void {
    this.socket?.on('session:updated', callback);
    return () => this.socket?.off('session:updated', callback);
  }

  onCircleActiveSharersChanged(
    callback: (payload: { circleId: string }) => void,
  ): () => void {
    this.socket?.on('circle:active-sharers:changed', callback);
    return () => this.socket?.off('circle:active-sharers:changed', callback);
  }

  onSosReceived(callback: (payload: { alertId: string; message: string; sessionId?: string }) => void): () => void {
    this.socket?.on('sos:received', callback);
    return () => this.socket?.off('sos:received', callback);
  }

  onError(callback: (payload: { message: string }) => void): () => void {
    this.socket?.on('app:error', callback);
    return () => this.socket?.off('app:error', callback);
  }
}

export default new SocketService();