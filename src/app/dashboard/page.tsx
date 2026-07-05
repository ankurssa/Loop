'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import { useFeedback } from '@/hooks/useFeedback';
import { projects } from '@/data/mockData';
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Palette,
  FileText,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  FolderGit2,
  Check,
} from 'lucide-react';
import { FeedbackItem, FeedbackSource, Severity } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { items } = useFeedback();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeDuration, setTimeDuration] = useState<'7d' | '15d' | '30d' | '90d'>('7d');

  // Filter items by project and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesProject = selectedProject === 'all' || item.project === selectedProject;
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProject && matchesSearch;
    });
  }, [items, selectedProject, searchQuery]);

  // Dynamic KPI Calculations based on timeDuration filter
  const kpiMetrics = useMemo(() => {
    const totalCount = filteredItems.length;
    const resolvedCount = filteredItems.filter((i) => i.status === 'resolved' || i.status === 'archived').length;
    const blockingCount = filteredItems.filter(
      (i) => i.status === 'open' && i.severity === 'blocking'
    ).length;

    // Scale counts/percentages based on duration to give dynamic visual feedback
    let scaleFactor = 0.65;
    let avgTurnaround = '1.8 Days';
    let turnaroundDiff = '-0.4d';
    let volumeGrowth = '+18.4%';

    if (timeDuration === '15d') {
      scaleFactor = 1.0;
      avgTurnaround = '2.1 Days';
      turnaroundDiff = '-0.3d';
      volumeGrowth = '+24.1%';
    } else if (timeDuration === '30d') {
      scaleFactor = 1.45;
      avgTurnaround = '2.3 Days';
      turnaroundDiff = '-0.5d';
      volumeGrowth = '+31.8%';
    } else if (timeDuration === '90d') {
      scaleFactor = 3.20;
      avgTurnaround = '2.6 Days';
      turnaroundDiff = '-0.8d';
      volumeGrowth = '+42.5%';
    }

    const displayTotal = Math.max(1, Math.round(totalCount * scaleFactor));
    const displayResolved = Math.round(resolvedCount * scaleFactor);
    const resolutionRate = Math.round((displayResolved / displayTotal) * 100) || 72;

    return {
      total: displayTotal,
      resolved: displayResolved,
      resolutionRate: Math.min(100, resolutionRate),
      blocking: blockingCount,
      avgTurnaround,
      turnaroundDiff,
      volumeGrowth,
    };
  }, [filteredItems, timeDuration]);

  // Top 5 Projects KPI Tile Data
  const topProjects = useMemo(() => {
    const stats = projects.map((p) => {
      const projItems = filteredItems.filter((i) => i.project === p.name || i.project.toLowerCase() === p.id.toLowerCase());
      const resolved = projItems.filter((i) => i.status === 'resolved' || i.status === 'archived').length;
      return {
        id: p.name,
        name: p.name,
        color: p.color,
        total: projItems.length,
        resolved: resolved,
        rate: projItems.length > 0 ? Math.round((resolved / projItems.length) * 100) : 0,
      };
    });
    return stats.sort((a, b) => b.total - a.total).slice(0, 5);
  }, [filteredItems]);

  // Channel (Source) Distribution
  const channelStats = useMemo(() => {
    const counts: Record<FeedbackSource, number> = {
      slack: 0,
      figma: 0,
      manual: 0,
    };
    filteredItems.forEach((item) => {
      if (counts[item.source] !== undefined) {
        counts[item.source]++;
      }
    });
    const total = Math.max(1, filteredItems.length);
    return [
      { channel: 'Slack Ingestion', count: counts.slack, percent: Math.round((counts.slack / total) * 100), color: 'bg-[#36C5F0]', icon: MessageSquare },
      { channel: 'Figma Comments', count: counts.figma, percent: Math.round((counts.figma / total) * 100), color: 'bg-[#F24E1E]', icon: Palette },
      { channel: 'Manual / Portal', count: counts.manual, percent: Math.round((counts.manual / total) * 100), color: 'bg-[#10B981]', icon: FileText },
    ];
  }, [filteredItems]);

  // Severity & Taxonomy Distribution
  const categoryStats = useMemo(() => {
    const counts: Record<Severity, number> = {
      blocking: 0,
      minor: 0,
      nice_to_have: 0,
    };
    filteredItems.forEach((item) => {
      if (counts[item.severity] !== undefined) {
        counts[item.severity]++;
      }
    });
    const total = Math.max(1, filteredItems.length);
    const techCount = filteredItems.filter((i) => i.isTechnical).length;
    return [
      { id: 'blocking', label: 'Blocking / Critical UI', count: counts.blocking, percent: Math.round((counts.blocking / total) * 100), color: 'bg-[#EF4444]', filterParam: 'severity=blocking' },
      { id: 'minor', label: 'Minor UX Enhancement', count: counts.minor, percent: Math.round((counts.minor / total) * 100), color: 'bg-[#3B82F6]', filterParam: 'severity=minor' },
      { id: 'nice_to_have', label: 'Nice to Have / Polish', count: counts.nice_to_have, percent: Math.round((counts.nice_to_have / total) * 100), color: 'bg-[#10B981]', filterParam: 'severity=nice_to_have' },
      { id: 'technical', label: 'Technical Architecture', count: techCount, percent: Math.round((techCount / total) * 100), color: 'bg-[#8B5CF6]', filterParam: 'technical=true' },
    ];
  }, [filteredItems]);

  // Daily / Weekly Velocity Bars
  const velocityDays = useMemo(() => {
    const days = [];
    if (timeDuration === '7d') {
      const baseVolume = [12, 18, 24, 14, 19, 22, 28];
      for (let i = 0; i < 7; i++) {
        const vol = baseVolume[i];
        days.push({ day: `Day ${i + 1}`, label: `D${i + 1}`, volume: vol, heightPercent: Math.min(100, Math.round((vol / 30) * 100)) });
      }
    } else if (timeDuration === '15d') {
      const baseVolume = [8, 12, 15, 9, 18, 24, 14, 19, 22, 11, 16, 28, 20, 15, 26];
      for (let i = 0; i < 15; i++) {
        const vol = baseVolume[i];
        days.push({ day: `Day ${i + 1}`, label: `D${i + 1}`, volume: vol, heightPercent: Math.min(100, Math.round((vol / 30) * 100)) });
      }
    } else if (timeDuration === '30d') {
      // Show 15 bars representing 2-day intervals over 30 days
      const baseVolume = [14, 22, 19, 28, 32, 24, 38, 42, 31, 29, 45, 36, 48, 52, 40];
      for (let i = 0; i < 15; i++) {
        const vol = baseVolume[i];
        days.push({ day: `Days ${i * 2 + 1}-${i * 2 + 2}`, label: `D${i * 2 + 2}`, volume: vol, heightPercent: Math.min(100, Math.round((vol / 60) * 100)) });
      }
    } else {
      // 90d -> 12 weekly bars
      const baseVolume = [45, 62, 58, 74, 88, 69, 92, 105, 84, 96, 112, 128];
      for (let i = 0; i < 12; i++) {
        const vol = baseVolume[i];
        days.push({ day: `Week ${i + 1}`, label: `Wk ${i + 1}`, volume: vol, heightPercent: Math.min(100, Math.round((vol / 140) * 100)) });
      }
    }
    return days;
  }, [timeDuration]);

  const durationOptions: { value: '7d' | '15d' | '30d' | '90d'; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '15d', label: '15 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-sooty select-none">
      {/* Consistent Topbar */}
      <Topbar
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        title="Analytics Dashboard"
        showControls={true}
      />

      {/* Internal Content Scroll */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in">
        {/* Header & Time Duration Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-dire-wolf p-6 rounded-[24px] border border-white/[0.06] shadow-2xl shadow-black/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-extrabold tracking-wider uppercase border border-accent/20 flex items-center gap-1">
                <Sparkles size={11} /> Real-Time Analytics
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Design Velocity & KPI Overview
            </h1>
            <p className="text-xs text-chestnut mt-0.5">
              Monitor team ingestion rates, resolution velocity, and multi-channel feedback intelligence.
            </p>
          </div>

          {/* Time Duration Filter: 7D | 15D | 30D | 90D */}
          <div className="flex items-center gap-1.5 bg-sooty p-1.5 rounded-2xl border border-white/[0.08] self-start lg:self-center shadow-inner flex-wrap">
            <span className="text-xs font-bold text-chestnut pl-2 pr-1 flex items-center gap-1 hidden sm:flex">
              <Calendar size={13} />
              <span>Duration:</span>
            </span>
            {durationOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeDuration(opt.value)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  timeDuration === opt.value
                    ? 'bg-accent text-white shadow-lg shadow-accent/25 scale-[1.02]'
                    : 'text-chestnut hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Hero KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Tile 1: Total Ingested */}
          <div className="bg-dire-wolf p-5 rounded-[24px] border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Total Ingested</span>
              <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center border border-accent/20 group-hover:scale-110 transition-transform">
                <BarChart3 size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-white tracking-tight">{kpiMetrics.total}</span>
              <span className="text-xs font-extrabold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ArrowUpRight size={13} /> {kpiMetrics.volumeGrowth}
              </span>
            </div>
            <p className="text-[11px] text-chestnut mt-2 font-medium">
              Across all connected channels in last <strong className="text-white">{durationOptions.find(d => d.value === timeDuration)?.label.toLowerCase()}</strong>.
            </p>
          </div>

          {/* Tile 2: Resolution Velocity */}
          <div className="bg-dire-wolf p-5 rounded-[24px] border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Resolution Rate</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-white tracking-tight">{kpiMetrics.resolutionRate}%</span>
              <span className="text-xs font-extrabold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ArrowUpRight size={13} /> +6.2%
              </span>
            </div>
            <div className="w-full bg-sooty h-2 rounded-full mt-3 overflow-hidden border border-white/[0.05]">
              <div
                className="bg-gradient-to-r from-emerald-500 to-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${kpiMetrics.resolutionRate}%` }}
              />
            </div>
          </div>

          {/* Tile 3: Avg Turnaround Time */}
          <div className="bg-dire-wolf p-5 rounded-[24px] border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Avg. Turnaround</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Clock size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-white tracking-tight">{kpiMetrics.avgTurnaround}</span>
              <span className="text-xs font-extrabold text-emerald-400 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ArrowDownRight size={13} /> {kpiMetrics.turnaroundDiff}
              </span>
            </div>
            <p className="text-[11px] text-chestnut mt-2 font-medium">
              Time from feedback ingestion to design resolution.
            </p>
          </div>

          {/* Tile 4: Blocking Attention Required */}
          <div className="bg-dire-wolf p-5 rounded-[24px] border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Blocking Attention</span>
              <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-white tracking-tight">{kpiMetrics.blocking}</span>
              <span className="text-xs font-extrabold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20 uppercase tracking-wider">
                Urgent Action
              </span>
            </div>
            <p className="text-[11px] text-chestnut mt-2 font-medium">
              High-priority design issues pending immediate review.
            </p>
          </div>
        </div>

        {/* Row 2: Ingestion Velocity & Top 5 Projects KPI Tile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel 1 (Left 2 Cols): Daily/Weekly Velocity */}
          <div className="bg-dire-wolf p-6 rounded-[24px] border border-white/[0.06] shadow-2xl flex flex-col justify-between lg:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                    <TrendingUp size={18} className="text-accent" />
                    <span>Ingestion Velocity ({durationOptions.find(d => d.value === timeDuration)?.label})</span>
                  </h2>
                  <p className="text-xs text-chestnut mt-0.5">
                    Volume of incoming design feedback over selected timeline.
                  </p>
                </div>
                <span className="text-xs font-bold bg-sooty px-3 py-1 rounded-xl text-chestnut border border-white/[0.05]">
                  Peak: <strong className="text-white">128 items</strong>
                </span>
              </div>

              {/* Bar Chart Canvas */}
              <div className="h-56 flex items-end justify-between gap-1.5 pt-6 pb-2 px-2 border-b border-white/[0.06]">
                {velocityDays.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-extrabold text-white bg-sooty px-1.5 py-0.5 rounded border border-white/[0.1] -mb-1 shadow-md whitespace-nowrap z-10">
                      {d.volume}
                    </div>
                    <div
                      className="w-full max-w-[28px] bg-gradient-to-t from-accent/40 to-accent rounded-t-lg group-hover:brightness-125 transition-all duration-300 shadow-md shadow-accent/10"
                      style={{ height: `${d.heightPercent}%` }}
                    />
                    <span className="text-[10px] font-bold text-chestnut truncate w-full text-center">
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 text-xs text-chestnut flex-wrap gap-2">
              <span>Average velocity: <strong className="text-white">24.6 items / period</strong></span>
              <span className="text-emerald-400 font-bold">↑ 14% higher than team benchmark</span>
            </div>
          </div>

          {/* Panel 2 (Right 1 Col): Top 5 Projects KPI Tile (Interactive!) */}
          <div className="bg-dire-wolf p-6 rounded-[24px] border border-white/[0.06] shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <FolderGit2 size={18} className="text-emerald-400" />
                  <span>Top 5 Projects</span>
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/[0.08] text-chestnut border border-white/[0.05]">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-chestnut mb-4">
                Click any project row to view its filtered active board.
              </p>

              {/* Top 5 Projects List */}
              <div className="space-y-2.5">
                {topProjects.map((proj, idx) => (
                  <div
                    key={idx}
                    onClick={() => router.push(`/board?project=${encodeURIComponent(proj.name)}`)}
                    className="p-3 rounded-2xl bg-sooty border border-white/[0.04] hover:border-accent/40 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group/row flex items-center justify-between shadow-inner"
                    title={`Click to open ${proj.name} board`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: proj.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover/row:text-accent transition-colors truncate">
                          {proj.name}
                        </p>
                        <p className="text-[11px] text-chestnut font-medium">
                          {proj.resolved} / {proj.total} resolved
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-black text-white">{proj.total}</span>
                        <span className="text-[10px] text-chestnut block">items</span>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-white/[0.04] group-hover/row:bg-accent text-chestnut group-hover/row:text-white flex items-center justify-center transition-all">
                        <ChevronRight size={15} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
              <span className="text-[11px] text-chestnut">
                Showing top active workspaces by total feedback
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Channel Share & Interactive Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channel Ingestion Share (1 Col) */}
          <div className="bg-dire-wolf p-6 rounded-[24px] border border-white/[0.06] shadow-2xl flex flex-col justify-between">
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight mb-1">
                Channel Ingestion Share
              </h2>
              <p className="text-xs text-chestnut mb-6">
                Where your design feedback originates.
              </p>

              <div className="space-y-4">
                {channelStats.map((ch, idx) => {
                  const Icon = ch.icon;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white flex items-center gap-2">
                          <Icon size={14} className="text-chestnut" />
                          <span>{ch.channel}</span>
                        </span>
                        <span className="text-chestnut">
                          <strong className="text-white">{ch.count}</strong> ({ch.percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-sooty h-2 rounded-full overflow-hidden border border-white/[0.04]">
                        <div
                          className={`h-full rounded-full ${ch.color} transition-all duration-500`}
                          style={{ width: `${ch.percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold text-chestnut">
              <span>Primary source:</span>
              <span className="text-white bg-sooty px-2.5 py-1 rounded-lg border border-white/[0.05]">Slack Ingestion</span>
            </div>
          </div>

          {/* Interactive Category Distribution (2 Cols) */}
          <div className="bg-dire-wolf p-6 rounded-[24px] border border-white/[0.06] shadow-2xl lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-extrabold text-white tracking-tight">
                      Feedback Category Distribution
                    </h2>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                      Interactive
                    </span>
                  </div>
                  <p className="text-xs text-chestnut mt-0.5">
                    Click any category card to open the Kanban board filtered by that classification.
                  </p>
                </div>
                <span className="text-xs font-bold text-chestnut bg-sooty px-3 py-1.5 rounded-xl border border-white/[0.06] self-start sm:self-auto">
                  Total Classified: <strong className="text-white">{filteredItems.length} items</strong>
                </span>
              </div>

              {/* 4 Interactive Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categoryStats.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => router.push(`/board?${cat.filterParam}`)}
                    className="bg-sooty p-4 rounded-2xl border border-white/[0.05] hover:border-accent/50 hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group/cat shadow-lg flex flex-col justify-between relative overflow-hidden"
                    title={`Click to filter board by ${cat.label}`}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.02] rounded-full blur-xl group-hover/cat:bg-accent/10 transition-all pointer-events-none" />
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-3 h-3 rounded-full ${cat.color} shadow-sm group-hover/cat:scale-125 transition-transform`} />
                        <div className="w-6 h-6 rounded-lg bg-white/[0.04] group-hover/cat:bg-accent text-chestnut group-hover/cat:text-white flex items-center justify-center transition-all">
                          <ChevronRight size={14} />
                        </div>
                      </div>
                      <p className="text-xs font-extrabold text-white group-hover/cat:text-accent transition-colors pt-1">
                        {cat.label}
                      </p>
                      <p className="text-[11px] text-chestnut font-medium mt-0.5">
                        <strong className="text-white">{cat.count}</strong> items ({cat.percent}%)
                      </p>
                    </div>

                    <div className="w-full bg-dire-wolf h-1.5 rounded-full overflow-hidden mt-4">
                      <div className={`h-full ${cat.color} rounded-full transition-all duration-500`} style={{ width: `${cat.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-chestnut">
              <span>Taxonomy standard: <strong className="text-white">Loop v2.4 Classification</strong></span>
              <span className="text-accent font-bold flex items-center gap-1">
                <span>Click card to filter board</span>
                <ChevronRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
