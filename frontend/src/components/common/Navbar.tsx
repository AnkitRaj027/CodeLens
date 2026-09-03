"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CommandPalette } from "./CommandPalette";
import { 
  Code2, 
  Terminal, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  History, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Search,
  Menu,
  X
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: "IDE Analyzer", href: "/analyzer", icon: Terminal },
    { name: "History", href: "/history", icon: History },
    { name: "Curriculum", href: "/learn", icon: BookOpen },
    { name: "Practice Arena", href: "/practice", icon: CheckCircle2 },
    { name: "Algorithms", href: "/algorithms", icon: Layers },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo & Live Engine Status */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-7 h-7 rounded-md bg-[#18181B] border border-[#27272A] text-[#F4F4F5] flex items-center justify-center group-hover:border-blue-500/50 group-hover:text-blue-400 transition-colors">
                  <Code2 className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm tracking-tight text-[#F4F4F5] code-font">
                    CodeLens
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] code-font font-medium bg-[#111113] border border-[#27272A] text-[#71717A]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    AST ENGINE
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#18181B] text-[#F4F4F5] border border-[#27272A]"
                        : "text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#111113] border border-transparent"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-[#71717A]"}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Search Trigger & Auth CTA */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Command Palette Trigger */}
              <button
                onClick={() => setPaletteOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#111113] hover:bg-[#18181B] border border-[#27272A] text-xs text-[#71717A] hover:text-[#A1A1AA] transition-all"
              >
                <Search className="w-3.5 h-3.5 text-[#71717A]" />
                <span className="text-[11px]">Search...</span>
                <kbd className="px-1 py-0.2 text-[9px] code-font text-[#71717A] bg-[#18181B] border border-[#27272A] rounded">
                  Ctrl K
                </kbd>
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111113] border border-[#27272A] text-xs text-[#F4F4F5]">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span className="truncate max-w-[110px] text-[11px] font-medium">{user.full_name || user.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-md text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className="px-3 py-1 rounded-md text-xs font-medium text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#111113] transition-colors border border-transparent"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1 rounded-md text-xs font-medium bg-[#F4F4F5] text-[#09090B] hover:bg-white transition-all shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions: Quick Search Trigger + Menu Button */}
            <div className="md:hidden flex items-center gap-1.5">
              <button
                onClick={() => setPaletteOpen(true)}
                aria-label="Search"
                className="p-2 rounded-md text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#18181B] active:bg-[#202024] transition-colors"
              >
                <Search className="w-4 h-4 text-[#A1A1AA]" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                className="p-2 rounded-md text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#18181B] active:bg-[#202024] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#27272A] bg-[#09090B]/98 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Mobile Search Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setPaletteOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#111113] border border-[#27272A] text-xs text-[#71717A] hover:text-[#A1A1AA] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#71717A]" />
                <span>Search algorithms, lessons, IDE...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] code-font text-[#71717A] bg-[#18181B] border border-[#27272A] rounded">
                Ctrl K
              </kbd>
            </button>

            {/* Mobile Nav Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#18181B] text-[#F4F4F5] border border-[#27272A]"
                        : "text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#111113]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-[#71717A]"}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth & User Profile Section */}
            <div className="pt-3 border-t border-[#27272A]">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#F4F4F5] truncate">
                          {user.full_name || user.email}
                        </p>
                        <p className="text-[10px] text-[#71717A] truncate font-mono">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-[#F4F4F5] bg-[#111113] border border-[#27272A] transition-colors text-center"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2 px-3 rounded-lg text-xs font-medium bg-[#F4F4F5] text-[#09090B] hover:bg-white transition-all text-center shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Global Command Palette */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
};
