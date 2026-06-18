'use client';

/**
 * CosmeticPanel — provider skin, board scene, palette theme toggles.
 * Purely cosmetic — mechanics and scores are unchanged.
 */

import { motion } from 'motion/react';
import { Palette, Monitor, Globe, Sun } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import type { ProviderSkin, PaletteTheme, SceneBg } from '@/types';
import { cn } from '@/lib/utils';

const PROVIDER_SKINS: { value: ProviderSkin; label: string; emoji: string }[] = [
  { value: 'generic',    label: 'Generic',     emoji: '☁️' },
  { value: 'aws-style',  label: 'AWS-style',   emoji: '🟠' },
  { value: 'azure-style',label: 'Azure-style', emoji: '🔵' },
  { value: 'gcp-style',  label: 'GCP-style',   emoji: '🟡' },
];

const SCENES: { value: SceneBg; label: string; color: string }[] = [
  { value: 'vanilla', label: 'Vanilla', color: '#FFF7ED' },
  { value: 'sky',     label: 'Sky',     color: '#E8F6FF' },
  { value: 'mint',    label: 'Mint',    color: '#E7FBF3' },
  { value: 'bubble',  label: 'Bubble',  color: '#FFEAF2' },
  { value: 'dusk',    label: 'Dusk',    color: '#EEEAFE' },
];

const THEMES: { value: PaletteTheme; label: string; swatches: string[] }[] = [
  { value: 'candy',    label: 'Candy',    swatches: ['#9B5DE5', '#22B8FF', '#FF8A3D', '#1DD3A0', '#3D5AFE', '#FF6FA5'] },
  { value: 'pastel',   label: 'Pastel',   swatches: ['#D8B4FE', '#93C5FD', '#FDBA74', '#86EFAC', '#A5B4FC', '#FBCFE8'] },
  { value: 'neon',     label: 'Neon',     swatches: ['#F00CDF', '#00F6FF', '#FF5E00', '#00FF66', '#3900FF', '#FF0055'] },
  { value: 'mono-pro', label: 'Mono Pro', swatches: ['#FFFFFF', '#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#475569'] },
];

const ACCENT = '#9B5DE5';

function Section({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="py-3 px-3.5" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: ACCENT }} className="flex-shrink-0">{icon}</span>
        <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#9A92AD' }}>
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
      <div className="px-3.5 py-3" style={{ borderBottom: '1px solid var(--color-panel-line)' }}>
        <div className="flex items-center gap-1.5">
          <Palette size={13} style={{ color: ACCENT }} />
          <h2 className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: '#1B1733' }}>
            Style
          </h2>
        </div>
        <p className="text-[10px] mt-0.5" style={{ color: '#9A92AD' }}>
          Looks only — scores unchanged
        </p>
      </div>

      <Section label="Provider" icon={<Globe size={12} />}>
        <div className="grid grid-cols-2 gap-1.5">
          {PROVIDER_SKINS.map((skin) => {
            const active = providerSkin === skin.value;
            return (
              <button
                key={skin.value}
                onClick={() => setProviderSkin(skin.value)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                style={
                  active
                    ? { background: `${ACCENT}1A`, border: `1px solid ${ACCENT}`, color: ACCENT }
                    : { background: '#FFFCF5', border: '1px solid var(--color-panel-line)', color: '#5B5470' }
                }
              >
                <span className="text-[14px] leading-none">{skin.emoji}</span>
                {skin.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section label="Board Scene" icon={<Monitor size={12} />}>
        <div className="flex gap-2 flex-wrap">
          {SCENES.map((scene) => (
            <button
              key={scene.value}
              onClick={() => setSceneBg(scene.value)}
              title={scene.label}
              className={cn('w-8 h-8 rounded-lg transition-all hover:scale-110')}
              style={{
                backgroundColor: scene.color,
                border: sceneBg === scene.value ? `2px solid ${ACCENT}` : '2px solid var(--color-panel-line)',
                boxShadow: sceneBg === scene.value ? `0 0 0 2px ${ACCENT}40` : 'none',
              }}
            />
          ))}
        </div>
        <p className="text-[10px] mt-1.5 font-medium capitalize" style={{ color: '#9A92AD' }}>
          {SCENES.find((s) => s.value === sceneBg)?.label ?? ''} scene active
        </p>
      </Section>

      <Section label="Color Palette" icon={<Sun size={12} />}>
        <div className="space-y-1.5">
          {THEMES.map((theme) => {
            const active = paletteTheme === theme.value;
            return (
              <button
                key={theme.value}
                onClick={() => setPaletteTheme(theme.value)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
                style={
                  active
                    ? { background: `${ACCENT}1A`, border: `1px solid ${ACCENT}`, color: ACCENT }
                    : { background: '#FFFCF5', border: '1px solid var(--color-panel-line)', color: '#5B5470' }
                }
              >
                <div className="flex gap-0.5 flex-shrink-0">
                  {theme.swatches.map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-[10px] font-bold">{theme.label}</span>
                {active && <span className="ml-auto text-[9px] font-bold uppercase">Active</span>}
              </button>
            );
          })}
        </div>
      </Section>
    </motion.div>
  );
}
