'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { ChevronLeft, Lock, Package, Coins, Check } from 'lucide-react';
import {
  Nimbus,
  TheLeakCharacter,
  TheCrewCharacter,
  BillyCharacter,
} from '@/components/cast/CastRenderer';
import { PillButton } from '@/components/ui/PillButton';
import { useGameStore } from '@/store/useGameStore';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };
const PAGE_BG = 'linear-gradient(180deg, #FFEAF2 0%, #FFF7ED 100%)';

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
    cost: 0,
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
    cost: 0,
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
    cost: 60,
    renderCharacter: () => (
      <div className="relative h-20 flex items-end justify-center gap-2">
        <div style={{ position: 'relative', width: 36, height: 44 }}>
          <TheCrewCharacter state="work" />
        </div>
        <div style={{ position: 'relative', width: 36, height: 44 }}>
          <TheCrewCharacter state="work" />
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
    cost: 90,
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
    cost: 70,
    renderCharacter: () => (
      <div style={{ position: 'relative', width: 50, height: 64, margin: '0 auto' }}>
        <BillyCharacter state="ok" style={{ top: 0, left: 0 }} />
      </div>
    ),
  },
] as const;

type CharacterId = (typeof CHARACTERS)[number]['id'];

function MiniRender({ id }: { id: CharacterId }) {
  if (id === 'nimbus') return <Nimbus state="idle" size={56} />;
  if (id === 'pings')
    return (
      <svg width={28} height={28} viewBox="0 0 28 28" style={{ overflow: 'visible' }}>
        <ellipse cx={14} cy={13} rx={10} ry={9} fill="#FF6B6B" />
        <circle cx={10} cy={11} r={1.8} fill="#1B1733" />
        <circle cx={18} cy={11} r={1.8} fill="#1B1733" />
        <path d="M11 15 Q14 18 17 15" stroke="#1B1733" strokeWidth={1.5} fill="none" strokeLinecap="round" />
      </svg>
    );
  if (id === 'the-crew')
    return <div style={{ position: 'relative', width: 36, height: 44 }}><TheCrewCharacter state="work" /></div>;
  if (id === 'the-leak')
    return <div style={{ position: 'relative', width: 44, height: 52 }}><TheLeakCharacter state="sneak" style={{ top: 0, left: 0 }} /></div>;
  return <div style={{ position: 'relative', width: 40, height: 52 }}><BillyCharacter state="ok" style={{ top: 0, left: 0 }} /></div>;
}

