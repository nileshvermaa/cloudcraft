'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { ChevronLeft, Star, CheckCircle2, Play, Map as MapIcon } from 'lucide-react';
import { SCENARIOS } from '@/lib/scenarios';
import { useGameStore } from '@/store/useGameStore';
import { Nimbus } from '@/components/cast/CastRenderer';
import { PillButton } from '@/components/ui/PillButton';
import type { Scenario } from '@/types';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };
const PAGE_BG = 'linear-gradient(160deg, #E4F7EE 0%, #CFEFDD 60%, #C3EAD3 100%)';

// Serpentine geometry
const SIDE = 150;     // left/right margin
const TOP = 104;      // top margin (room for the sign above the first stop)
const BOT = 80;       // bottom margin
const ROW_SP = 190;   // vertical gap between stops in a column
const COL_SP = 240;   // horizontal gap between columns

const SCENE_COLORS: Record<string, { pin: string; glow: string }> = {
  Beginner:     { pin: '#1DD3A0', glow: 'rgba(29,211,160,0.45)' },
  Intermediate: { pin: '#22B8FF', glow: 'rgba(34,184,255,0.45)' },
  Advanced:     { pin: '#FF6FA5', glow: 'rgba(255,111,165,0.45)' },
  Expert:       { pin: '#9B5DE5', glow: 'rgba(155,93,229,0.45)' },
};
const PING_COLORS = ['#FF6B6B', '#FFD23D', '#4ECDC4', '#A78BFA', '#FF8FB1'];

/** Catmull-Rom → cubic bézier path through every point. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x} ${p2.y}`;
  }
  return d;
}

function DifficultyStars({ difficulty }: { difficulty: Scenario['difficulty'] }) {
  const count = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 }[difficulty];
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Star key={i} size={10} fill={i < count ? '#FFB81C' : 'transparent'} stroke={i < count ? '#FFB81C' : '#D8CFBE'} strokeWidth={1.5} />
      ))}
    </div>
  );
}

function GradePill({ grade }: { grade: string }) {
  const colors: Record<string, string> = { S: '#FFC83D', A: '#1DD3A0', B: '#22B8FF', C: '#FFB81C', F: '#FF4D4D' };
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-semibold text-white" style={{ backgroundColor: colors[grade] ?? '#C9BFA6', fontFamily: 'var(--font-display)' }}>
      {grade}
    </div>
  );
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={8} rx={13} ry={4} fill="rgba(27,23,51,0.07)" />
      <rect x={-3} y={-4} width={6} height={14} rx={2.5} fill="#C9A86A" />
      <circle cx={0} cy={-15} r={13} fill="#7FD3A2" />
      <circle cx={-9} cy={-7} r={9} fill="#93DBB2" />
      <circle cx={9} cy={-7} r={9} fill="#93DBB2" />
    </g>
  );
}

interface MarkerProps {
  scenario: Scenario;
  index: number;
  x: number;
  y: number;
  bestGrade: string | null;
  isSelected: boolean;
  onSelect: () => void;
}

function LocationMarker({ scenario, index, x, y, bestGrade, isSelected, onSelect }: MarkerProps) {
  const reduced = useReducedMotion();
  const colors = SCENE_COLORS[scenario.difficulty] ?? SCENE_COLORS.Beginner;
  const isCompleted = !!bestGrade;

  return (
    <motion.button
      onClick={onSelect}
      className="absolute flex flex-col items-center focus:outline-none"
      style={{ left: x, top: y, transform: 'translate(-50%, -100%)' }}
      initial={{ opacity: 0, scale: reduced ? 1 : 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0 } : { ...spring, delay: index * 0.04 }}
      whileHover={reduced ? {} : { scale: 1.09 }}
      whileTap={reduced ? {} : { scale: 0.95 }}
      title={scenario.title}
    >
      {/* Banner sign */}
      <div
        className="px-3 py-1.5 rounded-xl text-center mb-1 whitespace-nowrap"
        style={{
          background: '#FFF3DD',
          border: `1.5px solid ${isSelected ? colors.pin : 'var(--color-panel-line)'}`,
          boxShadow: isSelected ? `0 4px 14px ${colors.glow}` : '0 3px 8px rgba(27,23,51,0.10)',
        }}
      >
        <div className="text-[11px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
          {scenario.title}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-0.5">
          <DifficultyStars difficulty={scenario.difficulty} />
          {bestGrade && <GradePill grade={bestGrade} />}
        </div>
      </div>

      {/* Bobbing pin */}
      <motion.div
        animate={reduced ? {} : { y: isSelected ? [0, -6, 0] : [0, -3, 0] }}
        transition={{ duration: isSelected ? 1.1 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="-mb-1.5 z-10"
      >
        <div className="w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: colors.pin, boxShadow: `0 0 10px ${colors.glow}` }} />
      </motion.div>

      {/* ISO building */}
      <div className="relative">
        <svg width={76} height={76} viewBox="0 0 72 72">
          <ellipse cx={36} cy={64} rx={24} ry={6} fill="rgba(27,23,51,0.12)" />
          <polygon points="36,20 60,34 60,60 36,46" fill={colors.pin} opacity={0.6} />
          <polygon points="12,34 36,20 36,46 12,60" fill={colors.pin} opacity={0.78} />
          <polygon points="12,34 36,20 60,34 36,48" fill={colors.pin} />
          <rect x={18} y={38} width={8} height={8} rx={2} fill="white" opacity={0.5} />
          <rect x={30} y={38} width={8} height={8} rx={2} fill="white" opacity={0.5} />
          <rect x={18} y={50} width={8} height={6} rx={2} fill="white" opacity={0.5} />
          <rect x={30} y={50} width={8} height={6} rx={2} fill="white" opacity={0.5} />
        </svg>
        <div className="absolute -left-1 top-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: colors.pin, fontFamily: 'var(--font-jetbrains)', boxShadow: '0 2px 4px rgba(27,23,51,0.2)' }}>
          {index + 1}
        </div>
        {isCompleted && (
          <div className="absolute -right-1 top-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#1DD3A0', border: '2px solid #fff' }}>
            <CheckCircle2 size={13} color="white" />
          </div>
        )}
      </div>
    </motion.button>
  );
}

