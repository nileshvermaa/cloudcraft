'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft, Lock, Package } from 'lucide-react';
import {
  Nimbus,
  TheLeakCharacter,
  TheCrewCharacter,
  BillyCharacter,
} from '@/components/cast/CastRenderer';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };

// ─── Character roster ────────────────────────────────────────────────────────
const CHARACTERS = [
  {
    id: 'nimbus',
    name: 'Nimbus',
    role: 'Host / Guide',
    description: 'Your ever-present cloud companion. Nimbus floats around the board offering tips, cheering your wins, and dramatically fainting when everything breaks.',
    ability: 'Cheer Bonus — Nimbus\'s enthusiasm gives you +2% grace time before the first timeout.',
    color: '#EDE7F6',
    accentColor: '#9B5DE5',
    unlockCondition: 'Default — always unlocked',
    unlocked: true,
    renderCharacter: () => <Nimbus state="idle" size={80} />,
  },
  {
    id: 'pings',
    name: 'Pings',
    role: 'The Traffic',
    description: 'Jelly-bean blobs that ARE your requests. They stream through your architecture, queue up at bottlenecks, yawn when latency spikes, and splat when the system drops them.',
    ability: 'Resilient Payload — Pings can queue 5% more before the first splat.',
    color: '#FFF7ED',
    accentColor: '#FF8A3D',
    unlockCondition: 'Default — always unlocked',
    unlocked: true,
    renderCharacter: () => (
      <div className="flex gap-3 justify-center">
        {['#FF6B6B', '#FFD93D', '#4ECDC4', '#A78BFA'].map((c) => (
          <svg key={c} width={28} height={28} viewBox="0 0 28 28" style={{ overflow: 'visible' }}>
            <g className="blob-idle" style={{ transformOrigin: '14px 14px' }}>
              <rect x={10} y={20} width={3} height={5} rx={1.5} fill={c} opacity={0.7} />
              <rect x={15} y={20} width={3} height={5} rx={1.5} fill={c} opacity={0.7} />
              <ellipse cx={14} cy={13} rx={10} ry={9} fill={c} />
              <circle cx={10} cy={11} r={1.8} fill="#1B1733" />
              <circle cx={18} cy={11} r={1.8} fill="#1B1733" />
              <circle cx={10.5} cy={10.5} r={0.7} fill="white" />
              <circle cx={18.5} cy={10.5} r={0.7} fill="white" />
              <path d="M11 15 Q14 18 17 15" stroke="#1B1733" strokeWidth={1.5} fill="none" strokeLinecap="round" />
            </g>
          </svg>
        ))}
      </div>
    ),
  },
  {
    id: 'the-crew',
    name: 'The Crew',
    role: 'Ops Blobs',
    description: 'Hard-hat wearing worker beans posted at your compute nodes. They work steadily when load is manageable, panic when overloaded, and dramatically faint one by one during a cascading failure.',
    ability: 'Overtime Mode — The Crew can sustain 10% over-capacity for 0.5s before the tile redlines.',
    color: '#FFF7ED',
    accentColor: '#FF8A3D',
    unlockCondition: 'Complete any Intermediate or higher scenario with an A or above.',
    unlocked: true, // always show for demo
    renderCharacter: () => (
      <div className="relative h-20 flex items-end justify-center gap-2">
        <div style={{ position: 'relative', width: 36, height: 44 }}>
          <TheCrewCharacter state="work" index={0} />
        </div>
        <div style={{ position: 'relative', width: 36, height: 44 }}>
          <TheCrewCharacter state="work" index={1} />
        </div>
      </div>
    ),
  },
  {
    id: 'the-leak',
    name: 'The Leak',
    role: 'The Intruder',
    description: 'A masked burglar-bean with a sack labelled DATA. Appears whenever your architecture has a public-facing path straight to a private data store. Watch it swagger in and walk off with your data.',
    ability: 'Caught in the Act — The Leak\'s animation plays 20% slower, making the lesson extra clear.',
    color: '#F1F5F9',
    accentColor: '#3B4252',
    unlockCondition: 'Experience a security violation and then fix it (WAF or Auth) in the same session.',
    unlocked: true,
    renderCharacter: () => (
      <div style={{ position: 'relative', width: 60, height: 64, margin: '0 auto' }}>
        <TheLeakCharacter state="sneak" style={{ top: 0, left: 8 }} />
      </div>
    ),
  },
  {
    id: 'billy',
    name: 'Billy',
    role: 'The Accountant',
    description: 'A tidy bean with glasses and a ledger. Billy watches your monthly costs obsessively and dramatically faceplants on his invoice when the bill exceeds budget.',
    ability: 'Thrifty Lens — Billy flags any node running at under 30% utilization with a small coin icon.',
    color: '#EFF6FF',
    accentColor: '#3B82F6',
    unlockCondition: 'Complete any scenario within 50% of the budget limit.',
    unlocked: true,
    renderCharacter: () => (
      <div style={{ position: 'relative', width: 50, height: 64, margin: '0 auto' }}>
        <BillyCharacter state="ok" style={{ top: 0, left: 0 }} />
      </div>
    ),
  },
] as const;

type CharacterId = (typeof CHARACTERS)[number]['id'];

