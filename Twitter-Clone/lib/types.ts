export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  isVerified: boolean;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isReposted: boolean;
  images?: string[];
  hashtags?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'repost' | 'follow' | 'mention';
  actor: User;
  postId?: string;
  postContent?: string;
  timestamp: Date;
  isRead: boolean;
}
