import api from '../api/axios';
import { Invite } from '../types/invite';

const inviteService = {
  async getPendingInvites(): Promise<Invite[]> {
    const response = await api.get('/circles/invites/pending');
    return response.data.data;
  },

  async acceptInvite(inviteId: string) {
    const response = await api.patch(`/circles/invites/${inviteId}/accept`);
    return response.data.data;
  },

  async declineInvite(inviteId: string) {
    const response = await api.patch(`/circles/invites/${inviteId}/decline`);
    return response.data.data;
  },
};

export default inviteService;