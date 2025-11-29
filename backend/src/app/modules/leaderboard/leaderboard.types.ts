export interface ILeaderboardEntry {
  userId: string;
  name: string;
  profilePicture?: string;
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted: number;
  rank: number;
}

export interface ILeaderboardQuery {
  type: 'global' | 'topic' | 'friends';
  topic?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  limit?: number;
}
