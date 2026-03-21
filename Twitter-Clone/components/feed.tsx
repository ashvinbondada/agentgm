'use client';

import { usePosts } from '@/lib/store';
import { PostCard } from './post-card';
import { PostComposer } from './post-composer';
import { Spinner } from '@/components/ui/spinner';

interface FeedProps {
  showComposer?: boolean;
}

export function Feed({ showComposer = true }: FeedProps) {
  const { posts, isLoading, toggleLike, toggleRepost, addComment } = usePosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div>
      {showComposer && (
        <div className="border-b border-border">
          <PostComposer />
        </div>
      )}
      
      <div>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={toggleLike}
            onRepost={toggleRepost}
            onComment={addComment}
          />
        ))}
      </div>
    </div>
  );
}
