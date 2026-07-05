'use client';

import { useState, useEffect } from 'react';
import { FeedbackStatus, Severity, FeedbackSource } from '@/types';
import { useFeedback } from '@/hooks/useFeedback';
import { projects } from '@/data/mockData';
import { X, Sparkles, Plus, Check } from 'lucide-react';

interface AddFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: FeedbackStatus;
  defaultProject?: string;
}

export default function AddFeedbackModal({
  isOpen,
  onClose,
  defaultStatus = 'open',
  defaultProject = 'ITDR',
}: AddFeedbackModalProps) {
  const { addItem } = useFeedback();

  // Form State
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [author, setAuthor] = useState('');
  const [project, setProject] = useState(defaultProject === 'all' ? 'ITDR' : defaultProject);
  const [severity, setSeverity] = useState<Severity>('minor');
  const [source, setSource] = useState<FeedbackSource>('manual');
  const [status, setStatus] = useState<FeedbackStatus>(defaultStatus);

  // AI Simulation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset or update defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus(defaultStatus);
      if (defaultProject !== 'all') setProject(defaultProject);
    }
  }, [isOpen, defaultStatus, defaultProject]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Simulate AI Translation from raw technical comments to plain English
  const handleAutoTranslate = () => {
    if (!rawText.trim()) return;

    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);

      // Simple heuristic/mock AI translation generator based on keywords
      const lower = rawText.toLowerCase();
      let generatedTitle = 'UI/UX adjustment required in design flow';
      let generatedSummary = 'Stakeholder requested changes to visual alignment and interaction behavior.';

      if (lower.includes('crash') || lower.includes('freeze') || lower.includes('oom') || lower.includes('error')) {
        generatedTitle = 'System freezes or throws error during high-load action';
        generatedSummary = 'The application becomes unresponsive or crashes when performing intensive operations. Engineering investigation required to optimize memory and processing.';
      } else if (lower.includes('color') || lower.includes('contrast') || lower.includes('font') || lower.includes('padding')) {
        generatedTitle = 'Visual hierarchy and styling refinements needed';
        generatedSummary = 'Adjust spacing, color contrast, and typography weights to align with the design system tokens and improve readability.';
      } else if (lower.includes('button') || lower.includes('click') || lower.includes('modal') || lower.includes('nav')) {
        generatedTitle = 'Interactive element or navigation flow enhancement';
        generatedSummary = 'Refine button states, click targets, or modal navigation to ensure a smooth, intuitive user experience across devices.';
      } else {
        // Fallback: clean up formatting of the raw text
        generatedTitle = rawText.slice(0, 48).trim() + (rawText.length > 48 ? '...' : '');
        generatedSummary = `Plain English Summary: ${rawText.trim()}`;
      }

      if (!title) setTitle(generatedTitle);
      setTranslatedText(generatedSummary);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rawText.trim() || !author.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addItem({
        title: title.trim(),
        description: rawText.trim(),
        translatedDescription: translatedText.trim() || undefined,
        isTechnical: Boolean(translatedText.trim() && translatedText.trim() !== rawText.trim()),
        isDuplicate: false,
        author: author.trim(),
        source,
        project,
        status,
        severity,
      });

      setIsSubmitting(false);
      onClose();

      // Reset form
      setTitle('');
      setRawText('');
      setTranslatedText('');
      setAuthor('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSubmitting && onClose()} />

      {/* Modal Card */}
      <div className="relative bg-dire-wolf border border-white/[0.1] rounded-3xl max-w-[820px] w-full p-6 sm:p-8 md:p-10 shadow-2xl z-10 overflow-y-auto max-h-[90vh] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30 shrink-0">
              <Plus size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Add Feedback Manually</h2>
              <p className="text-xs sm:text-sm text-chestnut mt-0.5">Log stakeholder notes, Slack threads, or engineering comments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-xl bg-sooty border border-white/[0.08] flex items-center justify-center text-chestnut hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Row: Project & Author & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Project */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white">Project</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full bg-sooty border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-accent focus:outline-none transition-all shadow-inner h-[42px]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white">Author / Stakeholder <span className="text-accent">*</span></label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Sarah (PM) or Client Call"
                required
                className="w-full bg-sooty border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder-chestnut/50 focus:border-accent focus:outline-none transition-all shadow-inner h-[42px]"
              />
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white">Source Channel</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as FeedbackSource)}
                className="w-full bg-sooty border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-accent focus:outline-none transition-all shadow-inner h-[42px]"
              >
                <option value="manual">✎ Manual Entry</option>
                <option value="slack"># Slack Comment</option>
                <option value="figma">◆ Figma Note</option>
              </select>
            </div>
          </div>

          {/* Raw Feedback / Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold text-white">
                Raw Feedback / Engineering Notes <span className="text-accent">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={isTranslating || !rawText.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-bold text-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer shadow-sm"
              >
                <Sparkles size={14} className={isTranslating ? 'animate-spin' : 'group-hover:scale-110 transition-transform'} />
                <span>{isTranslating ? 'Translating with AI...' : '✨ Auto-Translate to Plain English'}</span>
              </button>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw stakeholder notes, technical Engineering comments, or Slack thread excerpts here..."
              rows={3}
              required
              className="w-full bg-sooty border border-white/[0.08] rounded-xl p-3.5 text-xs font-medium text-white placeholder-chestnut/50 focus:border-accent focus:outline-none transition-all resize-none shadow-inner leading-relaxed"
            />
          </div>

          {/* AI Translated Summary & Title */}
          <div className="p-5 sm:p-6 rounded-2xl bg-sooty/80 border border-white/[0.06] space-y-4 shadow-inner">
            <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
              <Sparkles size={15} className="text-accent" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Loop Plain English Translation</span>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-chestnut">Actionable Title <span className="text-accent">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Export feature freezes on high-resolution displays"
                required
                className="w-full bg-dire-wolf border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder-chestnut/50 focus:border-accent focus:outline-none transition-all h-[42px]"
              />
            </div>

            {/* Translated Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-chestnut">Plain English Summary for Design Team</label>
              <textarea
                value={translatedText}
                onChange={(e) => setTranslatedText(e.target.value)}
                placeholder="Click '✨ Auto-Translate' above or type a clean summary..."
                rows={2}
                className="w-full bg-dire-wolf border border-white/[0.08] rounded-xl p-3.5 text-xs font-medium text-white placeholder-chestnut/50 focus:border-accent focus:outline-none transition-all resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Bottom Row: Severity & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
            {/* Severity */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white">Priority / Severity</label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['blocking', 'minor', 'nice_to_have'] as Severity[]).map((s) => {
                  const labels: Record<Severity, string> = { blocking: 'Blocking', minor: 'Minor', nice_to_have: 'Nice to have' };
                  const colors: Record<Severity, string> = {
                    blocking: 'bg-status-blocking/20 text-status-blocking border-status-blocking/40',
                    minor: 'bg-status-minor/20 text-status-minor border-status-minor/40',
                    nice_to_have: 'bg-status-nice/20 text-status-nice border-status-nice/40',
                  };
                  const active = severity === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        active ? colors[s] + ' shadow-md scale-[1.02]' : 'bg-sooty text-chestnut border-white/[0.06] hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white">Initial Board Column</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
                className="w-full bg-sooty border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-accent focus:outline-none transition-all shadow-inner h-[42px]"
              >
                <option value="open">● Open</option>
                <option value="in_progress">● In Progress</option>
                <option value="resolved">● Resolved</option>
                <option value="wont_fix">● Won&apos;t Fix</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-sooty border border-white/[0.08] text-xs font-bold text-chestnut hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !rawText.trim() || !author.trim()}
              className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-lg shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding Card...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Add to Board</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
