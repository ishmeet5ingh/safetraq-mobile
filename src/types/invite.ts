export interface Invite {
  _id: string;
  circleId: string;
  circleName: string;
  circleType: 'family' | 'partner' | 'friends' | 'team';
  invitedEmail?: string;
  role: 'admin' | 'member';
  status: 'pending' | 'active' | 'declined';
  createdAt: string;
}