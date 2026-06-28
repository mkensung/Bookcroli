import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, Book, Bookmark, Search, Bell, Settings, LogOut, User } from "lucide-react";
import { Input } from "@heroui/react";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  activeTab?: "overview" | "library" | "bookmark";
  onTabChange?: (tab: "overview" | "library" | "bookmark") => void;
}

export function Navbar({ activeTab = "library", onTabChange }: NavbarProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get initials from display name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const NavItem = ({ tab, icon: Icon, label }: { tab: "overview" | "library" | "bookmark", icon: any, label: string }) => {
    const isActive = activeTab === tab;
    const baseClasses = "flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-[var(--radius)] transition-all";
    const activeClasses = isActive 
      ? "bg-[var(--accent)] text-[var(--accent-foreground)]" 
      : "text-[var(--muted)] hover:bg-[var(--surface-secondary)]";
    
    if (onTabChange) {
      return (
        <button className={`${baseClasses} ${activeClasses}`} onClick={() => onTabChange(tab)}>
          <Icon className="w-4 h-4" /> {label}
        </button>
      );
    }

    return (
      <Link href={tab === 'overview' ? "/" : "/"} className={`${baseClasses} ${activeClasses}`}>
        <Icon className="w-4 h-4" /> {label}
      </Link>
    );
  };

  const BottomNavItem = ({ tab, icon: Icon, label }: { tab: "overview" | "library" | "bookmark", icon: any, label: string }) => {
    const isActive = activeTab === tab;
    
    const handleClick = () => {
      if (onTabChange) onTabChange(tab);
    };

    return (
      <button
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${
          isActive 
            ? "text-[var(--accent)]" 
            : "text-[var(--muted)]"
        }`}
        onClick={handleClick}
      >
        <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
        <span className={`text-[10px] font-bold tracking-wide ${isActive ? "text-[var(--accent)]" : ""}`}>{label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Top Navbar */}
      <div className="pt-6 px-4 sm:px-6 max-w-7xl mx-auto">
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-sm">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-[22px] tracking-tight text-[var(--foreground)] hover:opacity-80 transition-opacity">
            <img src="/Bookcroli_logo.svg" alt="Bookcroli Logo" className="h-[23px] w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavItem tab="overview" icon={LayoutGrid} label="Overview" />
            <NavItem tab="library" icon={Book} label="Library" />
            <NavItem tab="bookmark" icon={Bookmark} label="Bookmark" />
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:flex items-center w-[260px] h-10">
              <Search className="absolute left-3 w-4 h-4 text-[var(--muted)] z-10 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search books"
                className="w-full h-full pl-10 pr-4 bg-[var(--field-background)] text-[var(--field-foreground)] placeholder-[var(--field-placeholder)] rounded-[var(--field-radius)] outline-none focus:ring-2 focus:ring-transparent focus:border-[var(--focus)] transition-all font-medium border border-[var(--field-border)] text-sm"
              />
            </div>
            <button className="w-10 h-10 flex items-center justify-center border border-[var(--border)] rounded-[var(--radius)] bg-transparent hover:bg-[var(--surface-secondary)] transition-colors text-[var(--foreground)]">
              <Bell className="w-4 h-4" />
            </button>


            {/* User Avatar / Sign In */}
            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-[var(--accent)] transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold group-hover:opacity-90 transition-opacity">
                      {getInitials(user.displayName)}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-[240px] bg-[var(--overlay)] border border-[var(--border)] rounded-[var(--radius)] shadow-xl z-50 overflow-hidden">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-[var(--separator)]">
                      <p className="text-sm font-bold text-[var(--foreground)] truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 text-[var(--muted)]" />
                        Profile
                      </button>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4 text-[var(--muted)]" />
                        Settings
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[var(--separator)] py-1">
                      <button
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--danger)] hover:bg-[var(--surface-secondary)] transition-colors"
                        onClick={async () => {
                          await logout();
                          setShowUserMenu(false);
                          router.push('/login');
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </header>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-[var(--surface)]/95 backdrop-blur-xl border-t border-[var(--border)] px-6 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <BottomNavItem tab="overview" icon={LayoutGrid} label="Overview" />
            <BottomNavItem tab="library" icon={Book} label="Library" />
            <BottomNavItem tab="bookmark" icon={Bookmark} label="Bookmark" />
          </div>
        </div>
      </nav>
    </>
  );
}