export default function CollectionPage() {
  const reduced = useReducedMotion();
  const [selectedId, setSelectedId] = useState<CharacterId>('nimbus');
  const { coins, unlockedCharacters, equippedCharacter, unlockCharacter, equipCharacter, loadBestScores } = useGameStore();

  useEffect(() => {
    loadBestScores();
  }, [loadBestScores]);

  const selected = CHARACTERS.find((c) => c.id === selectedId) ?? CHARACTERS[0];
  const isUnlocked = (id: string) => unlockedCharacters.includes(id);
  const selectedUnlocked = isUnlocked(selected.id);
  const isEquipped = equippedCharacter === selected.id;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 h-14 flex-shrink-0"
        style={{ background: 'var(--color-panel)', borderBottom: '1px solid var(--color-panel-line)' }}
      >
        <Link
          href="/"
          className="flex items-center gap-1 text-[13px] font-bold rounded-full pl-2 pr-3.5 py-1.5"
          style={{ color: '#5B5470', background: '#FFFCF5', border: '1px solid var(--color-panel-line)' }}
        >
          <ChevronLeft size={15} /> Menu
        </Link>
        <div className="flex items-center gap-2">
          <Package size={16} style={{ color: '#FF6FA5' }} />
          <h1 className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
            Collection
          </h1>
        </div>
        <div
          className="flex items-center gap-1.5 text-[13px] font-bold px-3 py-1 rounded-full"
          style={{ background: '#FFF7D6', color: '#9A6B00', border: '1px solid #F2D98A', fontFamily: 'var(--font-jetbrains)' }}
        >
          <Coins size={13} />
          {coins}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left — character grid */}
        <div className="w-64 flex-shrink-0 p-4 overflow-y-auto" style={{ borderRight: '1px solid var(--color-panel-line)', background: 'var(--color-panel)' }}>
          <div className="grid grid-cols-2 gap-3">
            {CHARACTERS.map((char, i) => {
              const active = selectedId === char.id;
              const unlocked = isUnlocked(char.id);
              return (
                <motion.button
                  key={char.id}
                  onClick={() => setSelectedId(char.id as CharacterId)}
                  className="relative rounded-2xl p-3 flex flex-col items-center gap-2 transition-all focus:outline-none"
                  style={{
                    background: active ? char.color : '#FFFCF5',
                    border: `2px solid ${active ? char.accentColor : 'var(--color-panel-line)'}`,
                    boxShadow: active ? `0 0 0 2px ${char.accentColor}30` : 'none',
                  }}
                  initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduced ? { duration: 0 } : { ...spring, delay: i * 0.06 }}
                  whileHover={reduced ? {} : { scale: 1.04 }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                >
                  <div className="w-16 h-16 flex items-center justify-center" style={{ opacity: unlocked ? 1 : 0.4, filter: unlocked ? 'none' : 'grayscale(0.7)' }}>
                    <MiniRender id={char.id} />
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
                      {char.name}
                    </div>
                    <div className="text-[9px]" style={{ color: '#9A92AD' }}>{char.role}</div>
                  </div>

                  {/* Lock / equipped badges */}
                  {!unlocked && (
                    <div
                      className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold"
                      style={{ background: '#FFF7D6', color: '#9A6B00', fontFamily: 'var(--font-jetbrains)' }}
                    >
                      <Lock size={8} /> {char.cost}
                    </div>
                  )}
                  {unlocked && equippedCharacter === char.id && (
                    <div
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: '#1DD3A0' }}
                    >
                      <Check size={10} color="white" strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
              );
            })}
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
            <div
              className="rounded-3xl p-8 mb-6 flex items-center justify-center"
              style={{ background: selected.color, border: `1px solid ${selected.accentColor}22`, minHeight: 180, opacity: selectedUnlocked ? 1 : 0.55, filter: selectedUnlocked ? 'none' : 'grayscale(0.6)' }}
            >
              {selected.renderCharacter()}
            </div>

            <h2 className="text-4xl font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
              {selected.name}
            </h2>
            <div className="text-sm font-bold mb-4 uppercase tracking-wider" style={{ color: selected.accentColor }}>
              {selected.role}
            </div>

            <p className="text-[15px] leading-relaxed mb-5" style={{ color: '#5B5470' }}>
              {selected.description}
            </p>

            <div className="rounded-xl p-4 mb-6" style={{ background: `${selected.accentColor}12`, border: `1px solid ${selected.accentColor}30` }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: selected.accentColor }}>
                Flavor Ability
              </div>
              <p className="text-sm font-medium" style={{ color: '#1B1733' }}>
                {selected.ability}
              </p>
            </div>

            {/* Action */}
            {selectedUnlocked ? (
              isEquipped ? (
                <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: '#1DA97F' }}>
                  <Check size={16} /> Equipped
                </div>
              ) : (
                <PillButton variant="primary" size="md" onClick={() => equipCharacter(selected.id)}>
                  Equip
                </PillButton>
              )
            ) : (
              <div className="flex items-center gap-3">
                <PillButton
                  variant="primary"
                  size="md"
                  icon={<Coins size={16} />}
                  disabled={coins < selected.cost}
                  onClick={() => unlockCharacter(selected.id, selected.cost)}
                >
                  {coins < selected.cost ? `Need ${selected.cost} coins` : `Unlock · ${selected.cost}`}
                </PillButton>
                <span className="text-[12px]" style={{ color: '#9A92AD' }}>
                  You have <strong style={{ color: '#9A6B00', fontFamily: 'var(--font-jetbrains)' }}>{coins}</strong>
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
