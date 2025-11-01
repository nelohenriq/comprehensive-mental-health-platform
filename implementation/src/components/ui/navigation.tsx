"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Home,
  Heart,
  Wind,
  Brain,
  Mic,
  User,
  Menu,
  X,
  AlertTriangle,
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
    name: "Voice Journal",
    href: "/dashboard/journal",
    icon: Mic,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn("hidden md:flex items-center space-x-6", className)}>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Navigation Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border md:hidden">
          <nav className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

interface HeaderProps {
  title?: string;
  children?: React.ReactNode;
}

export function Header({ title = "SereneMind", children }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">{title}</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Navigation />
          {children}
          <Button variant="destructive" size="sm" className="hidden md:flex">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Crisis Support
          </Button>
        </div>
      </div>
    </header>
  );
}
