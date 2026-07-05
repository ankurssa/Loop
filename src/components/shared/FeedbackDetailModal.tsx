'use client';

import { useState, useEffect } from 'react';
import { FeedbackItem, FeedbackStatus, Severity, FeedbackSource } from '@/types';
import { projects, statusLabels, getRelativeTime } from '@/data/mockData';
import { useFeedback } from '@/hooks/useFeedback';
import { X, Check, Trash2, Sparkles, Pencil } from 'lucide-react';

interface FeedbackDetailModalProps {
  item: FeedbackItem;
  onClose: () => void;
}

const severityLabels: Record<Severity, string> = {
  blocking: 'Blocking',
  minor: 'Minor',
  nice_to_have: 'Nice to have',
};

const severityColors: Record<Severity, string> = {
  blocking: 'bg-status-blocking/20 text-status-blocking border-status-blocking/40',
  minor: 'bg-status-minor/20 text-status-minor border-status-minor/40',
  nice_to_have: 'bg-status-nice/20 text-status-nice border-status-nice/40',
};

export default function FeedbackDetailModal({ item, onClose }: FeedbackDetailModalProps) {
  const { updateItem, deleteItem } = useFeedback();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [translatedDescription, setTranslatedDescription] = useState(item.translatedDescription || '');
  const [author, setAuthor] = useState(item.author);
  const [project, setProject] = useState(item.project);
  const [severity, setSeverity] = useState<Severity>(item.severity);
  const [source, setSource] = useState<FeedbackSource>(item.source);
  const [status, setStatus] = useState<FeedbackStatus>(item.status);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim() || !description.trim() || !author.trim()) return;
    updateItem(item.id, {
      title: title.trim(),
      description: description.trim(),
      translatedDescription: translatedDescription.trim() || undefined,
      isTechnical: Boolean(translatedDescription.trim() && translatedDescription.trim() !== description.trim()),
      author: author.trim(),
      project,
      severity,
      source,
      status,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteItem(item.id);
    onClose();
  };

  const projectMeta = projects.find((p) => p.name === item.project);

  const inputClass =
    'w-full bg-sooty border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white placeholder-chestnut/50 focus:border-accent focus:outline-none transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        className="relative bg-dire-wolf border border-white/[0.1] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 overflow-y-auto max-h-[90vh] space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="min-w-0">
            {isEditing ? (
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass + ' text-sm font-bold'} />
            ) : (
              <h2 className="text-lg font-bold text-white tracking-tight leading-snug">{item.title}</h2>
            )}
            <p className="text-[11px] text-chestnut mt-1.5">
              Added by <span className="text-white font-semibold">{item.author}</span> · {getRelativeTime(item.createdAt)} · last updated {getRelativeTime(item.lastUpdated)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-9 h-9 rounded-xl bg-sooty border border-white/[0.08] flex items-center justify-center text-chestnut hover:text-white transition-colors cursor-pointer"
                title="Edit item"
              >
                <Pencil size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-sooty border border-white/[0.08] flex items-center justify-center text-chestnut hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Meta chips (view mode) */}
        {!isEditing && (
          <div className="flex items-center flex-wrap gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${severityColors[item.severity]}`}>
              {severityLabels[item.severity]}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/[0.06] text-white border border-white/[0.08]">
              {statusLabels[item.status]}
            </span>
            {projectMeta && (
              <span
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/[0.08] text-white flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: projectMeta.color }} />
                {projectMeta.name}
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/[0.06] text-chestnut border border-white/[0.08] capitalize">
              via {item.source}
            </span>
            {item.isDuplicate && item.duplicateOf && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-status-minor/15 text-status-minor border border-status-minor/30">
                Possible duplicate of {item.duplicateOf}
              </span>
            )}
          </div>
        )}

        {/* Body */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-chestnut">Raw Feedback</label>
            {isEditing ? (
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass + ' resize-none leading-relaxed'} />
            ) : (
              <p className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap bg-sooty/60 border border-white/[0.05] rounded-xl p-4">
                {item.description}
              </p>
            )}
          </div>

          {(isEditing || item.translatedDescription) && (
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold text-chestnut">
                <Sparkles size={13} className="text-accent" />
                Plain English Summary
              </label>
              {isEditing ? (
                <textarea value={translatedDescription} onChange={(e) => setTranslatedDescription(e.target.value)} rows={3} className={inputClass + ' resize-none leading-relaxed'} />
              ) : (
                <p className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap bg-sooty/60 border border-accent/20 rounded-xl p-4">
                  {item.translatedDescription}
                </p>
              )}
            </div>
          )}

          {/* Edit-mode fields */}
          {isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-chestnut">Author</label>
                <input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-chestnut">Project</label>
                <select value={project} onChange={(e) => setProject(e.target.value)} className={inputClass}>
                  {projects.map((p) => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-chestnut">Severity</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)} className={inputClass}>
                  <option value="blocking">Blocking</option>
                  <option value="minor">Minor</option>
                  <option value="nice_to_have">Nice to have</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-chestnut">Source</label>
                <select value={source} onChange={(e) => setSource(e.target.value as FeedbackSource)} className={inputClass}>
                  <option value="manual">Manual Entry</option>
                  <option value="slack">Slack Comment</option>
                  <option value="figma">Figma Note</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-chestnut">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as FeedbackStatus)} className={inputClass}>
                  {(Object.keys(statusLabels) as FeedbackStatus[]).map((st) => (
                    <option key={st} value={st}>{statusLabels[st]}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-status-blocking">Delete this item permanently?</span>
              <button
                onClick={handleDelete}
                className="px-3.5 py-2 rounded-xl bg-status-blocking text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3.5 py-2 rounded-xl bg-sooty border border-white/[0.08] text-xs font-bold text-chestnut hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-status-blocking/10 border border-status-blocking/30 text-xs font-bold text-status-blocking hover:bg-status-blocking/20 transition-all cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )}

          {isEditing && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 rounded-xl bg-sooty border border-white/[0.08] text-xs font-bold text-chestnut hover:text-white transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim() || !description.trim() || !author.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-lg shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Check size={15} />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
