
"use client";

import type { ReactNode } from 'react';
import * as React from 'react'; // Import React for useEffect
import { usePathname, useRouter } from 'next/navigation'; // For route checking and redirection
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { MainNav } from './main-nav';
import { Logo } from '@/components/icons/logo';
import { Toaster } from "@/components/ui/toaster";
import { useAuthStore } from '@/lib/auth-store'; // Auth store
import { Loader2 } from 'lucide-react'; // Loading spinner

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading, checkAuth, currentUser } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    checkAuth(); // Check authentication status on initial load
  }, [checkAuth]);


  React.useEffect(() => {
    if (!isLoading) { // Only perform redirects after initial auth check is complete
      const authRoutes = ['/login', '/register'];
      const isAuthRoute = authRoutes.includes(pathname);

      if (!isAuthenticated && !isAuthRoute) {
        router.replace('/login');
      }
      if (isAuthenticated && isAuthRoute) {
        router.replace('/');
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading Student Hub...</p>
      </div>
    );
  }

  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  // If redirect is pending (e.g., unauthenticated on protected route, or authenticated on auth route)
  if ((!isAuthenticated && !isAuthRoute) || (isAuthenticated && isAuthRoute)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg">Verifying session...</p>
      </div>
    );
  }
  
  // If not authenticated and on an auth route (login/register), show simple layout
  if (!isAuthenticated && isAuthRoute) {
    return (
      <>
        <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4 md:p-6">
          {children}
        </main>
        <Toaster />
      </>
    );
  }

  // Authenticated user on a protected route: Render full layout
  if (isAuthenticated && !isAuthRoute) {
    return (
      <SidebarProvider defaultOpen>
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border">
          <SidebarHeader className="p-4 flex items-center gap-2">
            <Logo className="w-8 h-8 text-sidebar-primary" />
            <h1 className="text-2xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Student Hub
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
          <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden text-center">
            {currentUser && (
                <p className="text-xs text-sidebar-foreground/80 mb-1">Logged in as: {currentUser.username}</p>
            )}
            <p className="text-xs text-sidebar-foreground/70">&copy; 2024 Student Hub</p>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="flex items-center md:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1">
              {/* Placeholder for breadcrumbs or page title if needed */}
            </div>
            {/* You could add a user menu button here too */}
          </header>
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    );
  }
  
  // Fallback for any other unexpected state (should ideally not be reached)
   return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg">An unexpected error occurred.</p>
      </div>
    );
}
