import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  BookOpen,
  Home,
  Settings,
  Users,
  FileText,
  Trophy,
  Target
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles: ('admin' | 'user')[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    roles: ['admin', 'user']
  },
  {
    id: 'quiz',
    label: 'Take Quiz',
    icon: BookOpen,
    href: '/quiz',
    roles: ['user']
  },
  {
    id: 'performance',
    label: 'My Performance',
    icon: Trophy,
    href: '/performance',
    roles: ['user']
  },
  {
    id: 'questions',
    label: 'Manage Questions',
    icon: FileText,
    href: '/admin/questions',
    roles: ['admin']
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    href: '/admin/users',
    roles: ['admin']
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    href: '/admin/reports',
    roles: ['admin']
  },
  {
    id: 'skills',
    label: 'Skill Categories',
    icon: Target,
    href: '/admin/skills',
    roles: ['admin']
  }
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = sidebarItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-card border-r border-border h-full shadow-soft">
      <nav className="p-4">
        <ul className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};