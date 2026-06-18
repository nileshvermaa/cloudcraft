'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { ChevronLeft, Settings as SettingsIcon, Palette, Monitor, Globe, Volume2 } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import type { PaletteTheme, ProviderSkin, SceneBg } from '@/types';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };
const PAGE_BG = 'linear-gradient(180deg, #EAF6FF 0%, #FFF7ED 100%)';
const ACCENT = '#9B5DE5';

const PALETTE_THEMES: { id: PaletteTheme; label: string; colors: string[]; desc: string }[] = [
  { id: 'candy',    label: 'Candy',    colors: ['#9B5DE5', '#22B8FF', '#1DD3A0', '#FF6FA5'], desc: 'Vivid, saturated — the default candy world.' },
  { id: 'pastel',   label: 'Pastel',   colors: ['#D8B4FE', '#93C5FD', '#86EFAC', '#FBCFE8'], desc: 'Soft and muted — easy on the eyes.' },
  { id: 'neon',     label: 'Neon',     colors: ['#F00CDF', '#00F6FF', '#00FF66', '#FF0055'], desc: 'Max contrast, retro cyber vibes.' },
  { id: 'mono-pro', label: 'Mono Pro', colors: ['#FFFFFF', '#E2E8F0', '#94A3B8', '#475569'], desc: 'Grayscale — all about the architecture.' },
];

const PROVIDER_SKINS: { id: ProviderSkin; label: string; emoji: string; desc: string }[] = [
  { id: 'generic',    label: 'Generic',    emoji: '☁️', desc: 'Neutral cloud vernacular — service concept names.' },
  { id: 'aws-style',  label: 'AWS-style',  emoji: '🟠', desc: 'Renamed to AWS equivalents (e.g. EC2, S3, Lambda).' },
  { id: 'azure-style',label: 'Azure-style',emoji: '🔵', desc: 'Renamed to Azure equivalents (e.g. VMs, Blob, Functions).' },
  { id: 'gcp-style',  label: 'GCP-style',  emoji: '🟡', desc: 'Renamed to GCP equivalents (e.g. GCE, GCS, Cloud Run).' },
];

const SCENE_BACKGROUNDS: { id: SceneBg; label: string; color: string }[] = [
  { id: 'vanilla', label: 'Vanilla', color: '#FFF7ED' },
  { id: 'sky',     label: 'Sky',     color: '#E8F6FF' },
  { id: 'mint',    label: 'Mint',    color: '#E7FBF3' },
  { id: 'bubble',  label: 'Bubble',  color: '#FFEAF2' },
  { id: 'dusk',    label: 'Dusk',    color: '#EEEAFE' },
];

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span style={{ color: ACCENT }}>{icon}</span>
      <h2 className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
        {title}
      </h2>
    </div>
  );
}

const cardBase = { background: '#FFFCF5', border: '1px solid var(--color-panel-line)' } as const;

