import { Types } from 'mongoose';

export interface IFriend {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  friend: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  requestedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFriendRequest {
  friendId: string;
}

export interface IFriendResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface IFriendStats {
  totalFriends: number;
  pendingRequests: number;
  sentRequests: number;
}

export interface IFriendRecommendation {
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    level: number;
    xp: number;
  };
  mutualFriends: number;
  similarInterests: string[];
  reason: string;
}
