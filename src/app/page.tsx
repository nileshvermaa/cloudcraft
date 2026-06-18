'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { useGameStore } from '@/store/useGameStore';
import { Nimbus } from '@/components/cast/CastRenderer';
import { PillButton } from '@/components/ui/PillButton';
import { shade } from '@/components/canvas/nodes/tile-geometry';
import { formatRps } from '@/lib/utils';
import { Hammer, Map as MapIcon, Package, Settings, Volume2, VolumeX } from 'lucide-react';

const spring = { type: 'spring' as const, stiffness: 260, damping: 20 };

/* ── One iso cuboid building ───────────────────────────────────────────────── */
function IsoTile({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={55} cy={118} rx={44} ry={7} fill="rgba(27,23,51,0.10)" />
      <polygon points="5,38 55,66 55,110 5,82" fill={shade(color, 0.12)} />
      <polygon points="105,38 55,66 55,110 105,82" fill={shade(color, 0.22)} />
      <polygon points="55,10 105,38 55,66 5,38" fill={color} />
    </g>
  );
}

/* ── A floating ping bean ──────────────────────────────────────────────────── */
function FloatingPing({ color, style, delay }: { color: string; style: React.CSSProperties; delay: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      style={{ position: 'absolute', ...style }}
      animate={reduced ? {} : { y: [0, -10, 0] }}
      transition={reduced ? {} : { duration: 3 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <svg width={26} height={26} viewBox="0 0 28 28" style={{ overflow: 'visible' }}>
        <ellipse cx={14} cy={20} rx={9} ry={2.5} fill="rgba(27,23,51,0.08)" />
        <ellipse cx={14} cy={13} rx={10} ry={9} fill={color} />
        <circle cx={10} cy={11} r={1.8} fill="#1B1733" />
        <circle cx={18} cy={11} r={1.8} fill="#1B1733" />
        <circle cx={10.5} cy={10.5} r={0.7} fill="white" />
        <circle cx={18.5} cy={10.5} r={0.7} fill="white" />
        <path d="M11 15 Q14 18 17 15" stroke="#1B1733" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

/* ── The iso "Cloud City" scene ────────────────────────────────────────────── */
function CloudCityScene() {
  const reduced = useReducedMotion();
  return (
    <div className="relative w-full max-w-[640px] aspect-[4/3] select-none">
      {/* Drifting clouds */}
      {[
        { top: '12%', size: 70, dur: 22, from: -30 },
        { top: '26%', size: 48, dur: 28, from: 40 },
      ].map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ top: c.top, left: '50%' }}
          animate={reduced ? {} : { x: [c.from, c.from + 26, c.from] }}
          transition={reduced ? {} : { duration: c.dur, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width={c.size} height={c.size * 0.6} viewBox="0 0 100 60">
            <ellipse cx={35} cy={38} rx={26} ry={18} fill="#FFFFFF" opacity={0.85} />
            <circle cx={56} cy={30} r={20} fill="#FFFFFF" opacity={0.85} />
            <circle cx={30} cy={26} r={15} fill="#FFFFFF" opacity={0.85} />
          </svg>
        </motion.div>
      ))}

      <svg viewBox="0 0 480 360" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Sun */}
        <circle cx={410} cy={70} r={30} fill="#FFD96B" opacity={0.9} />
        <circle cx={410} cy={70} r={42} fill="#FFD96B" opacity={0.25} />

        {/* Soft hills */}
        <path d="M0,255 Q140,210 280,238 T480,232 L480,360 L0,360 Z" fill="#D7F0E2" />
        <path d="M0,290 Q160,255 320,282 T480,280 L480,360 L0,360 Z" fill="#C5E8D5" />

        {/* Conduit road connecting the buildings */}
        <path
          d="M120,168 Q190,228 232,214 Q300,196 350,182"
          fill="none"
          stroke="#EAD9B8"
          strokeWidth={12}
          strokeLinecap="round"
        />
        <path
          d="M120,168 Q190,228 232,214 Q300,196 350,182"
          fill="none"
          stroke="#FFF7E8"
          strokeWidth={3}
          strokeDasharray="2 9"
          strokeLinecap="round"
        />

        {/* Buildings (candy iso tiles) */}
        <IsoTile x={70} y={70} s={0.62} color="#22B8FF" />
        <IsoTile x={165} y={92} s={0.92} color="#1DD3A0" />
        <IsoTile x={300} y={78} s={0.72} color="#9B5DE5" />

        {/* "Cloud City" signpost */}
        <g transform="translate(196 250)">
          <rect x={-2} y={6} width={5} height={40} rx={2} fill="#C9A86A" />
          <g transform="translate(-58 -16)">
            <rect width={118} height={30} rx={8} fill="#FFF3DD" stroke="#ECE0C8" strokeWidth={1.5} />
            <text x={59} y={20} textAnchor="middle" fontSize={15} fontWeight={600}
              fontFamily="var(--font-display)" fill="#1B1733">Cloud City</text>
          </g>
        </g>
      </svg>

      {/* Nimbus host, bobbing on the hill (clear of the sign) */}
      <div className="absolute" style={{ left: '6%', bottom: '20%' }}>
        <Nimbus state="idle" size={82} />
      </div>

      {/* Floating traffic */}
      <FloatingPing color="#FF6B6B" style={{ left: '26%', top: '42%' }} delay={0} />
      <FloatingPing color="#FFD23D" style={{ left: '66%', top: '36%' }} delay={0.8} />
      <FloatingPing color="#4ECDC4" style={{ left: '74%', bottom: '40%' }} delay={1.6} />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { bestSandboxLoad, loadBestScores, startSandbox } = useGameStore();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    loadBestScores();
  }, [loadBestScores]);

  const handleStartSandbox = () => {
    startSandbox();
    router.push('/sandbox');
  };

  const bestLoads = Object.values(bestSandboxLoad ?? {});
  const bestSurvived = bestLoads.length ? Math.max(...bestLoads) : 0;

  const stack = [
    { delay: 0.05, node: (
      <PillButton variant="primary" size="lg" block icon={<Hammer size={18} />} onClick={handleStartSandbox}>
        Play sandbox
      </PillButton>
    ) },
    { delay: 0.12, node: (
      <PillButton variant="secondary" size="md" block icon={<MapIcon size={16} />} onClick={() => router.push('/scenarios')}>
        Scenarios
      </PillButton>
    ) },
    { delay: 0.19, node: (
      <PillButton variant="secondary" size="md" block icon={<Package size={16} />} onClick={() => router.push('/collection')}>
        Collection
      </PillButton>
    ) },
  ];

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ background: 'linear-gradient(180deg, #EAF6FF 0%, #FFF7ED 100%)' }}
    >
      {/* ── Left: the iso cloud-city scene ── */}
      <div className="relative flex-1 min-h-[44vh] md:min-h-screen flex items-center justify-center px-6 py-8 overflow-hidden">
        <motion.div
          className="w-full max-w-[560px] flex justify-center"
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : spring}
        >
          <CloudCityScene />
        </motion.div>
      </div>

      {/* ── Right: cream panel with wordmark + button stack ── */}
      <div
        className="w-full md:w-[440px] flex-shrink-0 flex items-center justify-center px-8 py-10 md:py-0"
        style={{ background: 'var(--color-panel)', borderLeft: '1px solid var(--color-panel-line)' }}
      >
        <motion.div
          className="w-full max-w-[320px]"
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { ...spring, delay: 0.1 }}
        >
          {/* Wordmark */}
          <div className="flex items-center gap-2.5 mb-1">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
              <polygon points="16,3 29,10 16,17 3,10" fill="#1DD3A0" />
              <polygon points="3,10 16,17 16,27 3,20" fill="#19B98C" />
              <polygon points="29,10 16,17 16,27 29,20" fill="#16A47D" />
            </svg>
            <h1 className="text-[30px] leading-none font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
              CloudCraft
            </h1>
          </div>
          <div className="text-[15px] font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: '#9A92AD' }}>
            Studio
          </div>

          <p className="text-[14px] leading-relaxed mb-6" style={{ color: '#5B5470' }}>
            Build a cloud stack on the board, pour traffic on it, and watch where it breaks — and why.
          </p>

          {/* Best-survived pill */}
          {bestSurvived > 0 && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{ background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9A92AD' }}>
                Best survived
              </span>
              <span className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-jetbrains)', color: '#1DA97F' }}>
                {formatRps(bestSurvived)}
              </span>
            </div>
          )}

          {/* Button stack */}
          <div className="flex flex-col gap-3">
            {stack.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: reduced ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduced ? { duration: 0 } : { ...spring, delay: b.delay }}
              >
                {b.node}
              </motion.div>
            ))}
          </div>

          {/* Settings + sound */}
          <div className="flex items-center gap-3 mt-4">
            <PillButton variant="secondary" size="sm" icon={<Settings size={14} />} onClick={() => router.push('/settings')}>
              Settings
            </PillButton>
            <PillButton
              variant="secondary"
              size="sm"
              icon={muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              onClick={() => setMuted((m) => !m)}
            >
              {muted ? 'Muted' : 'Sound'}
            </PillButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
