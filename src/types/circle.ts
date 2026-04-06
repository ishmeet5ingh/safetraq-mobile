export type CircleType = 'family' | 'partner' | 'friends' | 'team';
export type CircleRole = 'admin' | 'member';
export type CircleMemberStatus = 'active' | 'pending';

export interface CircleMember {
  _id: string;
  userId?: string;
  invitedEmail?: string;
  name: string;
  email: string;
  role: CircleRole;
  status: CircleMemberStatus;
  joinedAt?: string;
}

export interface Circle {
  _id: string;
  name: string;
  type: CircleType;
  description?: string;
  createdBy: string;
  members: CircleMember[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCirclePayload {
  name: string;
  type: CircleType;
  description?: string;
}

export interface InviteCircleMemberPayload {
  circleId: string;
  email: string;
  role?: CircleRole;
}
