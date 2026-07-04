import { Severity } from '@/types';

const dotColors: Record<Severity, string> = {
  blocking: 'bg-status-blocking',
  minor: 'bg-status-minor',
  nice_to_have: 'bg-status-nice',
};

const labels: Record<Severity, string> = {
  blocking: 'Blocking',
  minor: 'Minor',
  nice_to_have: 'Nice to have',
};

interface StatusIndicatorProps {
  severity: Severity;
  showLabel?: boolean;
}

export default function StatusIndicator({ severity, showLabel = false }: StatusIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[severity]}`} />
      {showLabel && (
        <span className="text-[11px] text-chestnut">{labels[severity]}</span>
      )}
    </span>
  );
}
