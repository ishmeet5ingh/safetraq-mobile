import api from '../api/axios';
import { ApiResponse } from '../types/auth';
import { User } from '../types/user';

export interface UpdateLocationPayload {
  latitude: number;
  longitude: number;
}

class UserService {
  async updateCurrentLocation(payload: UpdateLocationPayload): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/users/location', payload);
    return response.data.data;
  }

  async getLiveUsers(params?: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
  }): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users/live', {
      params,
    });

    return response.data.data;
  }
}

export default new UserService();