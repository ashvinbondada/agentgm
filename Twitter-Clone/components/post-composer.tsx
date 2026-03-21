'use client';

import { useState, useRef } from 'react';
import { Image, Smile, CalendarDays, MapPin, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { currentUser } from '@/lib/mock-data';
import { usePosts } from '@/lib/store';
import { cn } from '@/lib/utils';

const MAX_LENGTH = 280;

export function PostComposer() {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { createPost } = usePosts();

  const handleSubmit = async () => {
    if (content.trim() && content.length <= MAX_LENGTH) {
      await createPost(content.trim());
      setContent('');
      setIsFocused(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const remainingChars = MAX_LENGTH - content.length;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars <= 20 && remainingChars >= 0;

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {currentUser.displayName.slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onFocus={() => setIsFocused(true)}
            placeholder="What's happening on the court?"
            className="w-full bg-transparent text-xl placeholder:text-muted-foreground resize-none outline-none min-h-[56px] max-h-[300px]"
            rows={1}
          />

          {isFocused && (
            <div className="flex items-center gap-1 py-2 border-b border-border text-primary text-sm">
              <Globe size={14} />
              <span>Everyone can reply</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
                <Image size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
                <Smile size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
                <CalendarDays size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
                <MapPin size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'text-sm',
                      isOverLimit && 'text-destructive',
                      isNearLimit && 'text-accent'
                    )}
                  >
                    {remainingChars}
                  </div>
                  <div className="w-px h-6 bg-border" />
                </div>
              )}
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isOverLimit}
                className="rounded-full px-5 font-bold bg-primary hover:bg-primary/90"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
