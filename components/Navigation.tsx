'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { useProfile } from '@/lib/profile-context';

export function Navigation() {
  const pathname = usePathname();
  const { profile, logout } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/', emoji: '🏠' },
    { label: 'Transform', href: '/transform', emoji: '✨' },
    { label: 'Learn', href: '/learn', emoji: '📖' },
    { label: 'Educator', href: '/educator', emoji: '🤖' },
    { label: 'Progress', href: '/progress', emoji: '📊' },
    { label: 'Dashboard', href: '/dashboard', emoji: '👁' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className="sticky top-0 z-50 nav-glass transition-shadow duration-300"
      style={{ boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg animate-pulse-glow transition-transform group-hover:scale-110"
              style={{ background: 'linear-gradient(135deg, #7c5bf9, #00d4ff)' }}
            >
              🧠
            </div>
            <span
              className="font-bold text-xl gradient-text tracking-tight hidden sm:block"
            >
              NeuroLearn
            </span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive(item.href)
                    ? 'text-white'
                    : 'text-[#8888b0] hover:text-white hover:bg-white/5'
                  }
                `}
                style={isActive(item.href) ? {
                  background: 'linear-gradient(135deg, rgba(124,91,249,0.25), rgba(0,212,255,0.15))',
                  border: '1px solid rgba(124,91,249,0.35)',
                } : {}}
              >
                <span className="text-base leading-none">{item.emoji}</span>
                {item.label}
                {isActive(item.href) && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 rounded-full"
                    style={{ background: 'linear-gradient(90deg, #7c5bf9, #00d4ff)' }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!profile ? (
              <Link
                href="/onboarding"
                className="glow-btn text-sm py-2 px-4"
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}
              >
                Get Started →
              </Link>
            ) : (
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#8888b0] hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 border border-transparent hover:border-red-400/30"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>

          {/* ── Mobile menu btn ── */}
          <button
            className="md:hidden p-2 rounded-lg text-[#8888b0] hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {isOpen && (
          <div
            className="md:hidden pb-4 pt-2 space-y-1 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)', animation: 'fadeInDown 0.2s ease' }}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${isActive(item.href)
                    ? 'text-white bg-violet-600/20 border border-violet-500/30'
                    : 'text-[#8888b0] hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <span>{item.emoji}</span>
                {item.label}
              </Link>
            ))}
            <div className="pt-2">
              {!profile ? (
                <Link
                  href="/onboarding"
                  onClick={() => setIsOpen(false)}
                  className="glow-btn w-full justify-center text-sm"
                  style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                >
                  🚀 Get Started
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 w-full px-3 py-3 rounded-lg text-sm font-medium text-red-400 bg-red-400/10 border border-red-400/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
