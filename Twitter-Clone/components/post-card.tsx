'use client';

import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, BadgeCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from '@/lib/format-time';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onComment: (postId: string) => void;
}

export function PostCard({ post, onLike, onRepost, onComment }: PostCardProps) {
  const formatContent = (content: string) => {
    // Highlight hashtags and mentions
    return content.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-primary hover:underline cursor-pointer">
            {word}
          </span>
        );
      }
      if (word.startsWith('@')) {
        return (
          <span key={index} className="text-primary hover:underline cursor-pointer">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <article className="border-b border-border px-4 py-4 hover:bg-secondary/30 transition-colors cursor-pointer">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={post.author.avatar} alt={post.author.displayName} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {post.author.displayName.slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold hover:underline truncate">
              {post.author.displayName}
            </span>
            {post.author.isVerified && (
              <BadgeCheck className="h-4 w-4 text-primary fill-primary" />
            )}
            <span className="text-muted-foreground">@{post.author.username}</span>
            <span className="text-muted-foreground">·</span>
            <time className="text-muted-foreground hover:underline">
              {formatDistanceToNow(post.timestamp)}
            </time>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto -mr-2 h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <MoreHorizontal size={16} />
            </Button>
          </div>

          {/* Post Content */}
          <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {formatContent(post.content)}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            {/* Comment */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComment(post.id);
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary group"
            >
              <span className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                <MessageCircle size={18} />
              </span>
              <span className="text-sm">{post.comments > 0 && post.comments}</span>
            </button>

            {/* Repost */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRepost(post.id);
              }}
              className={cn(
                'flex items-center gap-2 group',
                post.isReposted ? 'text-green-500' : 'text-muted-foreground hover:text-green-500'
              )}
            >
              <span className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 size={18} />
              </span>
              <span className="text-sm">{post.reposts > 0 && post.reposts}</span>
            </button>

            {/* Like */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(post.id);
              }}
              className={cn(
                'flex items-center gap-2 group',
                post.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              )}
            >
              <span className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                <Heart size={18} className={post.isLiked ? 'fill-current' : ''} />
              </span>
              <span className="text-sm">{post.likes > 0 && post.likes}</span>
            </button>

            {/* Share */}
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary group">
              <span className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                <Share size={18} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
