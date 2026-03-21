'use client';

import { Home, Search, Bell, Mail, Plus } from 'lucide-react';
import { useNotifications } from '@/lib/store';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const { unreadCount } = useNotifications();

  const navItems = [
    { id: 'home', icon: Home },
    { id: 'explore', icon: Search },
    { id: 'compose', icon: Plus, isAction: true },
    { id: 'notifications', icon: Bell, badge: unreadCount },
    { id: 'messages', icon: Mail },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'relative p-3 rounded-full transition-colors',
                item.isAction
                  ? 'bg-primary text-primary-foreground'
                  : activeTab === item.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={24} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
