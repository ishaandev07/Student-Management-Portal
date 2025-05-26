"use client";

import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { MainNav } from './main-nav';
import { Logo } from '@/components/icons/logo';
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
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
        <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
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
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
