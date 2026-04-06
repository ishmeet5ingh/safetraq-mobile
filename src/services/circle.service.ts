import api from '../api/axios';
import { ApiResponse } from '../types/auth';
import { Circle, CreateCirclePayload, InviteCircleMemberPayload } from '../types/circle';

class CircleService {
  async getCircles(): Promise<Circle[]> {
    const response = await api.get<ApiResponse<Circle[]>>('/circles');
    return response.data.data;
  }

  async getCircleById(circleId: string): Promise<Circle> {
    const response = await api.get<ApiResponse<Circle>>(`/circles/${circleId}`);
    return response.data.data;
  }

  async createCircle(payload: CreateCirclePayload): Promise<Circle> {
    const response = await api.post<ApiResponse<Circle>>('/circles', payload);
    return response.data.data;
  }

  async inviteMember(payload: InviteCircleMemberPayload): Promise<Circle> {
    const response = await api.post<ApiResponse<Circle>>(`/circles/${payload.circleId}/invite`, {
      email: payload.email,
      role: payload.role || 'member',
    });
    return response.data.data;
  }

  async getActiveSharers(circleId: string) {
  const response = await api.get(`/circles/${circleId}/active-sharers`);
  return response.data.data;
}
}

export default new CircleService();
