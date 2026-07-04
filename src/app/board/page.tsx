'use client';

import { useState } from 'react';
import { searchItems } from '@/data/mockData';
import { FeedbackStatus } from '@/types';
import { useFeedback } from '@/hooks/useFeedback';
import KanbanBoard from '@/components/board/KanbanBoard';
import Topbar from '@/components/layout/Topbar';

export default function BoardPage() {
  const { items, updateStatus } = useFeedback();
  const [selectedProject, setSelectedProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeItems = items.filter((item) => item.status !== 'archived');

  const projectFiltered =
    selectedProject === 'all'
      ? activeItems
      : activeItems.filter((item) => item.project === selectedProject);

  const filteredItems = searchItems(projectFiltered, searchQuery);

  return (
    <>
      <Topbar
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        title="Active Feedback Board"
      />
      <div className="flex-1 p-6 sm:p-8 overflow-hidden w-full max-w-none flex flex-col">
        <KanbanBoard items={filteredItems} onStatusChange={updateStatus} />
      </div>
    </>
  );
}
