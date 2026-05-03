export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  bio?: string;
  college?: string;
  branch?: string;
  year?: string;
  emailNotificationsEnabled?: boolean;
  dailyDigestEnabled?: boolean;
  followers?: string[]; // Array of user UIDs
  following?: string[]; // Array of user UIDs
  createdAt: any;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  likes: string[]; // Array of user UIDs
  commentCount: number;
  createdAt: any;
  tags?: string[];
  imageIds?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: any;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: 'like' | 'comment' | 'follow' | 'unfollow' | 'follow_accept' | 'message' | 'post';
  postId?: string;
  read: boolean;
  createdAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: any;
}
