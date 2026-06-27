import React from "react";
import Link from "next/link";
import { LayoutGrid, Book, Bookmark, Search, Bell, Settings } from "lucide-react";

interface NavbarProps {
  activeTab?: "overview" | "library" | "bookmark";
  onTabChange?: (tab: "overview" | "library" | "bookmark") => void;
}

export function Navbar({ activeTab = "library", onTabChange }: NavbarProps) {
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

  return (
    <div className="pt-6 px-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between px-6 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-[22px] tracking-tight text-[var(--foreground)] hover:opacity-80 transition-opacity">
          <img src="/Bookcroli_logo.svg" alt="Bookcroli Logo" className="h-[23px] w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavItem tab="overview" icon={LayoutGrid} label="Overview" />
          <NavItem tab="library" icon={Book} label="Library" />
          <NavItem tab="bookmark" icon={Bookmark} label="Bookmark" />
        </nav>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:flex items-center w-[260px] h-10 text-[var(--muted)]">
            <Search className="absolute left-3 w-4 h-4" />
            <input type="text" placeholder="Search books" className="w-full h-full pl-10 pr-4 text-sm bg-[var(--field-background)] border border-[var(--field-border)] rounded-[var(--field-radius)] outline-none focus:border-[var(--focus)] transition-all text-[var(--field-foreground)] placeholder-[var(--field-placeholder)]" />
          </div>
          <button className="w-10 h-10 flex items-center justify-center border border-[var(--border)] rounded-[var(--radius)] bg-transparent hover:bg-[var(--surface-secondary)] transition-colors text-[var(--foreground)]">
            <Bell className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-[var(--border)] rounded-[var(--radius)] bg-transparent hover:bg-[var(--surface-secondary)] transition-colors text-[var(--foreground)]">
            <Settings className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity">
            MK
          </div>
        </div>
      </header>
    </div>
  );
}
