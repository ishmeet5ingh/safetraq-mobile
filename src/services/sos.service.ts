import api from '../api/axios';
import { ApiResponse } from '../types/auth';

export interface TriggerSosPayload {
  sessionId?: string;
  message?: string;
  latitude?: number;
  longitude?: number;
}

export interface SOSAlertResponse {
  _id: string;
  status: string;
  triggeredAt: string;
}

class SosService {
  async trigger(payload: TriggerSosPayload): Promise<SOSAlertResponse> {
    const response = await api.post<ApiResponse<SOSAlertResponse>>('/sos', payload);
    return response.data.data;
  }
}

export default new SosService();
