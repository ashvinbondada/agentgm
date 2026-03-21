'use client';

import { Heart, MessageCircle, Repeat2, UserPlus, AtSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/lib/store';
import { Notification } from '@/lib/types';
import { formatDistanceToNow } from '@/lib/format-time';
import { cn } from '@/lib/utils';

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const iconMap = {
    like: <Heart className="h-5 w-5 text-red-500 fill-red-500" />,
    comment: <MessageCircle className="h-5 w-5 text-primary" />,
    repost: <Repeat2 className="h-5 w-5 text-green-500" />,
    follow: <UserPlus className="h-5 w-5 text-primary" />,
    mention: <AtSign className="h-5 w-5 text-primary" />,
  };
  return iconMap[type];
}

function getNotificationText(notif: Notification): string {
  const texts = {
    like: 'liked your post',
    comment: 'commented on your post',
    repost: 'reposted your post',
    follow: 'followed you',
    mention: 'mentioned you',
  };
  return texts[notif.type];
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

function NotificationItem({ notification, onRead }: NotificationItemProps) {
  return (
    <button
      onClick={() => onRead(notification.id)}
      className={cn(
        'flex gap-3 p-4 w-full text-left hover:bg-secondary/50 transition-colors border-b border-border',
        !notification.isRead && 'bg-primary/5'
      )}
    >
      <div className="flex-shrink-0 mt-1">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.actor.avatar} alt={notification.actor.displayName} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {notification.actor.displayName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="font-bold truncate">{notification.actor.displayName}</span>
          <span className="text-muted-foreground text-sm">
            {formatDistanceToNow(notification.timestamp)}
          </span>
        </div>
        <p className="text-muted-foreground mt-1">
          {getNotificationText(notification)}
        </p>
        {notification.postContent && (
          <p className="text-muted-foreground mt-1 text-sm truncate">
            {notification.postContent}
          </p>
        )}
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </button>
  );
}

export function NotificationsPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-bold">Notifications</h2>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-primary hover:text-primary/80"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div>
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
}
