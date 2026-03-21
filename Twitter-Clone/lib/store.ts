import useSWR, { mutate } from 'swr';
import { Post, Notification } from './types';
import { mockPosts, mockNotifications, currentUser } from './mock-data';

// Keys for SWR
const POSTS_KEY = 'posts';
const NOTIFICATIONS_KEY = 'notifications';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize with mock data
let postsStore = [...mockPosts];
let notificationsStore = [...mockNotifications];

// Posts fetcher
const fetchPosts = async (): Promise<Post[]> => {
  await delay(100);
  return postsStore;
};

// Notifications fetcher
const fetchNotifications = async (): Promise<Notification[]> => {
  await delay(100);
  return notificationsStore;
};

// Hook for posts
export function usePosts() {
  const { data, error, isLoading } = useSWR(POSTS_KEY, fetchPosts, {
    fallbackData: mockPosts,
  });

  const createPost = async (content: string) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: currentUser,
      content,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      reposts: 0,
      isLiked: false,
      isReposted: false,
      hashtags: content.match(/#\w+/g)?.map(tag => tag.slice(1)) || [],
    };
    
    postsStore = [newPost, ...postsStore];
    await mutate(POSTS_KEY, postsStore, false);
    return newPost;
  };

  const toggleLike = async (postId: string) => {
    postsStore = postsStore.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        };
      }
      return post;
    });
    await mutate(POSTS_KEY, postsStore, false);
  };

  const toggleRepost = async (postId: string) => {
    postsStore = postsStore.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isReposted: !post.isReposted,
          reposts: post.isReposted ? post.reposts - 1 : post.reposts + 1,
        };
      }
      return post;
    });
    await mutate(POSTS_KEY, postsStore, false);
  };

  const addComment = async (postId: string) => {
    postsStore = postsStore.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments + 1,
        };
      }
      return post;
    });
    await mutate(POSTS_KEY, postsStore, false);
  };

  return {
    posts: data || [],
    isLoading,
    error,
    createPost,
    toggleLike,
    toggleRepost,
    addComment,
  };
}

// Hook for notifications
export function useNotifications() {
  const { data, error, isLoading } = useSWR(NOTIFICATIONS_KEY, fetchNotifications, {
    fallbackData: mockNotifications,
  });

  const markAsRead = async (notificationId: string) => {
    notificationsStore = notificationsStore.map(notif => {
      if (notif.id === notificationId) {
        return { ...notif, isRead: true };
      }
      return notif;
    });
    await mutate(NOTIFICATIONS_KEY, notificationsStore, false);
  };

  const markAllAsRead = async () => {
    notificationsStore = notificationsStore.map(notif => ({
      ...notif,
      isRead: true,
    }));
    await mutate(NOTIFICATIONS_KEY, notificationsStore, false);
  };

  const unreadCount = data?.filter(n => !n.isRead).length || 0;

  return {
    notifications: data || [],
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
