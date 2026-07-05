'use client';

import { useState } from 'react';
import { FeedbackItem, FeedbackStatus } from '@/types';
import FeedbackCard from './FeedbackCard';
import AddFeedbackModal from '@/components/shared/AddFeedbackModal';
import { ChevronsLeft, ChevronsRight, Plus } from 'lucide-react';

const columnMeta: Record<FeedbackStatus, { label: string; accentClass: string; borderClass: string }> = {
  open: { label: 'Open', accentClass: 'bg-col-open shadow-[0_0_10px_rgba(224,79,22,0.6)]', borderClass: 'hover:border-col-open/40' },
  in_progress: { label: 'In Progress', accentClass: 'bg-col-progress shadow-[0_0_10px_rgba(78,154,241,0.6)]', borderClass: 'hover:border-col-progress/40' },
  resolved: { label: 'Resolved', accentClass: 'bg-col-resolved shadow-[0_0_10px_rgba(46,213,115,0.6)]', borderClass: 'hover:border-col-resolved/40' },
  wont_fix: { label: "Won't Fix", accentClass: 'bg-col-wontfix shadow-[0_0_10px_rgba(158,157,157,0.6)]', borderClass: 'hover:border-col-wontfix/40' },
  archived: { label: 'Archived', accentClass: 'bg-black-oak', borderClass: 'hover:border-white/20' },
};

interface KanbanColumnProps {
  status: FeedbackStatus;
  items: FeedbackItem[];
  onStatusChange?: (id: string, newStatus: FeedbackStatus) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function KanbanColumn({
  status,
  items,
  onStatusChange,
  isCollapsed = false,
  onToggleCollapse,
}: KanbanColumnProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const meta = columnMeta[status] || { label: status, accentClass: 'bg-black-oak', borderClass: 'hover:border-white/20' };

  const dropHandlers = onStatusChange
    ? {
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          setIsDragOver(true);
        },
        onDragLeave: (e: React.DragEvent) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          setIsDragOver(false);
          const id = e.dataTransfer.getData('text/plain');
          if (id) onStatusChange(id, status);
        },
      }
    : {};

  // ── COLLAPSED STATE ──
  if (isCollapsed) {
    return (
      <div
        onClick={onToggleCollapse}
        {...dropHandlers}
        className={`w-14 min-w-[56px] max-w-[56px] shrink-0 bg-dire-wolf/60 hover:bg-dire-wolf rounded-2xl border ${
          isDragOver ? 'border-accent bg-accent/10' : 'border-white/[0.06]'
        } ${meta.borderClass} transition-all duration-300 flex flex-col items-center py-5 gap-4 cursor-pointer select-none group shadow-lg`}
        title={`Expand ${meta.label} (${items.length})`}
      >
        {/* Accent dot */}
        <span className={`w-3 h-3 rounded-full shrink-0 ${meta.accentClass}`} />

        {/* Item count badge */}
        <span className="text-[10px] font-bold text-white bg-white/[0.08] border border-white/[0.1] px-2 py-0.5 rounded-full shrink-0 shadow-inner group-hover:bg-white/[0.15] transition-colors">
          {items.length}
        </span>

        {/* Vertical rotated label */}
        <div
          className="text-xs font-bold text-chestnut group-hover:text-white transition-colors tracking-widest uppercase py-4 flex-1 flex items-center justify-center"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {meta.label}
        </div>

        {/* Expand icon */}
        <div className="w-8 h-8 rounded-xl bg-white/[0.04] group-hover:bg-white/[0.1] border border-white/[0.06] flex items-center justify-center text-chestnut group-hover:text-white transition-all shrink-0">
          <ChevronsRight size={15} />
        </div>
      </div>
    );
  }

  // ── EXPANDED STATE (Full width responsive) ──
  return (
    <div
      {...dropHandlers}
      className={`flex flex-col min-w-[280px] flex-1 transition-all duration-300 rounded-2xl ${
        isDragOver ? 'bg-accent/[0.06] outline-2 outline-dashed outline-accent/50 outline-offset-4' : ''
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl bg-dire-wolf/40 border border-white/[0.04] hover:border-white/[0.08] transition-all select-none group">
        <div
          onClick={onToggleCollapse}
          className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
          title="Click to collapse category"
        >
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.accentClass}`} />
          <h2 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-accent transition-colors">
            {meta.label}
          </h2>
          <span className="text-xs font-bold text-white bg-white/[0.06] border border-white/[0.08] px-2.5 py-0.5 rounded-full shrink-0 shadow-sm">
            {items.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {/* Quick Add Button for this column */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAddModalOpen(true);
            }}
            className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-accent border border-white/[0.08] hover:border-accent flex items-center justify-center text-white transition-all shadow-sm hover:scale-105"
            title={`Add item directly to ${meta.label}`}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>

          {/* Collapse Button */}
          <div
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] flex items-center justify-center text-chestnut hover:text-white transition-colors cursor-pointer"
            title="Collapse column"
          >
            <ChevronsLeft size={14} />
          </div>
        </div>
      </div>

      {/* Cards container — stretches to fill vertical space */}
      <div
        className="flex flex-col gap-3.5 overflow-y-auto pr-1 pb-6 flex-1"
        style={{ maxHeight: 'calc(100vh - 180px)' }}
      >
        {items.map((item) => (
          <FeedbackCard key={item.id} item={item} onStatusChange={onStatusChange} draggable={Boolean(onStatusChange)} />
        ))}

        {items.length === 0 && (
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="flex flex-col items-center justify-center h-36 rounded-2xl border border-dashed border-white/[0.08] hover:border-accent/40 text-xs font-semibold text-chestnut bg-dire-wolf/40 hover:bg-dire-wolf/60 p-4 text-center cursor-pointer transition-all group/empty"
          >
            <div className="w-8 h-8 rounded-xl bg-white/[0.04] group-hover/empty:bg-accent/20 flex items-center justify-center mb-2 transition-colors">
              <Plus size={16} className="text-chestnut group-hover/empty:text-accent" />
            </div>
            <span className="group-hover/empty:text-white transition-colors">No items in {meta.label}</span>
            <span className="text-[10px] text-chestnut/60 font-normal mt-0.5">Click here to add one</span>
          </div>
        )}
      </div>

      {/* Column-specific Add Modal */}
      <AddFeedbackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultStatus={status}
      />
    </div>
  );
}