export default function SettingsPage() {
  const reduced = useReducedMotion();
  const { paletteTheme, setPaletteTheme, providerSkin, setProviderSkin, sceneBg, setSceneBg, loadBestScores } =
    useGameStore();

  useEffect(() => {
    loadBestScores();
  }, [loadBestScores]);

  return (
    <div className={`min-h-screen flex flex-col theme-${paletteTheme}`} style={{ background: PAGE_BG }}>
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
          <SettingsIcon size={16} style={{ color: ACCENT }} />
          <h1 className="text-[17px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
            Settings
          </h1>
        </div>
        <div className="w-[72px]" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-10">
          {/* Palette Theme */}
          <motion.section
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : spring}
          >
            <SectionHeader icon={<Palette size={18} />} title="Palette Theme" />
            <div className="grid grid-cols-2 gap-3">
              {PALETTE_THEMES.map((theme) => {
                const active = paletteTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setPaletteTheme(theme.id)}
                    className="rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 focus:outline-none"
                    style={active ? { background: `${ACCENT}14`, border: `2px solid ${ACCENT}` } : { ...cardBase, borderWidth: 2 }}
                  >
                    <div className="flex gap-1.5 mb-2">
                      {theme.colors.map((c) => (
                        <div key={c} className="w-5 h-5 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="text-[13px] font-semibold mb-0.5 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
                      {theme.label}
                      {active && <span className="text-[9px] font-bold uppercase" style={{ color: ACCENT }}>active</span>}
                    </div>
                    <div className="text-[11px]" style={{ color: '#9A92AD' }}>{theme.desc}</div>
                  </button>
                );
              })}
            </div>
          </motion.section>

          {/* Provider Skin */}
          <motion.section
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { ...spring, delay: 0.08 }}
          >
            <SectionHeader icon={<Globe size={18} />} title="Provider Skin" />
            <p className="text-[12px] mb-4" style={{ color: '#9A92AD' }}>
              Renames service tiles to a cloud provider&apos;s vernacular. Generic representations — no official logos or trademarks.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PROVIDER_SKINS.map((skin) => {
                const active = providerSkin === skin.id;
                return (
                  <button
                    key={skin.id}
                    onClick={() => setProviderSkin(skin.id)}
                    className="rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 focus:outline-none"
                    style={active ? { background: '#22B8FF14', border: '2px solid #22B8FF' } : { ...cardBase, borderWidth: 2 }}
                  >
                    <div className="text-2xl mb-2">{skin.emoji}</div>
                    <div className="text-[13px] font-semibold mb-0.5 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
                      {skin.label}
                      {active && <span className="text-[9px] font-bold uppercase" style={{ color: '#22B8FF' }}>active</span>}
                    </div>
                    <div className="text-[11px]" style={{ color: '#9A92AD' }}>{skin.desc}</div>
                  </button>
                );
              })}
            </div>
          </motion.section>

          {/* Board Scene */}
          <motion.section
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { ...spring, delay: 0.16 }}
          >
            <SectionHeader icon={<Monitor size={18} />} title="Board Scene" />
            <div className="flex gap-3 flex-wrap">
              {SCENE_BACKGROUNDS.map((scene) => {
                const active = sceneBg === scene.id;
                return (
                  <button key={scene.id} onClick={() => setSceneBg(scene.id)} className="flex flex-col items-center gap-1.5 focus:outline-none">
                    <div
                      className="w-16 h-16 rounded-2xl transition-all hover:scale-105"
                      style={{
                        backgroundColor: scene.color,
                        border: active ? `2px solid ${ACCENT}` : '2px solid var(--color-panel-line)',
                        boxShadow: active ? `0 0 0 3px ${ACCENT}40` : 'none',
                      }}
                    />
                    <span className="text-[11px] font-bold" style={{ color: active ? ACCENT : '#9A92AD' }}>{scene.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.section>

          {/* Accessibility */}
          <motion.section
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { ...spring, delay: 0.24 }}
            className="pb-8"
          >
            <SectionHeader icon={<Volume2 size={18} />} title="Accessibility" />
            <div className="rounded-2xl p-4" style={cardBase}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{ color: '#1B1733' }}>Reduce Motion</div>
                  <div className="text-[11px]" style={{ color: '#9A92AD' }}>
                    Disables springy animations, confetti, and character ragdoll. Auto-detected from your OS.
                  </div>
                </div>
                <div
                  className="text-[11px] font-bold px-3 py-1 rounded-full"
                  style={{
                    background: reduced ? '#1DD3A01A' : '#FFFCF5',
                    color: reduced ? '#1DA97F' : '#9A92AD',
                    border: `1px solid ${reduced ? '#1DD3A040' : 'var(--color-panel-line)'}`,
                    fontFamily: 'var(--font-jetbrains)',
                  }}
                >
                  {reduced ? 'OS: ON' : 'OS: OFF'}
                </div>
              </div>
              <p className="text-[11px] mt-3" style={{ color: '#9A92AD' }}>
                Controlled by your OS accessibility settings (prefers-reduced-motion). CloudCraft always respects it.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
