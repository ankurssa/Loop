'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchItems, statusLabels } from '@/data/mockData';
import { useFeedback } from '@/hooks/useFeedback';
import KanbanBoard from '@/components/board/KanbanBoard';
import Topbar from '@/components/layout/Topbar';
import { Filter, X, Undo2, CheckCircle2 } from 'lucide-react';
import { FeedbackStatus } from '@/types';

interface UndoAction {
  id: string;
  title: string;
  fromStatus: FeedbackStatus;
  toStatus: FeedbackStatus;
  timestamp: number;
}

function BoardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items, updateStatus } = useFeedback();
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  // Auto-dismiss floating footer after 6 seconds
  useEffect(() => {
    if (!undoAction) return;
    const timer = setTimeout(() => {
      setUndoAction(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [undoAction]);

  const handleStatusChangeWithUndo = useCallback(
    (id: string, newStatus: FeedbackStatus) => {
      const item = items.find((i) => i.id === id);
      if (!item || item.status === newStatus) return;

      const prevStatus = item.status;
      updateStatus(id, newStatus);

      setUndoAction({
        id,
        title: item.title,
        fromStatus: prevStatus,
        toStatus: newStatus,
        timestamp: Date.now(),
      });
    },
    [items, updateStatus]
  );

  const handleUndo = () => {
    if (!undoAction) return;
    updateStatus(undoAction.id, undoAction.fromStatus);
    setUndoAction(null);
  };

  const paramProject = searchParams.get('project') || 'all';
  const paramSeverity = searchParams.get('severity') || null;
  const paramTechnical = searchParams.get('technical') === 'true';
  const paramSearch = searchParams.get('search') || '';

  // Project filter lives in the URL — derived, not mirrored into state
  const selectedProject = paramProject;
  const [searchQuery, setSearchQuery] = useState(paramSearch);

  // Keep search shareable: debounce local input into the URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const current = params.get('search') || '';
      if (current === searchQuery) return;
      if (searchQuery) params.set('search', searchQuery);
      else params.delete('search');
      router.replace(`/board?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, router]);

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
        <KanbanBoard items={filteredItems} onStatusChange={handleStatusChangeWithUndo} />
      </div>

      {/* Timed Floating Footer with Undo Option (Centered to main board area) */}
      {undoAction && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-slide-up max-w-xl w-[90%] sm:w-auto">
          <div className="bg-dire-wolf border border-white/[0.12] rounded-2xl p-4 shadow-2xl shadow-black/80 flex items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
            {/* Left side: Icon + Message */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center border border-accent/20 shrink-0 shadow-sm">
                <CheckCircle2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[280px]">
                  {undoAction.title}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-chestnut font-medium mt-0.5">
                  <span>Moved to</span>
                  <strong className="text-white bg-white/[0.08] px-1.5 py-0.5 rounded text-[10px]">
                    {statusLabels[undoAction.toStatus]}
                  </strong>
                </div>
              </div>
            </div>

            {/* Right side: Undo Button + Close */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-extrabold transition-all duration-200 shadow-lg shadow-accent/25 hover:scale-105 cursor-pointer"
                title="Undo this action"
              >
                <Undo2 size={14} />
                <span>Undo</span>
              </button>
              <button
                onClick={() => setUndoAction(null)}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-chestnut hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>

            {/* Timed Progress Bar at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/[0.06]">
              <div
                key={undoAction.timestamp}
                className="h-full bg-accent animate-shrink-width"
                style={{
                  animationDuration: '6s',
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards',
                }}
              />
            </div>
          </div>
        </div>
      )}
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
