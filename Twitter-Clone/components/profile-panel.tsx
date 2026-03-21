'use client';

import { CalendarDays, MapPin, Link as LinkIcon, BadgeCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { currentUser, mockPosts } from '@/lib/mock-data';
import { PostCard } from './post-card';
import { usePosts } from '@/lib/store';

export function ProfilePanel() {
  const { toggleLike, toggleRepost, addComment } = usePosts();
  const userPosts = mockPosts.filter(post => post.author.id === currentUser.id);

  return (
    <div>
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-br from-primary/40 to-accent/40" />

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-border">
        <div className="flex justify-between items-start -mt-16 mb-4">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
              {currentUser.displayName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            className="rounded-full mt-20 font-bold border-border hover:bg-secondary"
          >
            Edit profile
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{currentUser.displayName}</h1>
            {currentUser.isVerified && (
              <BadgeCheck className="h-5 w-5 text-primary fill-primary" />
            )}
          </div>
          <p className="text-muted-foreground">@{currentUser.username}</p>
        </div>

        <p className="mb-4">{currentUser.bio}</p>

        <div className="flex flex-wrap gap-4 text-muted-foreground text-sm mb-4">
          <span className="flex items-center gap-1">
            <MapPin size={16} />
            Los Angeles, CA
          </span>
          <span className="flex items-center gap-1">
            <LinkIcon size={16} />
            <a href="#" className="text-primary hover:underline">ggmbasketball.com</a>
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={16} />
            Joined March 2024
          </span>
        </div>

        <div className="flex gap-4">
          <button className="hover:underline">
            <span className="font-bold">{currentUser.following.toLocaleString()}</span>
            <span className="text-muted-foreground"> Following</span>
          </button>
          <button className="hover:underline">
            <span className="font-bold">{currentUser.followers.toLocaleString()}</span>
            <span className="text-muted-foreground"> Followers</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {['Posts', 'Replies', 'Media', 'Likes'].map((tab, index) => (
          <button
            key={tab}
            className={`flex-1 py-4 text-center font-medium hover:bg-secondary/50 transition-colors ${
              index === 0 ? 'border-b-4 border-primary font-bold' : 'text-muted-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* User's Posts */}
      <div>
        {userPosts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No posts yet
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={toggleLike}
              onRepost={toggleRepost}
              onComment={addComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
