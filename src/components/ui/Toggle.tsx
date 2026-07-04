'use client';

interface ToggleProps {
  options: [string, string];
  active: 0 | 1;
  onChange: (index: 0 | 1) => void;
}

export default function Toggle({ options, active, onChange }: ToggleProps) {
  return (
    <div className="inline-flex items-center rounded-full bg-sooty/80 border border-white/[0.08] p-0.5 text-[10px] font-bold shadow-inner">
      {options.map((option, i) => (
        <button
          key={option}
          onClick={() => onChange(i as 0 | 1)}
          className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
            active === i
              ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.1]'
              : 'text-chestnut hover:text-white'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
