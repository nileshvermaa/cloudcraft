'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft, Settings, Palette, Monitor, Globe, Volume2 } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import type { PaletteTheme, ProviderSkin, SceneBg } from '@/types';

const spring = { type: 'spring' as const, stiffness: 260, damping: 22 };

// ─── Palette themes ──────────────────────────────────────────────────────────
const PALETTE_THEMES: { id: PaletteTheme; label: string; colors: string[]; desc: string }[] = [
  {
    id: 'candy',
    label: 'Candy',
    colors: ['#9B5DE5', '#22B8FF', '#1DD3A0', '#FF6FA5'],
    desc: 'Vivid, saturated — the default DWTD world.',
  },
  {
    id: 'pastel',
    label: 'Pastel',
    colors: ['#D8B4FE', '#93C5FD', '#86EFAC', '#FBCFE8'],
    desc: 'Soft and muted — easy on the eyes.',
  },
  {
    id: 'neon',
    label: 'Neon',
    colors: ['#F00CDF', '#00F6FF', '#00FF66', '#FF0055'],
    desc: 'Max contrast, retro cyber vibes.',
  },
  {
    id: 'mono-pro',
    label: 'Mono Pro',
    colors: ['#FFFFFF', '#E2E8F0', '#94A3B8', '#475569'],
    desc: 'Grayscale — all about the architecture.',
  },
];

// ─── Provider skins ──────────────────────────────────────────────────────────
const PROVIDER_SKINS: { id: ProviderSkin; label: string; emoji: string; desc: string }[] = [
  { id: 'generic',    label: 'Generic',    emoji: '🏗️', desc: 'Neutral cloud vernacular — service concept names.' },
  { id: 'aws-style',  label: 'AWS-style',  emoji: '🟧', desc: 'Renamed to AWS equivalents (e.g. EC2, S3, Lambda).' },
  { id: 'azure-style',label: 'Azure-style',emoji: '🔵', desc: 'Renamed to Azure equivalents (e.g. VMs, Blob, Functions).' },
  { id: 'gcp-style',  label: 'GCP-style',  emoji: '🔴', desc: 'Renamed to GCP equivalents (e.g. GCE, GCS, Cloud Run).' },
];

// ─── Board scenes ─────────────────────────────────────────────────────────────
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
      <span style={{ color: '#9B5DE5' }}>{icon}</span>
      <h2
        className="text-base font-black uppercase tracking-wide"
        style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}
      >
        {title}
      </h2>
    </div>
  );
}

