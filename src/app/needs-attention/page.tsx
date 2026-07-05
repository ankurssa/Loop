'use client';

import { useState } from 'react';
import { getStaleItems, getDaysSinceUpdate, searchItems, projects } from '@/data/mockData';
import { useFeedback } from '@/hooks/useFeedback';
import { useSettings } from '@/lib/settings';
import Badge from '@/components/ui/Badge';
import StatusIndicator from '@/components/shared/StatusIndicator';
import Topbar from '@/components/layout/Topbar';
import { Clock, Send } from 'lucide-react';

export default function NeedsAttentionPage() {
  const { items, updateItem } = useFeedback();
  const settings = useSettings();
  const [selectedProject, setSelectedProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const staleItems = getStaleItems(items, settings.staleThresholdDays);

  const projectFiltered =
    selectedProject === 'all'
      ? staleItems
      : staleItems.filter((item) => item.project === selectedProject);

  const filteredStaleItems = searchItems(projectFiltered, searchQuery);

  const handleSendNudge = (id: string) => {
    updateItem(id, { nudgeSent: true });
  };

  return (
    <>
      <Topbar
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        title="Needs Attention"
      />

      <div className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
        {/* Summary banner */}
        <div className="mb-6 bg-dire-wolf border border-white/[0.06] rounded-2xl p-6 shadow-2xl flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-bold text-white mb-1">Stale Items</h1>
            <p className="text-xs text-chestnut">
              {filteredStaleItems.length} item{filteredStaleItems.length !== 1 ? 's' : ''} haven&apos;t been updated in {settings.staleThresholdDays}+ days
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-status-minor/15 border border-status-minor/30 flex items-center justify-center text-status-minor font-bold text-sm">
            {filteredStaleItems.length}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pr-2 pb-6 flex flex-col gap-3">
          {filteredStaleItems.map((item) => {
            const project = projects.find((p) => p.name === item.project);
            const daysSinceUpdate = getDaysSinceUpdate(item.lastUpdated);

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-5 bg-dire-wolf rounded-2xl border border-white/[0.06] hover:border-white/20 transition-all shadow-xl"
              >
                <StatusIndicator severity={item.severity} />

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate mb-1.5">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="source"
                      label={item.source.charAt(0).toUpperCase() + item.source.slice(1)}
                      source={item.source}
                    />
                    {project && (
                      <Badge variant="project" label={project.name} color={project.color} />
                    )}
                    <span className="text-[11px] text-chestnut font-medium">
                      by {item.author}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-xl bg-sooty border border-white/[0.06]">
                  <Clock size={13} className="text-status-minor" />
                  <span className="text-xs font-bold text-status-minor">
                    {daysSinceUpdate}d stale
                  </span>
                </div>

                <div className="shrink-0 w-[130px] flex justify-end">
                  {item.nudgeSent ? (
                    <Badge variant="nudge" label="Nudge sent" />
                  ) : (
                    <button
                      onClick={() => handleSendNudge(item.id)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs font-bold text-chestnut hover:text-white hover:bg-white/[0.1] transition-all cursor-pointer"
                      title={`Send a Slack reminder to ${item.author}`}
                    >
                      <Send size={12} />
                      <span>Send nudge</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredStaleItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-dire-wolf rounded-2xl border border-dashed border-white/[0.08]">
              <div className="w-14 h-14 rounded-2xl bg-status-nice/15 border border-status-nice/30 flex items-center justify-center mb-4">
                <span className="text-status-nice text-2xl font-bold">✓</span>
              </div>
              <p className="text-base font-bold text-white">All caught up!</p>
              <p className="text-xs text-chestnut mt-1">
                {searchQuery || selectedProject !== 'all'
                  ? 'No stale items match your search or project filter.'
                  : 'No stale items right now.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
