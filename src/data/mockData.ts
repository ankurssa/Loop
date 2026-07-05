import { FeedbackItem, Project, DigestData } from '@/types';

// ── Projects ──
export const projects: Project[] = [
  { id: 'itdr', name: 'ITDR', color: '#B55933' },
  { id: 'ispm', name: 'ISPM', color: '#4E9AF1' },
  { id: 'general', name: 'General', color: '#52B788' },
];

// ── Helper: relative date ──
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function hoursAgo(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

// ── Status transition map (what statuses can move to what) ──
export const statusTransitions: Record<FeedbackItem['status'], FeedbackItem['status'][]> = {
  open: ['in_progress', 'resolved', 'wont_fix'],
  in_progress: ['open', 'resolved', 'wont_fix'],
  resolved: ['open', 'in_progress', 'archived'],
  wont_fix: ['open'],
  archived: ['open'],
};

export const statusLabels: Record<FeedbackItem['status'], string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  wont_fix: "Won't Fix",
  archived: 'Archived',
};

// ── Mock Feedback Items ──
export const feedbackItems: FeedbackItem[] = [
  // ── OPEN ──
  {
    id: 'fb-001',
    title: 'Dashboard chart tooltip is clipped on mobile',
    description: 'The tooltip overflows the viewport on screens < 375px. Need to check the `getBoundingClientRect()` offset logic in the `<ChartTooltip>` component.',
    translatedDescription: 'The info popup on the chart gets cut off on small phone screens. The positioning logic needs fixing.',
    status: 'open',
    source: 'slack',
    project: 'ITDR',
    author: 'Priya Sharma',
    createdAt: hoursAgo(2),
    lastUpdated: hoursAgo(2),
    isTechnical: true,
    isDuplicate: false,
    severity: 'minor',
  },
  {
    id: 'fb-002',
    title: 'Add dark mode support to settings page',
    description: 'Settings page currently only has a light theme. Need to add theme toggle and respect system preference.',
    status: 'open',
    source: 'figma',
    project: 'ISPM',
    author: 'Alex Chen',
    createdAt: hoursAgo(5),
    lastUpdated: hoursAgo(5),
    isTechnical: false,
    isDuplicate: false,
    severity: 'nice_to_have',
  },
  {
    id: 'fb-003',
    title: 'Contrast ratio on muted labels fails WCAG AA',
    description: 'The `text-muted` token maps to `#999` on `#282828` bg which gives only 3.2:1 contrast. WCAG AA requires 4.5:1 for normal text.',
    translatedDescription: 'The gray label text is too hard to read on the dark background. It doesn\'t meet accessibility standards — needs to be lighter.',
    status: 'open',
    source: 'manual',
    project: 'ITDR',
    author: 'Jordan Lee',
    createdAt: daysAgo(9),
    lastUpdated: daysAgo(7),
    isTechnical: true,
    isDuplicate: false,
    severity: 'blocking',
  },
  {
    id: 'fb-004',
    title: 'Logo looks pixelated on retina displays',
    description: 'We need a 2x version of the logo SVG or a higher-res PNG for HiDPI screens.',
    status: 'open',
    source: 'slack',
    project: 'General',
    author: 'Sam Rivera',
    createdAt: daysAgo(10),
    lastUpdated: daysAgo(8),
    isTechnical: false,
    isDuplicate: true,
    duplicateOf: 'fb-012',
    severity: 'minor',
  },

  // ── IN PROGRESS ──
  {
    id: 'fb-005',
    title: 'Refactor sidebar nav to use compound component pattern',
    description: 'Currently the sidebar is one monolithic component with prop drilling 4 levels deep. Should extract `<NavGroup>`, `<NavItem>`, `<NavBadge>` as composable children.',
    translatedDescription: 'The sidebar code is hard to work with because everything is in one big file. Breaking it into smaller, reusable pieces will make it easier to update.',
    status: 'in_progress',
    source: 'slack',
    project: 'ISPM',
    author: 'Maya Patel',
    createdAt: daysAgo(1),
    lastUpdated: hoursAgo(3),
    isTechnical: true,
    isDuplicate: false,
    severity: 'minor',
  },
  {
    id: 'fb-006',
    title: 'Filter dropdown not clearing selection on reset',
    description: 'When you click "Reset filters", the project dropdown still shows the previously selected value. State isn\'t syncing back.',
    status: 'in_progress',
    source: 'figma',
    project: 'ITDR',
    author: 'Chris Taylor',
    createdAt: daysAgo(2),
    lastUpdated: daysAgo(1),
    isTechnical: false,
    isDuplicate: false,
    severity: 'minor',
  },
  {
    id: 'fb-007',
    title: 'Empty state illustration needed for board view',
    description: 'When there are no cards in a column, show a helpful illustration + message instead of blank space.',
    status: 'in_progress',
    source: 'manual',
    project: 'General',
    author: 'Taylor Kim',
    createdAt: daysAgo(10),
    lastUpdated: daysAgo(6),
    isTechnical: false,
    isDuplicate: false,
    severity: 'nice_to_have',
  },

  // ── RESOLVED ──
  {
    id: 'fb-008',
    title: 'Fix z-index stacking on modal overlay',
    description: 'The modal backdrop renders behind the sidebar because `z-index: 40` on `.sidebar` conflicts with the modal\'s `z-index: 30`. Bumped modal to `z-50`.',
    translatedDescription: 'The dark overlay behind popups was appearing behind the sidebar instead of on top. Fixed by adjusting the layering order.',
    status: 'resolved',
    source: 'slack',
    project: 'ITDR',
    author: 'Priya Sharma',
    createdAt: daysAgo(5),
    lastUpdated: daysAgo(1),
    resolvedAt: daysAgo(1),
    isTechnical: true,
    isDuplicate: false,
    severity: 'blocking',
  },
  {
    id: 'fb-009',
    title: 'Update onboarding copy for new pricing tier',
    description: 'Changed "Free plan" to "Starter plan" across all onboarding screens. Updated 3 pages.',
    status: 'resolved',
    source: 'manual',
    project: 'ISPM',
    author: 'Alex Chen',
    createdAt: daysAgo(4),
    lastUpdated: daysAgo(2),
    resolvedAt: daysAgo(2),
    isTechnical: false,
    isDuplicate: false,
    severity: 'minor',
  },
  {
    id: 'fb-010',
    title: 'Card hover state too subtle',
    description: 'Increased border opacity and added a slight scale transform on hover for better visual feedback.',
    status: 'resolved',
    source: 'figma',
    project: 'General',
    author: 'Jordan Lee',
    createdAt: daysAgo(6),
    lastUpdated: daysAgo(3),
    resolvedAt: daysAgo(3),
    isTechnical: false,
    isDuplicate: false,
    severity: 'nice_to_have',
  },
  {
    id: 'fb-011',
    title: 'Button padding inconsistent between primary and secondary',
    description: 'Primary button had 12px/24px padding, secondary had 10px/20px. Standardized both to 12px/24px.',
    status: 'resolved',
    source: 'slack',
    project: 'ITDR',
    author: 'Sam Rivera',
    createdAt: daysAgo(7),
    lastUpdated: daysAgo(4),
    resolvedAt: daysAgo(4),
    isTechnical: false,
    isDuplicate: false,
    severity: 'minor',
  },

  // ── WON'T FIX ──
  {
    id: 'fb-012',
    title: 'Request: animated page transitions',
    description: 'User requested slide-in/out transitions between pages. Decided against it — adds complexity and potential jank for minimal UX gain.',
    status: 'wont_fix',
    source: 'slack',
    project: 'General',
    author: 'Maya Patel',
    createdAt: daysAgo(8),
    lastUpdated: daysAgo(5),
    isTechnical: false,
    isDuplicate: false,
    severity: 'nice_to_have',
  },
  {
    id: 'fb-013',
    title: 'Support IE11 for admin panel',
    description: 'Stakeholder requested IE11 support. IE11 is EOL and has < 0.3% traffic on our analytics. Not worth the polyfill overhead.',
    status: 'wont_fix',
    source: 'manual',
    project: 'ISPM',
    author: 'Chris Taylor',
    createdAt: daysAgo(10),
    lastUpdated: daysAgo(7),
    isTechnical: false,
    isDuplicate: false,
    severity: 'minor',
  },
  {
    id: 'fb-014',
    title: 'Add gradient mesh backgrounds to all cards',
    description: 'Design exploration: mesh gradients on every card. Rejected — too noisy, hurts readability, and increases paint cost.',
    status: 'wont_fix',
    source: 'figma',
    project: 'ITDR',
    author: 'Taylor Kim',
    createdAt: daysAgo(12),
    lastUpdated: daysAgo(8),
    isTechnical: false,
    isDuplicate: true,
    duplicateOf: 'fb-010',
    severity: 'nice_to_have',
  },

  // ── ARCHIVED (resolved 7+ days ago) ──
  {
    id: 'fb-015',
    title: 'Fix broken link in footer navigation',
    description: 'The "Terms of Service" link in the footer was pointing to a 404. Updated to the correct URL.',
    status: 'archived',
    source: 'slack',
    project: 'General',
    author: 'Priya Sharma',
    createdAt: daysAgo(20),
    lastUpdated: daysAgo(15),
    resolvedAt: daysAgo(15),
    isTechnical: false,
    isDuplicate: false,
    severity: 'minor',
  },
  {
    id: 'fb-016',
    title: 'Typography scale inconsistent across dashboard widgets',
    description: 'Standardized all widget headings to use the h4 token (16px/600) and body text to body-sm (13px/400).',
    status: 'archived',
    source: 'figma',
    project: 'ITDR',
    author: 'Jordan Lee',
    createdAt: daysAgo(25),
    lastUpdated: daysAgo(18),
    resolvedAt: daysAgo(18),
    isTechnical: false,
    isDuplicate: false,
    severity: 'minor',
  },
  {
    id: 'fb-017',
    title: 'Remove deprecated API endpoint from client SDK',
    description: 'The v1 `/feedback/submit` endpoint was still referenced in the SDK. Migrated all calls to v2 `/feedback/create`.',
    status: 'archived',
    source: 'manual',
    project: 'ISPM',
    author: 'Maya Patel',
    createdAt: daysAgo(30),
    lastUpdated: daysAgo(22),
    resolvedAt: daysAgo(22),
    isTechnical: true,
    isDuplicate: false,
    severity: 'blocking',
  },
  // ── CLOUD DIRECTORY ITEMS ──
  {
    id: 'fb-018',
    title: 'Refine SSO login screen typography and spacing',
    description: 'Adjust heading hierarchies and input field padding on the enterprise authentication gateway for better readability.',
    status: 'open',
    source: 'figma',
    project: 'Cloud Directory',
    author: 'Sarah Chen',
    createdAt: hoursAgo(6),
    lastUpdated: hoursAgo(6),
    isTechnical: false,
    isDuplicate: false,
    severity: 'minor',
  },
  {
    id: 'fb-019',
    title: 'Resolve SCIM sync status indicator badge color contrast',
    description: 'Ensure directory sync error badges use #EF4444 with high contrast text for accessibility compliance.',
    status: 'resolved',
    source: 'slack',
    project: 'Cloud Directory',
    author: 'Alex Rivera',
    createdAt: daysAgo(3),
    lastUpdated: daysAgo(1),
    resolvedAt: daysAgo(1),
    isTechnical: true,
    isDuplicate: false,
    severity: 'blocking',
  },
  // ── DEVICE MANAGEMENT ITEMS ──
  {
    id: 'fb-020',
    title: 'Add device enrollment qr-code modal animation',
    description: 'Implement smooth scale-in and fade transition when launching the QR code enrollment modal on desktop portal.',
    status: 'in_progress',
    source: 'figma',
    project: 'Device Management',
    author: 'Elena Rostova',
    createdAt: daysAgo(2),
    lastUpdated: hoursAgo(8),
    isTechnical: false,
    isDuplicate: false,
    severity: 'nice_to_have',
  },
  {
    id: 'fb-021',
    title: 'Fix telemetry chart data point clipping on retina displays',
    description: 'Canvas rendering scale factor needs adjustment for high-DPI screens in the device health telemetry dashboard.',
    status: 'resolved',
    source: 'slack',
    project: 'Device Management',
    author: 'David Kim',
    createdAt: daysAgo(6),
    lastUpdated: daysAgo(2),
    resolvedAt: daysAgo(2),
    isTechnical: true,
    isDuplicate: false,
    severity: 'minor',
  },
];