export default function SettingsPage() {
  const reduced = useReducedMotion();
  const { paletteTheme, setPaletteTheme, providerSkin, setProviderSkin, sceneBg, setSceneBg, loadBestScores } =
    useGameStore();

  useEffect(() => {
    loadBestScores();
  }, [loadBestScores]);

  return (
    <div
      className={`min-h-screen flex flex-col theme-${paletteTheme}`}
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
          <Settings size={16} style={{ color: '#9B5DE5' }} />
          <h1 className="text-xl font-black" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
            Settings
          </h1>
        </div>

        <div className="w-24" /> {/* spacer */}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-10">

          {/* Palette Theme */}
          <motion.section
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { ...spring, delay: 0.0 }}
          >
            <SectionHeader icon={<Palette size={18} />} title="Palette Theme" />
            <div className="grid grid-cols-2 gap-3">
              {PALETTE_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setPaletteTheme(theme.id)}
                  className="rounded-2xl p-4 text-left border-2 transition-all hover:shadow-md focus:outline-none"
                  style={{
                    background: paletteTheme === theme.id ? 'rgba(155,93,229,0.08)' : 'rgba(255,255,255,0.75)',
                    borderColor: paletteTheme === theme.id ? '#9B5DE5' : 'rgba(226,232,240,0.8)',
                    boxShadow: paletteTheme === theme.id ? '0 0 0 2px rgba(155,93,229,0.2)' : 'none',
                  }}
                >
                  {/* Color swatches */}
                  <div className="flex gap-1.5 mb-2">
                    {theme.colors.map((c) => (
                      <div key={c} className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div
                    className="text-[13px] font-black mb-0.5"
                    style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}
                  >
                    {theme.label}
                    {paletteTheme === theme.id && (
                      <span className="ml-2 text-[9px] font-mono text-[#9B5DE5] uppercase">active</span>
                    )}
                  </div>
                  <div className="text-[11px]" style={{ color: '#9A92AD' }}>{theme.desc}</div>
                </button>
              ))}
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
              Renames service tiles to a cloud provider&apos;s vernacular. Uses generic representations — no official logos or trademarks.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PROVIDER_SKINS.map((skin) => (
                <button
                  key={skin.id}
                  onClick={() => setProviderSkin(skin.id)}
                  className="rounded-2xl p-4 text-left border-2 transition-all hover:shadow-md focus:outline-none"
                  style={{
                    background: providerSkin === skin.id ? 'rgba(34,184,255,0.08)' : 'rgba(255,255,255,0.75)',
                    borderColor: providerSkin === skin.id ? '#22B8FF' : 'rgba(226,232,240,0.8)',
                    boxShadow: providerSkin === skin.id ? '0 0 0 2px rgba(34,184,255,0.2)' : 'none',
                  }}
                >
                  <div className="text-2xl mb-2">{skin.emoji}</div>
                  <div
                    className="text-[13px] font-black mb-0.5"
                    style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}
                  >
                    {skin.label}
                    {providerSkin === skin.id && (
                      <span className="ml-2 text-[9px] font-mono text-[#22B8FF] uppercase">active</span>
                    )}
                  </div>
                  <div className="text-[11px]" style={{ color: '#9A92AD' }}>{skin.desc}</div>
                </button>
              ))}
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
              {SCENE_BACKGROUNDS.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setSceneBg(scene.id)}
                  className="flex flex-col items-center gap-1.5 focus:outline-none"
                >
                  <div
                    className="w-16 h-16 rounded-2xl border-2 transition-all shadow-sm hover:scale-105"
                    style={{
                      backgroundColor: scene.color,
                      borderColor: sceneBg === scene.id ? '#9B5DE5' : 'rgba(226,232,240,0.8)',
                      boxShadow: sceneBg === scene.id ? '0 0 0 3px rgba(155,93,229,0.25)' : 'none',
                    }}
                  />
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: sceneBg === scene.id ? '#9B5DE5' : '#9A92AD' }}
                  >
                    {scene.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Motion toggle */}
          <motion.section
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { ...spring, delay: 0.24 }}
            className="pb-8"
          >
            <SectionHeader icon={<Volume2 size={18} />} title="Accessibility" />
            <div
              className="rounded-2xl p-4 border"
              style={{ background: 'rgba(255,255,255,0.75)', borderColor: 'rgba(226,232,240,0.8)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold" style={{ color: '#1B1733' }}>Reduce Motion</div>
                  <div className="text-[11px]" style={{ color: '#9A92AD' }}>
                    Disable springy animations, confetti, and character ragdoll. Also auto-detected from OS.
                  </div>
                </div>
                <div
                  className="text-[11px] font-mono px-3 py-1 rounded-full"
                  style={{
                    background: reduced ? 'rgba(29,211,160,0.1)' : 'rgba(226,232,240,0.6)',
                    color: reduced ? '#1DD3A0' : '#9A92AD',
                    border: `1px solid ${reduced ? 'rgba(29,211,160,0.3)' : 'rgba(226,232,240,0.8)'}`,
                  }}
                >
                  {reduced ? 'OS: ON' : 'OS: OFF'}
                </div>
              </div>
              <p className="text-[11px] mt-3 italic" style={{ color: '#9A92AD' }}>
                Motion is controlled by your OS accessibility settings (prefers-reduced-motion). CloudCraft Studio always respects this preference.
              </p>
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
}
