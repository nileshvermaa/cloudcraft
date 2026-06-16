'use client';

/**
 * CosmeticPanel — Phase C1
 *
 * Provider skin, board scene, palette theme + character theme toggles.
 * Purely cosmetic — mechanics and scores are unchanged.
 */

import { motion } from 'motion/react';
import { Palette, Monitor, Globe, Sun } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import type { ProviderSkin, PaletteTheme, SceneBg } from '@/types';
import { cn } from '@/lib/utils';

/* ─── Provider skin labels (no trademarks, generic representations) ───────── */
const PROVIDER_SKINS: { value: ProviderSkin; label: string; emoji: string }[] = [
  { value: 'generic',    label: 'Generic',     emoji: '☁️' },
  { value: 'aws-style',  label: 'AWS-style',   emoji: '🟠' },
  { value: 'azure-style',label: 'Azure-style', emoji: '🔵' },
  { value: 'gcp-style',  label: 'GCP-style',   emoji: '🟡' },
];

/* ─── Board scenes ─────────────────────────────────────────────────────────── */
const SCENES: { value: SceneBg; label: string; color: string }[] = [
  { value: 'vanilla', label: 'Vanilla', color: '#FFF7ED' },
  { value: 'sky',     label: 'Sky',     color: '#E8F6FF' },
  { value: 'mint',    label: 'Mint',    color: '#E7FBF3' },
  { value: 'bubble',  label: 'Bubble',  color: '#FFEAF2' },
  { value: 'dusk',    label: 'Dusk',    color: '#EEEAFE' },
];

/* ─── Palette themes ────────────────────────────────────────────────────────── */
const THEMES: { value: PaletteTheme; label: string; swatches: string[] }[] = [
  { value: 'candy',    label: 'Candy',    swatches: ['#9B5DE5', '#22B8FF', '#FF8A3D', '#1DD3A0', '#3D5AFE', '#FF6FA5'] },
  { value: 'pastel',   label: 'Pastel',   swatches: ['#D8B4FE', '#93C5FD', '#FDBA74', '#86EFAC', '#A5B4FC', '#FBCFE8'] },
  { value: 'neon',     label: 'Neon',     swatches: ['#F00CDF', '#00F6FF', '#FF5E00', '#00FF66', '#3900FF', '#FF0055'] },
  { value: 'mono-pro', label: 'Mono Pro', swatches: ['#FFFFFF', '#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#475569'] },
];

function Section({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="py-3 px-3.5 border-b border-[var(--color-chrome-border)]">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-teal-500 flex-shrink-0">{icon}</span>
        <h3 className="text-[10px] font-black text-[var(--color-chrome-bright)] uppercase tracking-wider">
          {label}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function CosmeticPanel() {
  const { providerSkin, paletteTheme, sceneBg, setProviderSkin, setPaletteTheme, setSceneBg } =
    useGameStore();

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    >
      {/* Header */}
      <div className="px-3.5 py-3 border-b border-[var(--color-chrome-border)] bg-slate-950/15">
        <div className="flex items-center gap-1.5">
          <Palette size={12} className="text-teal-500" />
          <h2 className="text-[10px] font-black text-[var(--color-chrome-bright)] uppercase tracking-wider">
            Cosmetics
          </h2>
        </div>
        <p className="text-[9px] text-[var(--color-chrome-text)]/70 mt-0.5">
          Style only — scores unchanged
        </p>
      </div>

      {/* Provider Skin */}
      <Section label="Provider Style" icon={<Globe size={11} />}>
        <div className="grid grid-cols-2 gap-1.5">
          {PROVIDER_SKINS.map((skin) => (
            <button
              key={skin.value}
              onClick={() => setProviderSkin(skin.value)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all',
                providerSkin === skin.value
                  ? 'border-teal-500 bg-teal-500/15 text-teal-400 shadow-[0_0_0_1px_rgba(20,184,166,0.3)]'
                  : 'border-[var(--color-chrome-border)] bg-[var(--color-chrome-soft)] text-[var(--color-chrome-text)] hover:border-slate-600'
              )}
            >
              <span className="text-[14px] leading-none">{skin.emoji}</span>
              {skin.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Board Scene */}
      <Section label="Board Scene" icon={<Monitor size={11} />}>
        <div className="flex gap-2 flex-wrap">
          {SCENES.map((scene) => (
            <button
              key={scene.value}
              onClick={() => setSceneBg(scene.value)}
              title={scene.label}
              className={cn(
                'w-8 h-8 rounded-lg border-2 transition-all shadow-sm hover:scale-110',
                sceneBg === scene.value
                  ? 'border-teal-400 shadow-[0_0_0_2px_rgba(20,184,166,0.4)]'
                  : 'border-[var(--color-chrome-border)] hover:border-slate-500'
              )}
              style={{ backgroundColor: scene.color }}
            />
          ))}
        </div>
        <p className="text-[9px] text-[var(--color-chrome-text)]/60 mt-1.5 font-medium capitalize">
          {SCENES.find((s) => s.value === sceneBg)?.label ?? ''} scene active
        </p>
      </Section>

      {/* Palette Theme */}
      <Section label="Color Palette" icon={<Sun size={11} />}>
        <div className="space-y-1.5">
          {THEMES.map((theme) => (
            <button
              key={theme.value}
              onClick={() => setPaletteTheme(theme.value)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all',
                paletteTheme === theme.value
                  ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                  : 'border-[var(--color-chrome-border)] bg-[var(--color-chrome-soft)] text-[var(--color-chrome-text)] hover:border-slate-600'
              )}
            >
              {/* Swatch strip */}
              <div className="flex gap-0.5 flex-shrink-0">
                {theme.swatches.map((c, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold">{theme.label}</span>
              {paletteTheme === theme.value && (
                <span className="ml-auto text-[9px] font-black text-teal-400">ACTIVE</span>
              )}
            </button>
          ))}
        </div>
      </Section>
    </motion.div>
  );
}
