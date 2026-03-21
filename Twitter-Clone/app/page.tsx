'use client';

import { Feed } from '@/components/feed';
import { PostComposer } from '@/components/post-composer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <main className="w-full max-w-2xl border-r border-border">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold">Home</h1>
          </div>
        </header>

        {/* Composer */}
        <div className="border-b border-border">
          <PostComposer />
        </div>

        {/* Feed */}
        <Feed showComposer={false} />
      </main>
    </div>
  );
}
