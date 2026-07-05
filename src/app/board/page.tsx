'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchItems } from '@/data/mockData';
import { FeedbackStatus } from '@/types';
import { useFeedback } from '@/hooks/useFeedback';
import KanbanBoard from '@/components/board/KanbanBoard';
import Topbar from '@/components/layout/Topbar';
import { Filter, X } from 'lucide-react';

function BoardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, updateStatus } = useFeedback();

  const paramProject = searchParams.get('project') || 'all';
  const paramSeverity = searchParams.get('severity') || null;
  const paramTechnical = searchParams.get('technical') === 'true';
  const paramSearch = searchParams.get('search') || '';

  const [selectedProject, setSelectedProject] = useState(paramProject);
  const [searchQuery, setSearchQuery] = useState(paramSearch);

  // Sync state if URL searchParams change
  useEffect(() => {
    if (paramProject) setSelectedProject(paramProject);
    if (paramSearch !== null) setSearchQuery(paramSearch);
  }, [paramProject, paramSearch]);

  const activeItems = items.filter((item) => item.status !== 'archived');

  // Filter by project
  const projectFiltered =
    selectedProject === 'all'
      ? activeItems
      : activeItems.filter((item) => item.project === selectedProject);

  // Filter by severity or technical if present from URL
  const categoryFiltered = projectFiltered.filter((item) => {
    if (paramSeverity) {
      return item.severity === paramSeverity;
    }
    if (paramTechnical) {
      return item.isTechnical;
    }
    return true;
  });

  const filteredItems = searchItems(categoryFiltered, searchQuery);

  const clearCategoryFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('severity');
    params.delete('technical');
    router.push(`/board?${params.toString()}`);
  };

  const handleProjectChange = (proj: string) => {
    setSelectedProject(proj);
    const params = new URLSearchParams(searchParams.toString());
    if (proj === 'all') params.delete('project');
    else params.set('project', proj);
    router.push(`/board?${params.toString()}`);
  };

  return (
    <>
      <Topbar
        selectedProject={selectedProject}
        onProjectChange={handleProjectChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        title="Active Feedback Board"
      />

      {/* Active Category/Severity Filter Banner if filtered from Dashboard */}
      {(paramSeverity || paramTechnical) && (
        <div className="px-6 sm:px-8 pt-4 pb-0 flex items-center gap-3 animate-fade-in">
          <div className="flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-sm">
            <Filter size={13} className="text-accent" />
            <span>
              Active Category Filter:{' '}
              <strong className="text-white underline ml-1">
                {paramSeverity === 'blocking' && 'Blocking / Critical UI'}
                {paramSeverity === 'minor' && 'Minor UX Enhancement'}
                {paramSeverity === 'nice_to_have' && 'Nice to Have / Polish'}
                {paramTechnical && 'Technical Architecture'}
              </strong>
            </span>
            <button
              onClick={clearCategoryFilter}
              className="hover:bg-accent/30 p-1 rounded-lg text-white transition-colors ml-2 cursor-pointer flex items-center justify-center"
              title="Clear Filter"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 sm:p-8 overflow-hidden w-full max-w-none flex flex-col">
        <KanbanBoard items={filteredItems} onStatusChange={updateStatus} />
      </div>
    </>
  );
}

export default function BoardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 bg-sooty flex items-center justify-center text-white font-bold text-sm">
          Loading Board...
        </div>
      }
    >
      <BoardContent />
    </Suspense>
  );
}
