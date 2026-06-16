import type { SandboxPreset } from '@/types';

export const PRESETS: SandboxPreset[] = [
  {
    id: 'freestyle',
    label: 'Freestyle',
    hint: 'Build anything — no traffic profile applied.',
    readShare: 0.7,
    staticShare: 0.2,
  },
  {
    id: 'youtube',
    label: 'YouTube-like',
    hint: 'Video delivery + metadata + background transcoding. Reads dominate; static assets are huge.',
    readShare: 0.9,
    staticShare: 0.6,
  },
  {
    id: 'twitter',
    label: 'Social Feed',
    hint: 'Read-heavy timelines + write fan-out. Almost no static cacheable content.',
    readShare: 0.95,
    staticShare: 0.1,
  },
  {
    id: 'shop',
    label: 'E-commerce',
    hint: 'Mixed read/write catalog + checkout. Spiky traffic on sale events.',
    readShare: 0.7,
    staticShare: 0.3,
  },
];

export const PRESET_MAP: Record<string, SandboxPreset> = Object.fromEntries(
  PRESETS.map((p) => [p.id, p])
);
