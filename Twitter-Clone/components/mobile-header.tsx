'use client';

import { Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentUser } from '@/lib/mock-data';

interface MobileHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border md:hidden">
      <button onClick={onMenuClick} className="p-1">
        <Avatar className="h-8 w-8">
          <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {currentUser.displayName.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </button>
      
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        <span className="text-sm font-bold text-primary-foreground">G</span>
      </div>

      <button className="p-1 opacity-0 pointer-events-none">
        <Menu size={24} />
      </button>
    </header>
  );
}
