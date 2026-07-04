'use client';

import { useState } from 'react';
import { getDigestData, getDaysSinceUpdate, searchItems, projects } from '@/data/mockData';
import { useFeedback } from '@/hooks/useFeedback';
import Badge from '@/components/ui/Badge';
import StatusIndicator from '@/components/shared/StatusIndicator';
import Topbar from '@/components/layout/Topbar';
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  MessageSquare,
  Send,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

const statusIcons: Record<string, typeof TrendingUp> = {
  open: TrendingUp,
  in_progress: Clock,
  resolved: CheckCircle,
  wont_fix: XCircle,
  archived: Archive,
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  wont_fix: "Won't Fix",
  archived: 'Archived',
};

const statusColors: Record<string, string> = {
  open: 'text-col-open',
  in_progress: 'text-col-progress',
  resolved: 'text-col-resolved',
  wont_fix: 'text-col-wontfix',
  archived: 'text-chestnut',
};

const quickRecipients = ['#design-team', '#product-updates', '@alex.chen', '@priya.sharma', '#engineering-loop'];

export default function DigestPage() {
  const { items } = useFeedback();
  const [selectedProject, setSelectedProject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const projectFiltered =
    selectedProject === 'all'
      ? items
      : items.filter((item) => item.project === selectedProject);

  const filteredItems = searchItems(projectFiltered, searchQuery);
  const digest = getDigestData(filteredItems);

  // Slack Modal & Toast State
  const [slackModalOpen, setSlackModalOpen] = useState(false);
  const [recipient, setRecipient] = useState('#design-team');
  const [note, setNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSendToSlack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSlackModalOpen(false);
      setToastMessage(`✓ Daily Digest successfully shared with ${recipient.trim()}!`);
      setNote('');
      setTimeout(() => setToastMessage(null), 5000);
    }, 700);
  };

  return (
    <>
      <Topbar
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        title="Daily Digest"
      />

      <div className="flex-1 p-6 sm:p-8 flex justify-center w-full overflow-hidden">
        <div className="w-full max-w-4xl flex-1 overflow-y-auto pr-2 pb-6">
          {/* Date banner with Send to Slack CTA */}
          <div className="mb-8 bg-dire-wolf border border-white/[0.06] rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-lg font-bold text-white">Daily Digest</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-bold text-accent">
                  Live Summary
                </span>
              </div>
              <p className="text-xs text-chestnut">{digest.date}</p>
            </div>

            <button
              onClick={() => setSlackModalOpen(true)}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#4A154B] hover:bg-[#611f69] border border-[#7C5CFC]/40 text-xs font-bold text-white transition-all shadow-xl hover:shadow-[#7C5CFC]/30 group shrink-0"
            >
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-11 transition-transform">
                <MessageSquare size={13} className="text-white" />
              </div>
              <span>Share Digest via Slack...</span>
            </button>
          </div>

          {/* Status counts */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
            {(Object.entries(digest.counts) as [string, number][]).map(([status, count]) => {
              const Icon = statusIcons[status] || FileText;
              return (
                <div
                  key={status}
                  className="bg-dire-wolf rounded-2xl border border-white/[0.06] p-4 flex flex-col items-center gap-2 shadow-xl hover:border-white/15 transition-all"
                >
                  <Icon size={20} className={statusColors[status] || 'text-chestnut'} />
                  <span className="text-3xl font-bold text-white tracking-tight">{count}</span>
                  <span className="text-[11px] text-chestnut font-bold uppercase tracking-wider text-center">
                    {statusLabels[status] || status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* New items today */}
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-5 rounded-full bg-accent" />
              <h2 className="text-sm font-bold text-white">New Today</h2>
              <span className="text-xs text-white bg-white/[0.08] px-2.5 py-0.5 rounded-full font-bold">
                {digest.newItems.length}
              </span>
            </div>

            {digest.newItems.length > 0 ? (
              <div className="flex flex-col gap-3">
                {digest.newItems.map((item) => {
                  const project = projects.find((p) => p.name === item.project);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-dire-wolf rounded-2xl border border-white/[0.06] hover:border-white/15 transition-all shadow-lg"
                    >
                      <StatusIndicator severity={item.severity} />
                      <span className="text-sm font-bold text-white flex-1 truncate">{item.title}</span>
                      <Badge
                        variant="source"
                        label={item.source.charAt(0).toUpperCase() + item.source.slice(1)}
                        source={item.source}
                      />
                      {project && (
                        <Badge variant="project" label={project.name} color={project.color} />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-chestnut p-6 bg-dire-wolf rounded-2xl border border-dashed border-white/[0.08] text-center font-medium">
                {searchQuery || selectedProject !== 'all'
                  ? 'No new items match your search or project filter.'
                  : 'No new items today.'}
              </div>
            )}
          </div>

          {/* Stale items */}
          <div className="mb-10">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-5 rounded-full bg-status-minor" />
              <h2 className="text-sm font-bold text-white">Stale Items</h2>
              <span className="text-xs text-white bg-white/[0.08] px-2.5 py-0.5 rounded-full font-bold">
                {digest.staleItems.length}
              </span>
            </div>

            {digest.staleItems.length > 0 ? (
              <div className="flex flex-col gap-3">
                {digest.staleItems.map((item) => {
                  const daysSinceUpdate = getDaysSinceUpdate(item.lastUpdated);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-dire-wolf rounded-2xl border border-white/[0.06] hover:border-white/15 transition-all shadow-lg"
                    >
                      <AlertTriangle size={16} className="text-status-minor shrink-0" />
                      <span className="text-sm font-bold text-white flex-1 truncate">{item.title}</span>
                      <span className="text-xs text-status-minor shrink-0 font-bold bg-sooty px-3 py-1 rounded-xl border border-white/[0.06]">
                        {daysSinceUpdate}d stale
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-chestnut p-6 bg-dire-wolf rounded-2xl border border-dashed border-white/[0.08] text-center font-medium">
                {searchQuery || selectedProject !== 'all'
                  ? 'No stale items match your search or project filter.'
                  : 'No stale items — nice!'}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] pt-6">
            <p className="text-xs text-chestnut text-center font-medium">
              This digest is generated daily. Configure schedule in{' '}
              <span className="text-white underline cursor-pointer">Settings</span>.
            </p>
          </div>
        </div>
      </div>

      {/* ── SLACK SHARE MODAL ── */}
      {slackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !isSending && setSlackModalOpen(false)} />

          <div className="relative bg-dire-wolf border border-white/[0.1] rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#4A154B] border border-[#7C5CFC]/40 flex items-center justify-center shadow-lg">
                  <MessageSquare size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Send Digest to Slack</h3>
                  <p className="text-[11px] text-chestnut">Share today&apos;s feedback metrics</p>
                </div>
              </div>
              <button
                onClick={() => setSlackModalOpen(false)}
                disabled={isSending}
                className="w-8 h-8 rounded-xl bg-sooty border border-white/[0.08] flex items-center justify-center text-chestnut hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendToSlack} className="space-y-5">
              {/* Recipient Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white">
                  Share with <span className="text-chestnut font-normal">(Channel or Person)</span>
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="#channel or @username"
                  required
                  disabled={isSending}
                  className="w-full bg-sooty border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-semibold text-white placeholder-chestnut/50 focus:border-accent focus:outline-none transition-all shadow-inner"
                />

                {/* Quick chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickRecipients.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setRecipient(chip)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                        recipient === chip
                          ? 'bg-accent text-white border-accent shadow-sm'
                          : 'bg-sooty text-chestnut border-white/[0.06] hover:text-white hover:border-white/20'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white">
                  Optional Note <span className="text-chestnut font-normal">(Add context for the team)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. @priya here are the blocking items we need to review before Friday..."
                  rows={3}
                  disabled={isSending}
                  className="w-full bg-sooty border border-white/[0.08] rounded-xl p-3 text-xs font-medium text-white placeholder-chestnut/50 focus:border-accent focus:outline-none transition-all resize-none shadow-inner"
                />
              </div>

              {/* Digest Preview Box */}
              <div className="p-3.5 rounded-xl bg-sooty/80 border border-white/[0.06] flex items-center justify-between text-xs font-semibold text-chestnut">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-accent" />
                  <span>Includes {digest.newItems.length} New, {digest.staleItems.length} Stale items</span>
                </div>
                <span className="text-[10px] bg-white/[0.06] px-2 py-0.5 rounded text-white font-bold">PDF/Slack Card</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSlackModalOpen(false)}
                  disabled={isSending}
                  className="px-4 py-2.5 rounded-xl bg-sooty border border-white/[0.08] text-xs font-bold text-chestnut hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !recipient.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-lg shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Share Digest</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-dire-wolf border border-status-nice/40 rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-bounce-in max-w-sm">
          <div className="w-8 h-8 rounded-xl bg-status-nice/15 border border-status-nice/30 flex items-center justify-center shrink-0">
            <Check size={16} className="text-status-nice" />
          </div>
          <span className="text-xs font-bold text-white flex-1">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-chestnut hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