function MapPing({ color, path, dur, delay }: { color: string; path: string; dur: number; delay: number }) {
  return (
    <div
      className="absolute top-0 left-0 w-[22px] h-[22px]"
      style={{ offsetPath: `path("${path}")`, offsetRotate: '0deg', offsetAnchor: '50% 50%', animation: `road-travel ${dur}s linear ${delay}s infinite` }}
    >
      <svg width={22} height={22} viewBox="0 0 28 28" style={{ overflow: 'visible' }}>
        <ellipse cx={14} cy={20} rx={8} ry={2} fill="rgba(27,23,51,0.10)" />
        <ellipse cx={14} cy={13} rx={9} ry={8} fill={color} />
        <circle cx={10.5} cy={11} r={1.6} fill="#1B1733" />
        <circle cx={17.5} cy={11} r={1.6} fill="#1B1733" />
        <path d="M11 15 Q14 17.5 17 15" stroke="#1B1733" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function ScenariosPage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { bestScores, loadBestScores, loadScenario } = useGameStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const areaRef = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState({ w: 1024, h: 680 });

  useEffect(() => {
    loadBestScores();
  }, [loadBestScores]);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el) setArea({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function scoreToGrade(score: number): string {
    if (score >= 95) return 'S';
    if (score >= 80) return 'A';
    if (score >= 65) return 'B';
    if (score >= 45) return 'C';
    return 'F';
  }

  // Serpentine: snake down a column, U-turn, up the next — sized to fit the height.
  const rowsPerCol = Math.max(2, Math.min(6, Math.floor((area.h - TOP - BOT) / ROW_SP) + 1));
  const points = useMemo(() => {
    return SCENARIOS.map((_, i) => {
      const col = Math.floor(i / rowsPerCol);
      const k = i % rowsPerCol;
      const row = col % 2 === 0 ? k : rowsPerCol - 1 - k;
      return { x: SIDE + col * COL_SP, y: TOP + row * ROW_SP };
    });
  }, [rowsPerCol]);
  const roadPath = useMemo(() => smoothPath(points), [points]);

  const cols = Math.ceil(SCENARIOS.length / rowsPerCol);
  const mapWidth = Math.max(area.w, SIDE * 2 + (cols - 1) * COL_SP);
  const mapHeight = Math.max(area.h, TOP + (rowsPerCol - 1) * ROW_SP + BOT);

  // A few scattered trees that avoid the stops.
  const trees = useMemo(
    () => points.flatMap((p, i) => (i % 2 === 0
      ? [{ x: p.x + 96, y: p.y - 18, s: 0.95 }]
      : [{ x: p.x - 92, y: p.y + 26, s: 1.15 }])),
    [points]
  );

  const selectedScenario = SCENARIOS.find((s) => s.id === selectedId);

  const handleStart = () => {
    if (!selectedScenario) return;
    loadScenario(selectedScenario);
    router.push(`/scenario/${selectedScenario.id}`);
  };

  const completed = SCENARIOS.filter((s) => bestScores[s.id] !== undefined).length;
  const totalStars = SCENARIOS.reduce((sum, s) => {
    const sc = bestScores[s.id];
    return sum + (sc === undefined ? 0 : sc >= 80 ? 3 : sc >= 65 ? 2 : sc >= 45 ? 1 : 0);
  }, 0);

  const start = points[0] ?? { x: SIDE, y: TOP };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: PAGE_BG }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 h-14 flex-shrink-0 z-20"
        style={{ background: 'var(--color-panel)', borderBottom: '1px solid var(--color-panel-line)' }}
      >
        <Link href="/" className="flex items-center gap-1 text-[13px] font-bold rounded-full pl-2 pr-3.5 py-1.5" style={{ color: '#5B5470', background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}>
          <ChevronLeft size={15} /> Menu
        </Link>
        <div className="flex items-center gap-2">
          <MapIcon size={16} style={{ color: '#9B5DE5' }} />
          <h1 className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
            Scenario Map
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#FFFCF5', color: '#1B1733', border: '1px solid var(--color-panel-line)', fontFamily: 'var(--font-jetbrains)' }}>
            <Star size={11} fill="#FFB81C" stroke="#FFB81C" /> {totalStars}
          </div>
          <div className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: '#1DD3A01A', color: '#1DA97F', border: '1px solid #1DD3A040', fontFamily: 'var(--font-jetbrains)' }}>
            {completed} / {SCENARIOS.length}
          </div>
        </div>
      </header>

      {/* World map */}
      <div ref={areaRef} className="flex-1 overflow-auto flex">
        <div className="relative flex-shrink-0" style={{ width: mapWidth, height: mapHeight }}>
          {/* Road + decorations */}
          <svg className="absolute inset-0" width={mapWidth} height={mapHeight} style={{ display: 'block' }}>
            {/* soft scattered field blobs for texture */}
            {trees.map((t, i) => (
              <ellipse key={`b${i}`} cx={t.x - 40} cy={t.y + 70} rx={34} ry={12} fill="#FFFFFF" opacity={0.16} />
            ))}

            {/* Road — fat base + flowing dashed centre */}
            <path d={roadPath} fill="none" stroke="#EAD9B8" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
            <path d={roadPath} fill="none" stroke="#FBF1DC" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
            <path d={roadPath} fill="none" stroke="#E0CBA0" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="3 12" style={reduced ? undefined : { animation: 'road-dash 1.1s linear infinite' }} />

            {/* Trees */}
            {trees.map((t, i) => <Tree key={`t${i}`} x={t.x} y={t.y} s={t.s} />)}
          </svg>

          {/* Drifting clouds */}
          {[
            { x: area.w * 0.4, y: 40, s: 1, dur: 28, from: -22 },
            { x: area.w * 0.75, y: 90, s: 0.8, dur: 34, from: 26 },
          ].map((c, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none"
              style={{ left: c.x, top: c.y, transform: `scale(${c.s})` }}
              animate={reduced ? {} : { x: [c.from, c.from + 22, c.from] }}
              transition={reduced ? {} : { duration: c.dur, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width={92} height={52} viewBox="0 0 100 60">
                <ellipse cx={36} cy={40} rx={26} ry={17} fill="#FFFFFF" opacity={0.85} />
                <circle cx={58} cy={32} r={20} fill="#FFFFFF" opacity={0.85} />
                <circle cx={30} cy={28} r={15} fill="#FFFFFF" opacity={0.85} />
              </svg>
            </motion.div>
          ))}

          {/* Traffic flowing along the road */}
          {!reduced && roadPath && PING_COLORS.map((c, i) => (
            <MapPing key={i} color={c} path={roadPath} dur={16} delay={i * 3} />
          ))}

          {/* Nimbus host at the trailhead */}
          <div className="absolute pointer-events-none" style={{ left: Math.max(8, start.x - 132), top: Math.max(8, start.y - 96) }}>
            <Nimbus state="point" size={78} />
            <div className="mt-1 px-3 py-1.5 rounded-xl text-xs font-medium max-w-[150px] leading-snug" style={{ background: '#FFF3DD', color: '#5B5470', border: '1px solid var(--color-panel-line)' }}>
              Follow the road — fix a broken stack at each stop!
            </div>
          </div>

          {/* Location stops */}
          {SCENARIOS.map((scenario, i) => {
            const bestScore = bestScores[scenario.id];
            const bestGrade = bestScore !== undefined ? scoreToGrade(bestScore) : null;
            return (
              <LocationMarker
                key={scenario.id}
                scenario={scenario}
                index={i}
                x={points[i].x}
                y={points[i].y}
                bestGrade={bestGrade}
                isSelected={selectedId === scenario.id}
                onSelect={() => setSelectedId(selectedId === scenario.id ? null : scenario.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Scenario detail popover */}
      <AnimatePresence>
        {selectedScenario && (
          <motion.div
            key={selectedScenario.id}
            className="fixed bottom-0 left-0 right-0 z-30"
            initial={{ y: reduced ? 0 : 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : 200, opacity: 0 }}
            transition={reduced ? { duration: 0 } : spring}
          >
            <div className="mx-auto max-w-2xl rounded-t-3xl p-6" style={{ background: 'var(--color-panel)', border: '1px solid var(--color-panel-line)', borderBottom: 'none', boxShadow: '0 -8px 30px rgba(27,23,51,0.12)' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DifficultyStars difficulty={selectedScenario.difficulty} />
                    <span className="text-[10px] uppercase" style={{ color: '#9A92AD', fontFamily: 'var(--font-jetbrains)' }}>{selectedScenario.difficulty}</span>
                    {bestScores[selectedScenario.id] !== undefined && (
                      <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#1DA97F' }}>
                        <CheckCircle2 size={10} />
                        Best: {Math.round(bestScores[selectedScenario.id])} pts
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
                    {selectedScenario.title}
                  </h2>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: '#5B5470' }}>
                    {selectedScenario.brief}
                  </p>
                </div>
                <button onClick={() => setSelectedId(null)} className="flex-shrink-0 text-lg leading-none transition-colors" style={{ color: '#9A92AD' }}>×</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Target RPS', value: selectedScenario.targetRps.toLocaleString() },
                  { label: 'Max Latency', value: `${selectedScenario.maxLatencyMs}ms` },
                  { label: 'Budget', value: `$${selectedScenario.budgetUsd}/mo` },
                  { label: 'SLA', value: `${(selectedScenario.slaAvailability * 100).toFixed(2)}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl px-3 py-2 text-center" style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}>
                    <div className="text-[9px] font-bold uppercase mb-0.5" style={{ color: '#9A92AD' }}>{label}</div>
                    <div className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-jetbrains)', color: '#1B1733' }}>{value}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <PillButton variant="primary" size="md" icon={<Play size={16} fill="currentColor" />} onClick={handleStart}>
                  Start mission
                </PillButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
