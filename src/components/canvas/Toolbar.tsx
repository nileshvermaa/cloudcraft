'use client';

import Link from 'next/link';
import { Play, RotateCcw, ChevronLeft } from 'lucide-react';
import { PillButton } from '@/components/ui/PillButton';
import { useGameStore } from '@/store/useGameStore';

interface ToolbarProps {
  title?: string;
  backHref?: string;
}

export function Toolbar({ title, backHref = '/' }: ToolbarProps) {
  const { isSimulating, runSimulation, reset, mode } = useGameStore();

  return (
    <div
      className="flex items-center gap-3 px-4 h-14 flex-shrink-0 relative z-20"
      style={{
        background: 'var(--color-panel)',
        borderBottom: '1px solid var(--color-panel-line)',
      }}
    >
      {/* Back link */}
      <Link
        href={backHref}
        className="flex items-center gap-1 text-[13px] font-bold rounded-full pl-2 pr-3.5 py-1.5 transition-colors"
        style={{ color: '#5B5470', background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}
      >
        <ChevronLeft size={15} />
        {mode === 'sandbox' ? 'Menu' : 'Missions'}
      </Link>

      {/* Wordmark + scene name */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {/* Iso cloud-stack glyph */}
        <svg width="22" height="22" viewBox="0 0 32 32" className="flex-shrink-0">
          <polygon points="16,3 29,10 16,17 3,10" fill="#1DD3A0" />
          <polygon points="3,10 16,17 16,27 3,20" fill="#19B98C" />
          <polygon points="29,10 16,17 16,27 29,20" fill="#16A47D" />
        </svg>
        <span
          className="text-[17px] font-semibold flex-shrink-0"
          style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}
        >
          CloudCraft
        </span>
        <span className="text-[15px] flex-shrink-0" style={{ color: '#C9BFA6' }}>
          ·
        </span>
        <span
          className="text-[14px] font-bold truncate"
          style={{ fontFamily: 'var(--font-sans)', color: '#9A92AD' }}
        >
          {title ?? (mode === 'sandbox' ? 'Sandbox' : 'Scenario')}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        <PillButton
          variant="secondary"
          size="sm"
          icon={<RotateCcw size={14} />}
          onClick={reset}
          disabled={isSimulating}
        >
          Reset
        </PillButton>

        <PillButton
          variant="primary"
          size="md"
          icon={!isSimulating ? <Play size={16} fill="currentColor" /> : undefined}
          loading={isSimulating}
          onClick={runSimulation}
        >
          {isSimulating ? 'Running…' : 'Run'}
        </PillButton>
      </div>
    </div>
  );
}