export default function CollectionPage() {
  const reduced = useReducedMotion();
  const [selectedId, setSelectedId] = useState<CharacterId>('nimbus');

  const selected = CHARACTERS.find((c) => c.id === selectedId) ?? CHARACTERS[0];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #EEEAFE 0%, #FFF7ED 55%, #FFEAF2 100%)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'rgba(155,93,229,0.15)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}
      >
        <Link href="/">
          <button className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: '#5B5470' }}>
            <ArrowLeft size={16} />
            Back to Menu
          </button>
        </Link>

        <div className="flex items-center gap-2">
          <Package size={16} style={{ color: '#FF6FA5' }} />
          <h1 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
            Character Collection
          </h1>
        </div>

        <div
          className="text-[11px] font-mono font-bold px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,111,165,0.12)', color: '#FF6FA5', border: '1px solid rgba(255,111,165,0.25)' }}
        >
          {CHARACTERS.filter((c) => c.unlocked).length} / {CHARACTERS.length} unlocked
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — character grid */}
        <div className="w-64 flex-shrink-0 p-4 border-r overflow-y-auto" style={{ borderColor: 'rgba(155,93,229,0.1)', background: 'rgba(255,255,255,0.4)' }}>
          <div className="grid grid-cols-2 gap-3">
            {CHARACTERS.map((char, i) => (
              <motion.button
                key={char.id}
                onClick={() => char.unlocked && setSelectedId(char.id as CharacterId)}
                className="relative rounded-2xl p-3 flex flex-col items-center gap-2 border-2 transition-all focus:outline-none"
                style={{
                  background: selectedId === char.id ? char.color : 'rgba(255,255,255,0.7)',
                  borderColor: selectedId === char.id ? char.accentColor : 'rgba(226,232,240,0.8)',
                  opacity: char.unlocked ? 1 : 0.55,
                  cursor: char.unlocked ? 'pointer' : 'not-allowed',
                }}
                initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                animate={{ opacity: char.unlocked ? 1 : 0.55, y: 0 }}
                transition={reduced ? { duration: 0 } : { ...spring, delay: i * 0.06 }}
                whileHover={reduced || !char.unlocked ? {} : { scale: 1.04 }}
                whileTap={reduced || !char.unlocked ? {} : { scale: 0.97 }}
              >
                {/* Character preview */}
                <div className="w-16 h-16 flex items-center justify-center">
                  {char.unlocked ? (
                    char.id === 'nimbus' ? <Nimbus state="idle" size={56} /> :
                    char.id === 'pings' ? (
                      <svg width={28} height={28} viewBox="0 0 28 28" style={{ overflow: 'visible' }}>
                        <ellipse cx={14} cy={13} rx={10} ry={9} fill="#FF6B6B" />
                        <circle cx={10} cy={11} r={1.8} fill="#1B1733" />
                        <circle cx={18} cy={11} r={1.8} fill="#1B1733" />
                        <path d="M11 15 Q14 18 17 15" stroke="#1B1733" strokeWidth={1.5} fill="none" strokeLinecap="round" />
                      </svg>
                    ) :
                    char.id === 'the-crew' ? (
                      <div style={{ position: 'relative', width: 36, height: 44 }}>
                        <TheCrewCharacter state="work" index={0} />
                      </div>
                    ) :
                    char.id === 'the-leak' ? (
                      <div style={{ position: 'relative', width: 44, height: 52 }}>
                        <TheLeakCharacter state="sneak" style={{ top: 0, left: 0 }} />
                      </div>
                    ) : (
                      <div style={{ position: 'relative', width: 40, height: 52 }}>
                        <BillyCharacter state="ok" style={{ top: 0, left: 0 }} />
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Lock size={20} style={{ color: '#94A3B8' }} />
                      <div className="text-[8px] font-mono text-[#94A3B8]">LOCKED</div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div
                    className="text-[11px] font-black leading-tight"
                    style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}
                  >
                    {char.name}
                  </div>
                  <div className="text-[9px]" style={{ color: '#9A92AD' }}>{char.role}</div>
                </div>

                {/* Selected ring */}
                {selectedId === char.id && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ border: `2px solid ${char.accentColor}`, boxShadow: `0 0 12px ${char.accentColor}44` }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Right — detail panel */}
        <div className="flex-1 p-8 overflow-y-auto">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, x: reduced ? 0 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={reduced ? { duration: 0 } : spring}
            className="max-w-lg"
          >
            {/* Big render */}
            <div
              className="rounded-3xl p-8 mb-6 flex items-center justify-center"
              style={{ background: selected.color, border: `2px solid ${selected.accentColor}22`, minHeight: 180 }}
            >
              {selected.renderCharacter()}
            </div>

            {/* Name + role */}
            <h2
              className="text-4xl font-black mb-1"
              style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}
            >
              {selected.name}
            </h2>
            <div
              className="text-sm font-bold mb-4 uppercase tracking-wider"
              style={{ color: selected.accentColor }}
            >
              {selected.role}
            </div>

            {/* Description */}
            <p className="text-[15px] leading-relaxed mb-5" style={{ color: '#5B5470' }}>
              {selected.description}
            </p>

            {/* Ability */}
            <div
              className="rounded-xl p-4 mb-5"
              style={{ background: `${selected.accentColor}12`, border: `1px solid ${selected.accentColor}30` }}
            >
              <div
                className="text-[10px] font-black uppercase tracking-widest mb-1"
                style={{ color: selected.accentColor }}
              >
                Flavor Ability
              </div>
              <p className="text-sm font-medium" style={{ color: '#1B1733' }}>
                {selected.ability}
              </p>
            </div>

            {/* Unlock condition */}
            <div className="flex items-start gap-2 text-sm" style={{ color: '#9A92AD' }}>
              {selected.unlocked ? (
                <span className="text-[#1DD3A0] font-bold flex items-center gap-1">
                  ✓ Unlocked
                </span>
              ) : (
                <>
                  <Lock size={14} className="flex-shrink-0 mt-0.5" />
                  <span>{selected.unlockCondition}</span>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
