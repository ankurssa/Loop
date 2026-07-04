'use client';

import { useState } from 'react';
import { FeedbackItem, FeedbackStatus, Severity } from '@/types';
import { projects, getRelativeTime, statusLabels } from '@/data/mockData';
import Badge from '@/components/ui/Badge';
import Toggle from '@/components/ui/Toggle';
import StatusIndicator from '@/components/shared/StatusIndicator';
import { ChevronDown } from 'lucide-react';

interface FeedbackCardProps {
  item: FeedbackItem;
  onStatusChange?: (id: string, newStatus: FeedbackStatus) => void;
}

const allStatuses: FeedbackStatus[] = ['open', 'in_progress', 'resolved', 'wont_fix', 'archived'];

export default function FeedbackCard({ item, onStatusChange }: FeedbackCardProps) {
  const [showTranslated, setShowTranslated] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const project = projects.find((p) => p.name === item.project);
  const translatedText = item.translatedDescription || (item as any).translatedText;
  const rawText = item.description || (item as any).rawText || translatedText || 'No description provided.';
  const description = showTranslated && translatedText ? translatedText : rawText;

  return (
    <div className="group relative bg-dire-wolf rounded-2xl border border-white/[0.06] p-4 hover:border-white/20 transition-all duration-200 hover:shadow-2xl hover:shadow-black/50">
      {/* Top row: severity indicator + duplicate badge + status selector */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <StatusIndicator severity={item.severity} showLabel />
          {item.isDuplicate && (
            <Badge variant="duplicate" label="Duplicate?" />
          )}
        </div>

        {/* Status Change Dropdown — Virtus pill style */}
        {onStatusChange && (
          <div className="relative">
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/[0.06] hover:bg-white/[0.1] px-2.5 py-1 rounded-full transition-all border border-white/[0.08]"
              title="Change status"
            >
              <span>{statusLabels[item.status]}</span>
              <ChevronDown size={11} className={`text-chestnut transition-transform duration-150 ${statusMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {statusMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setStatusMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-dire-wolf border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 p-1 space-y-0.5">
                  <div className="px-3 py-1.5 text-[9px] font-bold text-chestnut uppercase tracking-wider border-b border-white/[0.06]">
                    Move to status
                  </div>
                  {allStatuses.map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onStatusChange(item.id, st);
                        setStatusMenuOpen(false);
                      }}
                      disabled={st === item.status}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                        st === item.status
                          ? 'bg-accent text-white cursor-default shadow-sm shadow-accent/20'
                          : 'text-chestnut hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      <span>{statusLabels[st]}</span>
                      {st === item.status && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-white leading-snug mb-2 line-clamp-2">
        {item.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-chestnut leading-relaxed mb-4 line-clamp-3 font-normal">
        {description}
      </p>

      {/* Technical toggle */}
      {(item.isTechnical !== false) && translatedText && translatedText !== rawText && (
        <div className="mb-4">
          <Toggle
            options={['Original', 'Translated']}
            active={showTranslated ? 1 : 0}
            onChange={(i) => setShowTranslated(i === 1)}
          />
        </div>
      )}

      {/* Footer: badges + meta */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Badge variant="source" label={item.source.charAt(0).toUpperCase() + item.source.slice(1)} source={item.source} />
          {project && (
            <Badge variant="project" label={project.name} color={project.color} />
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-white font-semibold truncate max-w-[80px]">{item.author.split(' ')[0]}</span>
          <span className="text-[10px] text-black-oak">·</span>
          <span className="text-[10px] text-chestnut font-medium">{getRelativeTime(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
