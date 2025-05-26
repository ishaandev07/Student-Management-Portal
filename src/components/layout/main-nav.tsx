"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, UserPlus, FileText, LayoutDashboard } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';

const navItems = [
  { href: '/', label: 'Student Directory', icon: Users, exact: true },
  { href: '/enroll', label: 'Enroll Student', icon: UserPlus },
  { href: '/transcript-tool', label: 'Transcript Tool', icon: FileText },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                variant="default"
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                )}
                isActive={isActive}
                tooltip={{children: item.label, className: "bg-card text-card-foreground border-border"}}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
