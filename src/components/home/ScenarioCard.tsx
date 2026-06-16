'use client';

import { Card } from '@/components/ui/card';
import type { Scenario } from '@/types';
import { Target, Clock, DollarSign, Award } from 'lucide-react';
import { formatRps, formatMs, formatUsd } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ScenarioCardProps {
  scenario: Scenario;
  bestScore?: number;
  onClick: () => void;
}

export function ScenarioCard({ scenario, bestScore, onClick }: ScenarioCardProps) {
  const getDifficultyColor = (diff: Scenario['difficulty']) => {
    switch (diff) {
      case 'Beginner':
        return '#22C55E';
      case 'Intermediate':
        return '#3B82F6';
      case 'Advanced':
        return '#F59E0B';
      case 'Expert':
        return '#EF4444';
    }
  };

  const getGrade = (score: number) => {
    if (score >= 95) return { label: 'S', color: 'text-[#10B981] border-[#10B981]/30 bg-emerald-950/40' };
    if (score >= 85) return { label: 'A', color: 'text-[#3B82F6] border-[#3B82F6]/30 bg-blue-950/40' };
    if (score >= 70) return { label: 'B', color: 'text-[#8B5CF6] border-[#8B5CF6]/30 bg-indigo-950/40' };
    if (score >= 50) return { label: 'C', color: 'text-[#F59E0B] border-[#F59E0B]/30 bg-amber-950/40' };
    return { label: 'F', color: 'text-[#EF4444] border-[#EF4444]/30 bg-red-950/40' };
  };

  const grade = bestScore !== undefined ? getGrade(bestScore) : null;
  const pipColor = getDifficultyColor(scenario.difficulty);
  const diffPips: Record<string, number> = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4,
  };
  const pips = diffPips[scenario.difficulty] ?? 1;

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer border border-[var(--color-chrome-border)] bg-[#1B1F2E]/75 p-5 hover:shadow-lg hover:border-slate-500/60 transition-all duration-200 flex flex-col justify-between h-[240px] rounded-xl hover:-translate-y-0.5 select-none relative overflow-hidden"
      style={{
        boxShadow: `inset 3px 0 0 0 ${pipColor}, 0 4px 15px rgba(0,0,0,0.12)`,
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h4 className="font-display font-black text-[15px] text-[var(--color-chrome-bright)] group-hover:text-teal-400 transition-colors leading-tight">
            {scenario.title}
          </h4>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Difficulty pips */}
            <div className="flex items-center gap-1 bg-slate-900/60 border border-[var(--color-chrome-border)] px-1.5 py-0.5 rounded">
              {[1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rotate-45 border-[0.5px]"
                  style={{
                    backgroundColor: i <= pips ? pipColor : 'transparent',
                    borderColor: i <= pips ? pipColor : 'rgba(168, 180, 200, 0.3)',
                  }}
                />
              ))}
            </div>

            {grade && (
              <span className={cn("text-[9px] font-black font-mono border px-1.5 py-0.5 rounded uppercase tracking-wider", grade.color)}>
                Grade {grade.label}
              </span>
            )}
          </div>
        </div>

        <p className="text-[11.5px] text-[var(--color-chrome-text)]/85 leading-relaxed line-clamp-4">
          {scenario.brief}
        </p>
      </div>

      <div className="border-t border-[var(--color-chrome-border)]/65 pt-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-1" title="Target RPS">
            <Target size={11} className="text-teal-400" />
            <span className="text-[10px] font-bold font-mono text-[var(--color-chrome-bright)]">{formatRps(scenario.targetRps)}</span>
          </div>
          <div className="flex items-center gap-1" title="Max Latency">
            <Clock size={11} className="text-cyan-400" />
            <span className="text-[10px] font-bold font-mono text-[var(--color-chrome-bright)]">{formatMs(scenario.maxLatencyMs)}</span>
          </div>
          <div className="flex items-center gap-1" title="Budget">
            <DollarSign size={11} className="text-blue-400" />
            <span className="text-[10px] font-bold font-mono text-[var(--color-chrome-bright)]">{formatUsd(scenario.budgetUsd)}</span>
          </div>
        </div>
        
        {bestScore !== undefined && (
          <div className="flex items-center gap-1 text-teal-400 text-[10px] font-black font-mono bg-teal-950/35 border border-teal-500/20 px-2 py-0.5 rounded shadow-sm">
            <Award size={10} className="text-teal-400" />
            <span>{bestScore} PTS</span>
          </div>
        )}
      </div>
    </Card>
  );
}
