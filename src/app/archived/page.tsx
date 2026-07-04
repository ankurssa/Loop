'use client';

import { useState } from 'react';
import { searchItems } from '@/data/mockData';
import { useFeedback } from '@/hooks/useFeedback';
import Topbar from '@/components/layout/Topbar';
import FeedbackCard from '@/components/board/FeedbackCard';
import { Archive, CheckCircle2 } from 'lucide-react';

export default function ArchivedPage() {
  const { items, updateStatus } = useFeedback();
  const [selectedProject, setSelectedProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const archivedItems = items.filter((item) => item.status === 'archived');

  const projectFiltered =
    selectedProject === 'all'
      ? archivedItems
      : archivedItems.filter((item) => item.project === selectedProject);

  const filteredItems = searchItems(projectFiltered, searchQuery);

  return (
    <>
      <Topbar
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        title="Archived Feedback (> 7 Days Resolved)"
      />
      <div className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
        {/* Virtus-style banner card */}
        <div className="mb-6 bg-dire-wolf border border-white/[0.06] rounded-2xl p-6 shadow-2xl flex items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white shadow-inner">
              <Archive size={24} className="text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Archived Feedback</h1>
              <p className="text-xs text-chestnut mt-1 max-w-xl leading-relaxed">
                Feedback items that have remained in the Resolved state for over 7 days are automatically moved here to keep the active board clean.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-bold text-status-nice shadow-sm">
            <CheckCircle2 size={16} />
            <span>{archivedItems.length} Archived Items</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-6">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <FeedbackCard
                  key={item.id}
                  item={item}
                  onStatusChange={updateStatus}
                />
              ))}
            </div>
          ) : (
            <div className="bg-dire-wolf border border-dashed border-white/[0.08] rounded-2xl p-16 text-center shadow-xl">
              <Archive size={36} className="mx-auto text-chestnut/40 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">No archived feedback found</h3>
              <p className="text-xs text-chestnut max-w-sm mx-auto leading-relaxed">
                {searchQuery || selectedProject !== 'all'
                  ? 'Try adjusting your search query or project filter to find what you are looking for.'
                  : 'Resolved items older than 7 days will appear here automatically.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
