'use client';

import { useState } from 'react';
import { FeedbackItem, FeedbackStatus } from '@/types';
import KanbanColumn from './KanbanColumn';

const statuses: FeedbackStatus[] = ['open', 'in_progress', 'resolved', 'wont_fix'];

interface KanbanBoardProps {
  items: FeedbackItem[];
  onStatusChange?: (id: string, newStatus: FeedbackStatus) => void;
}

export default function KanbanBoard({ items, onStatusChange }: KanbanBoardProps) {
  const [collapsedColumns, setCollapsedColumns] = useState<Record<FeedbackStatus, boolean>>({
    open: false,
    in_progress: false,
    resolved: false,
    wont_fix: false,
    archived: false,
  });

  const toggleCollapse = (status: FeedbackStatus) => {
    setCollapsedColumns((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  return (
    <div className="flex gap-5 overflow-x-auto pb-6 w-full min-h-[calc(100vh-160px)] items-stretch">
      {statuses.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          items={items.filter((item) => item.status === status)}
          onStatusChange={onStatusChange}
          isCollapsed={collapsedColumns[status]}
          onToggleCollapse={() => toggleCollapse(status)}
        />
      ))}
    </div>
  );
}
