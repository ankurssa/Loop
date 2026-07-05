'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  Archive,
  FileText,
  Settings,
  BarChart3,
} from 'lucide-react';
import { getStaleItems, getArchivedItems } from '@/data/mockData';
import { useFeedback } from '@/hooks/useFeedback';
import { useSettings } from '@/lib/settings';

export default function Sidebar() {
  const pathname = usePathname();
  const { items } = useFeedback();
  const settings = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const staleCount = getStaleItems(items, settings.staleThresholdDays).length;
  const archivedCount = getArchivedItems(items).length;

  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggle);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const analyticsNav = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  const primaryNav = [
    { href: '/board', label: 'Board', icon: LayoutDashboard },
    { href: '/needs-attention', label: 'Needs Attention', icon: AlertTriangle, count: staleCount, badgeClass: 'bg-status-blocking/20 text-status-blocking border border-status-blocking/30' },
    { href: '/archived', label: 'Archived', icon: Archive, count: archivedCount, badgeClass: 'bg-white/10 text-white border border-white/10' },
    { href: '/digest', label: 'Digest', icon: FileText },
  ];

  const secondaryNav = [
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container (Fixed on lg, Drawer on mobile) */}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] bg-sooty p-3 flex flex-col justify-between z-50 select-none transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <Link href="/board" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-sm tracking-tighter">L</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white font-sans">
              Loop<span className="text-accent">.</span>
            </span>
          </Link>
        </div>

        {/* Navigation Containers matching reference image */}
        <div className="flex flex-col justify-between flex-1 mt-3 gap-4">
          {/* Top Section: Analytics & Primary Nav Boxes */}
          <div className="space-y-3">
            {/* Box 1: Analytics / Dashboard Category */}
            <div className="bg-dire-wolf rounded-[24px] border border-white/[0.05] p-2 space-y-1 shadow-2xl shadow-black/40">
              {analyticsNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between p-1.5 pl-1.5 pr-3.5 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                      isActive
                        ? 'bg-accent text-white shadow-lg shadow-accent/25'
                        : 'text-chestnut hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                          isActive
                            ? 'bg-sooty text-white shadow-inner border border-black/20'
                            : 'text-chestnut group-hover:text-white'
                        }`}
                      >
                        <Icon size={17} />
                      </div>
                      <span className="font-bold text-xs tracking-wide">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Box 2: Primary Nav */}
            <div className="bg-dire-wolf rounded-[24px] border border-white/[0.05] p-2 space-y-1 shadow-2xl shadow-black/40">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between p-1.5 pl-1.5 pr-3.5 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                      isActive
                        ? 'bg-accent text-white shadow-lg shadow-accent/25'
                        : 'text-chestnut hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                          isActive
                            ? 'bg-sooty text-white shadow-inner border border-black/20'
                            : 'text-chestnut group-hover:text-white'
                        }`}
                      >
                        <Icon size={17} />
                      </div>
                      <span className="font-bold text-xs tracking-wide">{item.label}</span>
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg ${
                          isActive
                            ? 'bg-sooty text-white border border-black/20'
                            : 'bg-white/[0.08] text-neutral-300 border border-white/[0.05]'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Box: Secondary Nav */}
          <div className="bg-dire-wolf rounded-[24px] border border-white/[0.05] p-2 space-y-1 shadow-2xl shadow-black/40">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between p-1.5 pl-1.5 pr-3.5 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                    isActive
                      ? 'bg-accent text-white shadow-lg shadow-accent/25'
                      : 'text-chestnut hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                        isActive
                          ? 'bg-sooty text-white shadow-inner border border-black/20'
                          : 'text-chestnut group-hover:text-white'
                      }`}
                    >
                      <Icon size={17} />
                    </div>
                    <span className="font-bold text-xs tracking-wide">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
