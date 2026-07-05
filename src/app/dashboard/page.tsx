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
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  ChevronRight,
  FolderGit2,
} from 'lucide-react';
import { FeedbackItem, FeedbackSource, Severity } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { items } = useFeedback();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeDuration, setTimeDuration] = useState<'7d' | '15d' | '30d' | '90d'>('7d');
  // Snapshot "now" once per mount so window math is pure during render
  const [now] = useState(() => Date.now());

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

  const windowDays = { '7d': 7, '15d': 15, '30d': 30, '90d': 90 }[timeDuration];

  // Real KPI calculations for the selected time window (vs. the previous window of equal length)
  const kpiMetrics = useMemo(() => {
    const MS_DAY = 1000 * 60 * 60 * 24;
    const windowStart = now - windowDays * MS_DAY;
    const prevStart = now - 2 * windowDays * MS_DAY;

    const currentItems = filteredItems.filter((i) => i.createdAt.getTime() >= windowStart);
    const prevItems = filteredItems.filter(
      (i) => i.createdAt.getTime() >= prevStart && i.createdAt.getTime() < windowStart
    );

    const total = currentItems.length;
    const resolved = currentItems.filter((i) => i.status === 'resolved' || i.status === 'archived').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const blocking = currentItems.filter((i) => i.status === 'open' && i.severity === 'blocking').length;

    // Volume growth vs previous window
    const volumeGrowth =
      prevItems.length > 0
        ? Math.round(((total - prevItems.length) / prevItems.length) * 1000) / 10
        : null;

    // Average turnaround (creation → resolution) for items resolved in each window
    const avgDays = (list: FeedbackItem[]): number | null => {
      const done = list.filter((i) => i.resolvedAt);
      if (done.length === 0) return null;
      const sum = done.reduce((acc, i) => acc + (i.resolvedAt!.getTime() - i.createdAt.getTime()), 0);
      return sum / done.length / MS_DAY;
    };
    const turnaround = avgDays(
      filteredItems.filter((i) => i.resolvedAt && i.resolvedAt.getTime() >= windowStart)
    );
    const prevTurnaround = avgDays(
      filteredItems.filter(
        (i) => i.resolvedAt && i.resolvedAt.getTime() >= prevStart && i.resolvedAt.getTime() < windowStart
      )
    );
    const turnaroundDiff =
      turnaround !== null && prevTurnaround !== null
        ? Math.round((turnaround - prevTurnaround) * 10) / 10
        : null;

    return {
      total,
      resolved,
      resolutionRate,
      blocking,
      avgTurnaround: turnaround !== null ? `${(Math.round(turnaround * 10) / 10).toFixed(1)} Days` : '—',
      turnaroundDiff,
      volumeGrowth,
    };
  }, [filteredItems, windowDays, now]);

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

  // Real ingestion velocity: bucket item creation dates across the selected window
  const velocity = useMemo(() => {
    const MS_DAY = 1000 * 60 * 60 * 24;
    const bucketCount = { '7d': 7, '15d': 15, '30d': 15, '90d': 12 }[timeDuration];
    const bucketMs = (windowDays * MS_DAY) / bucketCount;
    const windowStart = now - windowDays * MS_DAY;

    const counts = new Array(bucketCount).fill(0);
    filteredItems.forEach((item) => {
      const t = item.createdAt.getTime();
      if (t < windowStart) return;
      const idx = Math.min(bucketCount - 1, Math.floor((t - windowStart) / bucketMs));
      counts[idx]++;
    });

    const peak = Math.max(...counts);
    const bars = counts.map((volume, i) => {
      const bucketEnd = new Date(windowStart + (i + 1) * bucketMs);
      const label =
        timeDuration === '7d'
          ? bucketEnd.toLocaleDateString('en-US', { weekday: 'short' })
          : timeDuration === '90d'
            ? `Wk ${i + 1}`
            : bucketEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        label,
        volume,
        heightPercent: peak > 0 ? Math.round((volume / peak) * 100) : 0,
      };
    });

    const total = counts.reduce((a, b) => a + b, 0);
    const avg = Math.round((total / bucketCount) * 10) / 10;
    return { bars, peak, avg };
  }, [filteredItems, timeDuration, windowDays, now]);

  const durationOptions: { value: '7d' | '15d' | '30d' | '90d'; label: string }[] = [
    { value: '7d', label: '7 Days' },
    { value: '15d', label: '15 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-sooty">
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
              Design Velocity Overview
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
          <div
            title="Across all connected channels in selected time window."
            className="bg-dire-wolf p-5 rounded-[24px] border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-xl group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Total Ingested</span>
              <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center border border-accent/20 group-hover:scale-110 transition-transform">
                <BarChart3 size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-white tracking-tight">{kpiMetrics.total}</span>
              {kpiMetrics.volumeGrowth !== null && (
                <span
                  className={`text-xs font-extrabold flex items-center px-2 py-0.5 rounded-md border ${
                    kpiMetrics.volumeGrowth >= 0
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}
                >
                  {kpiMetrics.volumeGrowth >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {kpiMetrics.volumeGrowth >= 0 ? '+' : ''}{kpiMetrics.volumeGrowth}%
                </span>
              )}
            </div>
          </div>

          {/* Tile 2: Resolution Rate */}
          <div
            title={`Resolved ${kpiMetrics.resolved} of ${kpiMetrics.total} total items across all connected channels.`}
            className="bg-dire-wolf p-5 rounded-[24px] border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-xl group relative overflow-hidden"
          >
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
                {kpiMetrics.resolved} resolved
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
          <div
            title="Time from feedback ingestion to design resolution."
            className="bg-dire-wolf p-5 rounded-[24px] border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-xl group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Avg. Turnaround</span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Clock size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-white tracking-tight">{kpiMetrics.avgTurnaround}</span>
              {kpiMetrics.turnaroundDiff !== null && (
                <span
                  className={`text-xs font-extrabold flex items-center px-2 py-0.5 rounded-md border ${
                    kpiMetrics.turnaroundDiff <= 0
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-red-400 bg-red-500/10 border-red-500/20'
                  }`}
                >
                  {kpiMetrics.turnaroundDiff <= 0 ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
                  {kpiMetrics.turnaroundDiff > 0 ? '+' : ''}{kpiMetrics.turnaroundDiff}d
                </span>
              )}
            </div>
          </div>

          {/* Tile 4: Blocking Attention Required */}
          <div
            title="High-priority design issues pending immediate review."
            className="bg-dire-wolf p-5 rounded-[24px] border border-white/[0.06] hover:border-white/15 transition-all duration-300 shadow-xl group relative overflow-hidden"
          >
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
          </div>
        </div>

        {/* Row 2: Ingestion Velocity & Top 5 Projects KPI Tile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel 1 (Left 2 Cols): Daily/Weekly Velocity */}
          <div
            title={`Volume of incoming design feedback over selected timeline. Average velocity: ${velocity.avg} items / period. Total in window: ${kpiMetrics.total} items.`}
            className="bg-dire-wolf p-6 rounded-[24px] border border-white/[0.06] shadow-2xl flex flex-col lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <TrendingUp size={18} className="text-accent" />
                <span>Ingestion Velocity ({durationOptions.find(d => d.value === timeDuration)?.label})</span>
              </h2>
              <span className="text-xs font-bold bg-sooty px-3 py-1 rounded-xl text-chestnut border border-white/[0.05]">
                Peak: <strong className="text-white">{velocity.peak} item{velocity.peak !== 1 ? 's' : ''}</strong>
              </span>
            </div>

            {/* Bar Chart Area (flex-1 to grow and fill available card height) */}
            <div className="flex-1 flex flex-col justify-end min-h-[240px] pt-4">
              {/* Bars Container with bottom border (x-axis baseline) */}
              <div className="flex-1 flex items-end justify-between gap-2 px-2 border-b border-white/[0.1] pb-0">
                {velocity.bars.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-extrabold text-white bg-sooty px-2 py-1 rounded-md border border-white/[0.15] mb-1.5 shadow-xl whitespace-nowrap absolute -top-8 z-20 pointer-events-none">
                      {d.volume} {d.volume === 1 ? 'item' : 'items'}
                    </div>
                    <div
                      className="w-full max-w-[36px] bg-gradient-to-t from-accent/50 to-accent rounded-t-lg group-hover:brightness-125 group-hover:from-accent transition-all duration-300 shadow-md shadow-accent/10"
                      style={{ height: `${Math.max(d.heightPercent, 3)}%` }}
                    />
                  </div>
                ))}
              </div>

              {/* X-Axis Labels below the baseline */}
              <div className="flex items-center justify-between gap-2 px-2 pt-3">
                {velocity.bars.map((d, i) => (
                  <span key={i} className="flex-1 text-[11px] font-bold text-chestnut text-center truncate">
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Panel 2 (Right 1 Col): Top 5 Projects KPI Tile (Interactive!) */}
          <div
            title="Showing top active workspaces by total feedback. Click any project row to view its filtered active board."
            className="bg-dire-wolf p-6 rounded-[24px] border border-white/[0.06] shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <FolderGit2 size={18} className="text-emerald-400" />
                  <span>Top 5 Projects</span>
                </h2>
              </div>

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
          </div>
        </div>

        {/* Row 3: Channel Share & Interactive Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channel Ingestion Share (1 Col) */}
          <div
            title={`Where your design feedback originates. Primary source: ${[...channelStats].sort((a, b) => b.count - a.count)[0]?.channel ?? '—'}`}
            className="bg-dire-wolf p-6 rounded-[24px] border border-white/[0.06] shadow-2xl flex flex-col justify-between"
          >
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight mb-5">
                Channel Ingestion Share
              </h2>

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
          </div>

          {/* Interactive Category Distribution (2 Cols) */}
          <div
            title="Taxonomy standard: Loop v2.4 Classification. Click any category card to open the Kanban board filtered by that classification."
            className="bg-dire-wolf p-6 rounded-[24px] border border-white/[0.06] shadow-2xl lg:col-span-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-white tracking-tight">
                    Feedback Category Distribution
                  </h2>
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
          </div>
        </div>
      </div>
    </div>
  );
}
