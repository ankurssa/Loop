'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import { Clock, AlertTriangle, MessageSquare, Check, Sparkles, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [digestTime, setDigestTime] = useState('09:00');
  const [staleThreshold, setStaleThreshold] = useState(5);
  const [autoReply, setAutoReply] = useState(true);
  const [slackChannel, setSlackChannel] = useState('#design-feedback');
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 4000);
  };

  return (
    <>
      <Topbar title="Workspace Settings" showControls={false} />

      {/* Center aligned container */}
      <div className="flex-1 p-6 sm:p-8 flex justify-center w-full overflow-hidden">
        <div className="w-full max-w-4xl flex-1 overflow-y-auto pr-2 pb-6 flex flex-col">
          {/* Banner */}
          <div className="mb-8 bg-dire-wolf border border-white/[0.06] rounded-2xl p-6 shadow-2xl flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white mb-1">Workflow Configuration</h1>
              <p className="text-xs text-chestnut">
                Configure how Loop captures, translates, and digests feedback for your design team.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-xs font-bold text-accent">
              <Sparkles size={14} />
              <span>Pro Plan</span>
            </div>
          </div>

          {/* Settings list */}
          <div className="flex flex-col gap-5 mb-10">
            {/* Digest Schedule */}
            <section className="bg-dire-wolf rounded-2xl border border-white/[0.06] p-6 shadow-xl hover:border-white/15 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Daily Digest Schedule</h2>
                    <p className="text-xs text-chestnut mt-0.5 max-w-md leading-relaxed">
                      Choose when the automated daily summary is compiled and shared with your team.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center pl-14 sm:pl-0">
                  <span className="text-xs font-bold text-chestnut">Time:</span>
                  <input
                    type="time"
                    value={digestTime}
                    onChange={(e) => setDigestTime(e.target.value)}
                    className="bg-sooty border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-accent focus:outline-none transition-all shadow-inner [color-scheme:dark]"
                  />
                </div>
              </div>
            </section>

            {/* Default Slack Channel */}
            <section className="bg-dire-wolf rounded-2xl border border-white/[0.06] p-6 shadow-xl hover:border-white/15 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#4A154B] border border-[#7C5CFC]/40 flex items-center justify-center shrink-0 shadow-md">
                    <Bell size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Default Slack Broadcast Channel</h2>
                    <p className="text-xs text-chestnut mt-0.5 max-w-md leading-relaxed">
                      The primary Slack channel where automated digests and stale nudges are broadcasted.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center pl-14 sm:pl-0">
                  <input
                    type="text"
                    value={slackChannel}
                    onChange={(e) => setSlackChannel(e.target.value)}
                    placeholder="#channel"
                    className="bg-sooty border border-white/[0.08] rounded-xl px-4 py-2 text-xs font-bold text-white w-44 focus:border-accent focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>
            </section>

            {/* Stale Threshold */}
            <section className="bg-dire-wolf rounded-2xl border border-white/[0.06] p-6 shadow-xl hover:border-white/15 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-status-minor/15 border border-status-minor/30 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-status-minor" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Stale Threshold</h2>
                    <p className="text-xs text-chestnut mt-0.5 max-w-md leading-relaxed">
                      Items without updates or comments for this many days will automatically flag in &ldquo;Needs Attention&rdquo;.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center pl-14 sm:pl-0">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={staleThreshold}
                    onChange={(e) => setStaleThreshold(Number(e.target.value))}
                    className="bg-sooty border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-bold text-white w-20 text-center focus:border-accent focus:outline-none transition-all shadow-inner"
                  />
                  <span className="text-xs font-bold text-chestnut">days</span>
                </div>
              </div>
            </section>

            {/* Auto-Reply */}
            <section className="bg-dire-wolf rounded-2xl border border-white/[0.06] p-6 shadow-xl hover:border-white/15 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-col-progress/15 border border-col-progress/30 flex items-center justify-center shrink-0">
                    <MessageSquare size={18} className="text-col-progress" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">AI Auto-Reply in Slack</h2>
                    <p className="text-xs text-chestnut mt-0.5 max-w-md leading-relaxed">
                      Automatically respond to repetitive stakeholder status pings in Slack threads with the latest translated summary from the board.
                    </p>
                  </div>
                </div>

                {/* Sleek Toggle switch */}
                <button
                  onClick={() => setAutoReply(!autoReply)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 border ${
                    autoReply
                      ? 'bg-accent border-accent shadow-lg shadow-accent/25'
                      : 'bg-sooty border-white/[0.1]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${
                      autoReply ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {autoReply && (
                <div className="mt-4 ml-14 p-3.5 bg-sooty/80 rounded-xl border border-white/[0.06] flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-status-nice animate-pulse shrink-0" />
                  <p className="text-xs font-semibold text-chestnut">
                    <span className="text-white font-bold">Active</span> — Loop will auto-reply to stakeholder inquiries like &ldquo;any update on this?&rdquo; with the current card status.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Save Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all shadow-xl shadow-accent/25 active:scale-95"
            >
              <Check size={16} />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-dire-wolf border border-status-nice/40 rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-bounce-in max-w-sm">
          <div className="w-8 h-8 rounded-xl bg-status-nice/15 border border-status-nice/30 flex items-center justify-center shrink-0">
            <Check size={16} className="text-status-nice" />
          </div>
          <span className="text-xs font-bold text-white flex-1">✓ Settings successfully saved!</span>
        </div>
      )}
    </>
  );
}
