
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter
import { Users, UserPlus, FileText, LogOut } from 'lucide-react'; // Added LogOut

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
// Logo import removed as it's not used here directly
import { useAuthStore } from '@/lib/auth-store'; // Import auth store

const navItemsBase = [
  { href: '/', label: 'Student Directory', icon: Users, exact: true },
  { href: '/enroll', label: 'Enroll Student', icon: UserPlus },
  { href: '/transcript-tool', label: 'Transcript Tool', icon: FileText },
];

export function MainNav() {
  const pathname = usePathname();
  const { isAuthenticated, logout } // Get auth state and logout action
    = useAuthStore(); 
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login'); // Redirect to login after logout
  };

  // If not authenticated, MainNav might not be rendered by AppLayout,
  // but this check ensures it doesn't show items if it were.
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <SidebarMenu>
      {navItemsBase.map((item) => {
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
      {/* Logout Button */}
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="ghost" // Using ghost for a less prominent logout, or use "default"
          className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
          tooltip={{children: "Logout", className: "bg-card text-card-foreground border-border"}}
        >
          <LogOut className="h-5 w-5" />
          <span className="truncate">Logout</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
