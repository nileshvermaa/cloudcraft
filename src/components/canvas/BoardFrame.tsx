'use client';

import { useState, type ReactNode } from 'react';
import { Toolbar } from './Toolbar';
import { Palette } from './Palette';
import { ChaosBanner } from './ChaosBanner';
import { useGameStore } from '@/store/useGameStore';
import { cn } from '@/lib/utils';

interface BoardFrameProps {
  title?: string;
  backHref?: string;
  /** palette-theme class (theme-candy etc.) applied to the whole board */
  themeClass?: string;
  /** scene-tint class (scene-vanilla etc.) applied to the canvas area */
  sceneClass?: string;
  /** right-rail content (the aside chrome is provided here) */
  rail: ReactNode;
  /** canvas-area content: FlowCanvas + CastBar + any in-canvas overlays */
  children: ReactNode;
}

/**
 * Responsive board shell.
 * - lg and up: fixed three columns (palette | canvas | rail).
 * - below lg (tablet/phone): canvas is full width; palette and rail become
 *   slide-in drawers toggled from the toolbar, with a tap-to-dismiss scrim.
 */
export function BoardFrame({ title, backHref = '/', themeClass = '', sceneClass = '', rail, children }: BoardFrameProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const closeAll = () => {
    setPaletteOpen(false);
    setRailOpen(false);
  };

  // Screen-reader summary of the current architecture + last result.
  const { nodes, edges, result } = useGameStore();
  const summary =
    `${nodes.length} tile${nodes.length === 1 ? '' : 's'} placed, ` +
    `${edges.length} connection${edges.length === 1 ? '' : 's'}. ` +
    (result
      ? `Last run scored grade ${result.grade}: serving ${Math.round(result.servedRps).toLocaleString()} requests per second at ${result.errorRatePct.toFixed(1)} percent errors.`
      : 'Not yet run.');

  return (
    <div className={cn('flex flex-col h-dvh overflow-hidden', themeClass)}>
      <Toolbar
        title={title}
        backHref={backHref}
        onTogglePalette={() => { setPaletteOpen((o) => !o); setRailOpen(false); }}
        onToggleRail={() => { setRailOpen((o) => !o); setPaletteOpen(false); }}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Palette — static column on lg, left drawer below */}
        <aside
          className={cn(
            'h-full flex-shrink-0 z-30 overflow-hidden transition-transform duration-300 ease-out',
            'w-[264px] lg:w-[240px]',
            'absolute left-0 top-0 bottom-0 lg:static',
            paletteOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <Palette onPlace={() => setPaletteOpen(false)} />
        </aside>

        {/* Canvas */}
        <div className={cn('flex-1 h-full relative min-w-0', sceneClass)} role="region" aria-label="Architecture board">
          <div className="sr-only" role="status" aria-live="polite">{summary}</div>
          {children}
          <ChaosBanner />
        </div>

        {/* Right rail — static column on lg, right drawer below */}
        <aside
          className={cn(
            'h-full flex-shrink-0 z-30 flex flex-col overflow-hidden chrome-panel transition-transform duration-300 ease-out',
            'w-[300px] lg:w-[280px]',
            'absolute right-0 top-0 bottom-0 lg:static border-l border-[var(--color-panel-line)]',
            railOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'
          )}
        >
          {rail}
        </aside>

        {/* Scrim — only when a drawer is open below lg */}
        {(paletteOpen || railOpen) && (
          <div
            className="absolute inset-0 z-20 lg:hidden"
            style={{ background: 'rgba(27,23,51,0.25)' }}
            onClick={closeAll}
          />
        )}
      </div>
    </div>
  );
}
