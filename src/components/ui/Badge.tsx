import { FeedbackSource, Severity } from '@/types';

type BadgeVariant = 'source' | 'severity' | 'duplicate' | 'project' | 'status' | 'nudge';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  source?: FeedbackSource;
  severity?: Severity;
  color?: string;
}

const sourceStyles: Record<FeedbackSource, string> = {
  slack: 'bg-source-slack/15 text-source-slack border-source-slack/30',
  figma: 'bg-source-figma/15 text-source-figma border-source-figma/30',
  manual: 'bg-source-manual/15 text-source-manual border-source-manual/30',
};

const sourceIcons: Record<FeedbackSource, string> = {
  slack: '#',
  figma: '◆',
  manual: '✎',
};

const severityStyles: Record<Severity, string> = {
  blocking: 'bg-status-blocking/15 text-status-blocking border-status-blocking/30',
  minor: 'bg-status-minor/15 text-status-minor border-status-minor/30',
  nice_to_have: 'bg-status-nice/15 text-status-nice border-status-nice/30',
};

export default function Badge({ variant, label, source, severity, color }: BadgeProps) {
  let classes = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold leading-none whitespace-nowrap border border-white/[0.06] shadow-sm';

  switch (variant) {
    case 'source':
      classes += ` ${source ? sourceStyles[source] : 'bg-white/10 text-chestnut border-white/10'}`;
      return (
        <span className={classes}>
          <span className="text-[10px]">{source ? sourceIcons[source] : ''}</span>
          {label}
        </span>
      );

    case 'severity':
      classes += ` ${severity ? severityStyles[severity] : ''}`;
      return <span className={classes}>{label}</span>;

    case 'duplicate':
      classes += ' bg-status-minor/15 text-status-minor border-status-minor/40 animate-pulse';
      return (
        <span className={classes}>
          <span className="text-[10px]">⚠</span>
          {label}
        </span>
      );

    case 'project':
      return (
        <span
          className={classes}
          style={{
            backgroundColor: color ? `${color}18` : undefined,
            color: color || undefined,
            borderColor: color ? `${color}30` : undefined,
          }}
        >
          {label}
        </span>
      );

    case 'nudge':
      classes += ' bg-status-nice/15 text-status-nice border-status-nice/30';
      return (
        <span className={classes}>
          <span className="text-[10px]">✓</span>
          {label}
        </span>
      );

    default:
      classes += ' bg-white/10 text-chestnut border-white/10';
      return <span className={classes}>{label}</span>;
  }
}
