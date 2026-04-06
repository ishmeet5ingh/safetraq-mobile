import api from '../api/axios';
import { ApiResponse } from '../types/auth';
import { ShareSession, StartSessionPayload } from '../types/session';

class SessionService {
  async getActiveSession(): Promise<ShareSession | null> {
    const response = await api.get<ApiResponse<ShareSession | null>>('/sessions/active');
    return response.data.data;
  }

  async getSessionById(sessionId: string): Promise<ShareSession> {
    const response = await api.get<ApiResponse<ShareSession>>(`/sessions/${sessionId}`);
    return response.data.data;
  }

  async startSession(payload: StartSessionPayload): Promise<ShareSession> {
    const response = await api.post<ApiResponse<ShareSession>>('/sessions', payload);
    return response.data.data;
  }

  async pauseSession(sessionId: string): Promise<ShareSession> {
    const response = await api.patch<ApiResponse<ShareSession>>(`/sessions/${sessionId}/pause`);
    return response.data.data;
  }

  async resumeSession(sessionId: string): Promise<ShareSession> {
    const response = await api.patch<ApiResponse<ShareSession>>(`/sessions/${sessionId}/resume`);
    return response.data.data;
  }

  async stopSession(sessionId: string): Promise<ShareSession> {
    const response = await api.patch<ApiResponse<ShareSession>>(`/sessions/${sessionId}/stop`);
    return response.data.data;
  }
}

export default new SessionService();
