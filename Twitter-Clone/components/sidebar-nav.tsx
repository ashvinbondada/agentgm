'use client';

import { Home, Search, Bell, Mail, User, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { currentUser } from '@/lib/mock-data';
import { useNotifications } from '@/lib/store';
import { cn } from '@/lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}

function NavItem({ icon, label, active, badge, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-full transition-colors w-full text-left',
        'hover:bg-secondary',
        active && 'font-bold'
      )}
    >
      <span className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span className="text-xl hidden xl:block">{label}</span>
    </button>
  );
}

interface SidebarNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SidebarNav({ activeTab, onTabChange }: SidebarNavProps) {
  const { unreadCount } = useNotifications();

  const navItems = [
    { id: 'home', icon: <Home size={26} />, label: 'Home' },
    { id: 'explore', icon: <Search size={26} />, label: 'Explore' },
    { id: 'notifications', icon: <Bell size={26} />, label: 'Notifications', badge: unreadCount },
    { id: 'messages', icon: <Mail size={26} />, label: 'Messages' },
    { id: 'profile', icon: <User size={26} />, label: 'Profile' },
    { id: 'more', icon: <MoreHorizontal size={26} />, label: 'More' },
  ];

  return (
    <nav className="flex flex-col h-full py-4 px-2">
      {/* Logo */}
      <div className="px-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xl font-bold text-primary-foreground">G</span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            badge={item.badge}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </div>

      {/* Post Button */}
      <Button 
        className="mt-4 rounded-full py-6 text-lg font-bold bg-primary hover:bg-primary/90"
        onClick={() => onTabChange('compose')}
      >
        <span className="hidden xl:block">Post</span>
        <span className="xl:hidden">+</span>
      </Button>

      {/* User Profile */}
      <div className="mt-auto">
        <button className="flex items-center gap-3 p-3 rounded-full hover:bg-secondary transition-colors w-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {currentUser.displayName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden xl:flex flex-col items-start">
            <span className="font-semibold text-sm">{currentUser.displayName}</span>
            <span className="text-muted-foreground text-sm">@{currentUser.username}</span>
          </div>
          <MoreHorizontal className="hidden xl:block ml-auto" size={18} />
        </button>
      </div>
    </nav>
  );
}
