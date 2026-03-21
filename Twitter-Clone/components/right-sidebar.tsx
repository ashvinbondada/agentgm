'use client';

import { Search, BadgeCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trendingTopics, suggestedUsers } from '@/lib/mock-data';

export function RightSidebar() {
  return (
    <div className="flex flex-col gap-4 py-4 px-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search GGM"
          className="w-full bg-secondary rounded-full py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
        />
      </div>

      {/* Trending */}
      <Card className="bg-secondary border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Trending in Basketball</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {trendingTopics.map((topic, index) => (
            <button
              key={topic.tag}
              className="w-full text-left px-4 py-3 hover:bg-background/50 transition-colors"
            >
              <div className="text-xs text-muted-foreground">
                {index + 1} · Trending
              </div>
              <div className="font-bold">#{topic.tag}</div>
              <div className="text-sm text-muted-foreground">{topic.posts} posts</div>
            </button>
          ))}
          <button className="w-full text-left px-4 py-3 text-primary hover:bg-background/50 transition-colors">
            Show more
          </button>
        </CardContent>
      </Card>

      {/* Who to Follow */}
      <Card className="bg-secondary border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-background/50 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {user.displayName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-bold truncate">{user.displayName}</span>
                  {user.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground truncate">
                  @{user.username}
                </div>
              </div>
              <Button
                size="sm"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold"
              >
                Follow
              </Button>
            </div>
          ))}
          <button className="w-full text-left px-4 py-3 text-primary hover:bg-background/50 transition-colors">
            Show more
          </button>
        </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="text-xs text-muted-foreground px-4 flex flex-wrap gap-2">
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Cookie Policy</a>
        <a href="#" className="hover:underline">Accessibility</a>
        <span>© 2026 GGM Basketball</span>
      </div>
    </div>
  );
}