export function getItemsByStatus(status: FeedbackItem['status'], sourceItems = feedbackItems): FeedbackItem[] {
  return sourceItems.filter((item) => item.status === status);
}

/** Items eligible for the active board (excludes archived) */
export function getBoardItems(sourceItems = feedbackItems): FeedbackItem[] {
  return sourceItems.filter((item) => item.status !== 'archived');
}

/** Archived items (resolved 7+ days ago) */
export function getArchivedItems(sourceItems = feedbackItems): FeedbackItem[] {
  return sourceItems.filter((item) => item.status === 'archived');
}

export function getStaleItems(sourceItems = feedbackItems, thresholdDays: number = 5): FeedbackItem[] {
  const now = new Date();
  return sourceItems.filter((item) => {
    if (item.status === 'resolved' || item.status === 'wont_fix' || item.status === 'archived') return false;
    const daysSinceUpdate = Math.floor(
      (now.getTime() - item.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate >= thresholdDays;
  });
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1d ago';
  return `${diffDays}d ago`;
}

export function getDaysSinceUpdate(date: Date): number {
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/** Search items by title or description */
export function searchItems(items: FeedbackItem[], query: string): FeedbackItem[] {
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      item.project.toLowerCase().includes(q)
  );
}

// ── Digest Data ──
export function getDigestData(sourceItems = feedbackItems): DigestData {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    date: dateStr,
    counts: {
      open: getItemsByStatus('open', sourceItems).length,
      in_progress: getItemsByStatus('in_progress', sourceItems).length,
      resolved: getItemsByStatus('resolved', sourceItems).length,
      wont_fix: getItemsByStatus('wont_fix', sourceItems).length,
      archived: getArchivedItems(sourceItems).length,
    },
    newItems: sourceItems.filter((item) => {
      const hoursSinceCreated =
        (new Date().getTime() - item.createdAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceCreated <= 24;
    }),
    staleItems: getStaleItems(sourceItems, 5),
  };
}
