import api from '../api/axios';
import { ApiResponse, AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';
import { User } from '../types/user';

class AuthService {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return response.data.data;
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return response.data.data;
  }

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data.data;
  }

  async logout(): Promise<void> {
    return Promise.resolve();
  }
}

export default new AuthService();