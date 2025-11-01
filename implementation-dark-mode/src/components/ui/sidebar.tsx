"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Heart,
  Wind,
  Brain,
  Mic,
  AlertTriangle,
  Settings,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Mood Tracker",
    href: "/dashboard/mood",
    icon: Heart,
  },
  {
    name: "Breathing",
    href: "/dashboard/breathing",
    icon: Wind,
  },
  {
    name: "CBT Tools",
    href: "/dashboard/cbt",
    icon: Brain,
  },
  {
    name: "Journal",
    href: "/dashboard/journal",
    icon: Mic,
  },
  {
    name: "AI Chat",
    href: "/dashboard/ai",
    icon: Brain,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Crisis Support",
    href: "/dashboard/crisis",
    icon: AlertTriangle,
    isEmergency: true,
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r border-border z-40",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const isEmergency = item.isEmergency;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? isEmergency
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-primary text-primary-foreground"
                    : isEmergency
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}