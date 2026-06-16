'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionText: string;
  onClick: () => void;
  accentColor?: string;
}

export function ModeCard({
  title,
  description,
  icon,
  actionText,
  onClick,
  accentColor = 'var(--color-cat-source)',
}: ModeCardProps) {
  const isSandbox = title.toLowerCase().includes('sandbox');

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden group cursor-pointer border border-[var(--color-chrome-border)] bg-[#1B1F2E]/65 backdrop-blur-md p-6 flex flex-col justify-between h-[340px] rounded-xl select-none transition-all duration-300",
        "hover:border-slate-500/60 hover:[transform:perspective(1000px)_rotateX(3deg)_translateY(-8px)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
      )}
      style={{
        boxShadow: `inset 3px 0 0 0 ${accentColor}, 0 4px 20px rgba(0,0,0,0.15)`,
      }}
    >
      {/* Decorative high-tech grid background inside card */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity" />

      {/* Isometric SVG graphic hero for the game modes */}
      <div className="w-full h-28 relative flex items-center justify-center bg-slate-950/45 border border-slate-900/60 rounded-lg p-2 overflow-hidden shadow-inner group-hover:bg-slate-950/70 transition-colors">
        {isSandbox ? (
          /* Sandbox Hero: 3 wired isometric cubes representing compute/storage/loadbalancer */
          <svg className="w-full h-full max-w-[180px] drop-shadow-[0_4px_10px_rgba(20,184,166,0.15)]" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Grid base */}
            <polygon points="50,45 80,30 50,15 20,30" fill="none" stroke="rgba(20,184,166,0.12)" strokeWidth="0.8" />
            
            {/* Wires */}
            <path d="M35,32 L50,39.5 L65,32" stroke="#14B8A6" strokeWidth="1.5" strokeDasharray="3 2" className="conduit-animated" />
            
            {/* LB Tile */}
            <g transform="translate(18, 10)">
              <polygon points="16,3 29,10 16,17 3,10" fill="#312E81" />
              <polygon points="3,10 16,17 16,24 3,17" fill="#1E1B4B" />
              <polygon points="29,10 16,17 16,24 29,17" fill="#3730A3" />
              <circle cx="16" cy="10" r="2.5" fill="#8B5CF6" className="animate-pulse" />
            </g>

            {/* Compute Instance Left */}
            <g transform="translate(35, 20)">
              <polygon points="16,3 29,10 16,17 3,10" fill="#0D9488" />
              <polygon points="3,10 16,17 16,24 3,17" fill="#0F766E" />
              <polygon points="29,10 16,17 16,24 29,17" fill="#14B8A6" />
              <polygon points="16,7 23,10.5 16,14 9,10.5" fill="#2DD4BF" opacity="0.6" />
            </g>
          </svg>
        ) : (
          /* Scenario Hero: Alert state being diagnostic-routed */
          <svg className="w-full h-full max-w-[180px] drop-shadow-[0_4px_10px_rgba(99,102,241,0.15)]" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="50,45 80,30 50,15 20,30" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="0.8" />
            
            {/* Broken red wire path */}
            <path d="M35,28 L50,20.5" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="2 2" />
            {/* Re-routed green path */}
            <path d="M35,28 L50,35.5 L65,28" stroke="#10B981" strokeWidth="1.8" className="conduit-animated" />

            {/* Source Tile (left) */}
            <g transform="translate(18, 14)">
              <polygon points="16,3 29,10 16,17 3,10" fill="#4F46E5" />
              <polygon points="3,10 16,17 16,24 3,17" fill="#3730A3" />
              <polygon points="29,10 16,17 16,24 29,17" fill="#6366F1" />
            </g>

            {/* Overloaded red destination (right top) */}
            <g transform="translate(50, 2)">
              <polygon points="16,3 29,10 16,17 3,10" fill="#991B1B" />
              <polygon points="3,10 16,17 16,24 3,17" fill="#7F1D1D" />
              <polygon points="29,10 16,17 16,24 29,17" fill="#EF4444" className="tile-overloaded" />
            </g>

            {/* Healthy backup destination (right bottom) */}
            <g transform="translate(50, 19)">
              <polygon points="16,3 29,10 16,17 3,10" fill="#065F46" />
              <polygon points="3,10 16,17 16,24 3,17" fill="#064E3B" />
              <polygon points="29,10 16,17 16,24 29,17" fill="#10B981" />
            </g>
          </svg>
        )}
      </div>

      <div className="mt-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[var(--color-chrome-bright)] opacity-90">{icon}</span>
          <h3 className="font-display text-lg font-black text-[var(--color-chrome-bright)] tracking-wide">
            {title}
          </h3>
        </div>
        
        <p className="text-[12.5px] text-[var(--color-chrome-text)]/90 leading-relaxed font-medium">
          {description}
        </p>
      </div>
      
      {/* Chunky 3D game style button CTA */}
      <button 
        className={cn(
          "w-full h-10 font-black text-xs uppercase tracking-wider flex items-center justify-center rounded-md border text-slate-950 transition-all",
          isSandbox 
            ? "bg-teal-400 border-teal-500 hover:bg-teal-300 shadow-[0_3px_0_#0D9488] active:shadow-none active:translate-y-[3px]"
            : "bg-indigo-400 border-indigo-500 hover:bg-indigo-300 shadow-[0_3px_0_#4338CA] active:shadow-none active:translate-y-[3px]"
        )}
      >
        {actionText}
      </button>
    </Card>
  );
}
