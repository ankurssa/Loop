'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X, Menu, Plus, Palette, LogOut } from 'lucide-react';
import AddFeedbackModal from '@/components/shared/AddFeedbackModal';

const projectOptions = [
  { value: 'all', label: 'All Projects' },
  { value: 'ITDR', label: 'ITDR' },
  { value: 'ISPM', label: 'ISPM' },
  { value: 'General', label: 'General' },
];

interface TopbarProps {
  selectedProject?: string;
  onProjectChange?: (project: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  title?: string;
  showControls?: boolean;
}

export default function Topbar({
  selectedProject = 'all',
  onProjectChange,
  searchQuery = '',
  onSearchChange,
  title = 'Feedback Board',
  showControls = true,
}: TopbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'jc-brand'>('dark');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const currentLabel = projectOptions.find((p) => p.value === selectedProject)?.label || 'All Projects';

  const toggleMobileMenu = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
  };

  return (
    <>
      <header className="h-16 border-b border-white/[0.06] bg-sooty/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 gap-4 sm:gap-6 w-full select-none">
        {/* Left: mobile menu button + page title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden w-9 h-9 rounded-xl bg-dire-wolf border border-white/[0.08] flex items-center justify-center text-white hover:border-accent transition-colors"
            title="Open Menu"
          >
            <Menu size={18} />
          </button>

          <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">{title}</h1>
        </div>

        {/* Center/Right controls & User Profile avatar (100% consistent placement across all pages!) */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 justify-end">
          {showControls && (
            <>
              {/* 1. Search Bar */}
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-chestnut pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  className="w-full bg-dire-wolf border border-white/[0.06] rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-white placeholder-chestnut/60 focus:border-accent focus:outline-none transition-all duration-200 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange && onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-chestnut hover:text-white transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* 2. Project Selector */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-dire-wolf border border-white/[0.06] text-xs font-bold text-white hover:border-white/20 transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="hidden sm:inline">{currentLabel}</span>
                  <span className="sm:hidden">{currentLabel.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`text-chestnut transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute top-full mt-2 right-0 w-48 bg-dire-wolf border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 p-1.5 space-y-1">
                      {projectOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            onProjectChange && onProjectChange(option.value);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                            selectedProject === option.value
                              ? 'bg-accent text-white shadow-md shadow-accent/20'
                              : 'text-chestnut hover:bg-white/[0.04] hover:text-white'
                          }`}
                        >
                          <span>{option.label}</span>
                          {selectedProject === option.value && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 3. Add feedback CTA */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-xs font-bold text-white transition-all shadow-lg shadow-accent/25 shrink-0 active:scale-95"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Feedback</span>
                <span className="sm:hidden">Add</span>
              </button>
            </>
          )}

          {/* 4. User Profile avatar (ALWAYS on the far right across ALL pages!) */}
          <div
            ref={profileMenuRef}
            className="relative shrink-0 pl-2.5 sm:pl-3 border-l border-white/[0.08]"
          >
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={`w-9 h-9 rounded-xl bg-dire-wolf border flex items-center justify-center text-xs font-bold text-white shadow-sm transition-all cursor-pointer group ${
                profileMenuOpen ? 'border-accent bg-white/[0.08]' : 'border-white/[0.1] hover:border-accent hover:bg-white/[0.06]'
              }`}
              title="User Profile (Ankur)"
            >
              <span className="group-hover:scale-105 transition-transform">AK</span>
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute top-full mt-2.5 right-0 w-64 bg-dire-wolf border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 p-2 animate-fade-in">
                {/* User Info Header */}
                <div className="px-3 py-2.5 border-b border-white/[0.08] mb-1.5 bg-sooty/50 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      AK
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">Ankur Kumar</p>
                      <p className="text-[10px] text-chestnut truncate">ankur@loop.design</p>
                    </div>
                  </div>
                </div>

                {/* Item 1: Theme Selector (Dark | JC Brand) */}
                <div className="px-2 py-2">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Palette size={14} className="text-accent" />
                      <span>Theme</span>
                    </span>
                    <span className="text-[10px] font-bold text-chestnut bg-sooty px-2 py-0.5 rounded-md border border-white/[0.06]">
                      {theme === 'dark' ? 'Dark' : 'JC Brand'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-sooty rounded-xl border border-white/[0.06]">
                    <button
                      onClick={() => {
                        setTheme('dark');
                        setProfileMenuOpen(false);
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                        theme === 'dark'
                          ? 'bg-[#E04F16] text-white shadow-md shadow-[#E04F16]/20'
                          : 'text-chestnut hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-white shrink-0 shadow-sm" />
                      <span className="truncate">Dark</span>
                    </button>

                    <button
                      onClick={() => {
                        setTheme('jc-brand');
                        setProfileMenuOpen(false);
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                        theme === 'jc-brand'
                          ? 'bg-[#41CFCB] text-[#0F172A] shadow-md shadow-[#41CFCB]/25'
                          : 'text-chestnut hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${theme === 'jc-brand' ? 'bg-[#0F172A]' : 'bg-white'}`} />
                      <span className="truncate">JC Brand</span>
                    </button>
                  </div>
                </div>

                {/* Item 2: Logout */}
                <div className="border-t border-white/[0.08] mt-1 pt-1">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      alert('Logged out successfully (Demo)');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-status-blocking hover:bg-status-blocking/10 transition-all text-left"
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Add Feedback Modal */}
      <AddFeedbackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultStatus="open"
        defaultProject={selectedProject}
      />
    </>
  );
}
