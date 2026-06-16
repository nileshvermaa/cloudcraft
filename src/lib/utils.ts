import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let idCounter = 0;
export function genId(): string {
  return `node-${Date.now()}-${++idCounter}`;
}

export function formatRps(rps: number): string {
  if (rps >= 1_000_000) return `${(rps / 1_000_000).toFixed(1)}M RPS`;
  if (rps >= 1_000) return `${(rps / 1_000).toFixed(1)}k RPS`;
  return `${rps} RPS`;
}

export function formatMs(ms: number): string {
  return `${ms}ms`;
}

export function formatUsd(usd: number): string {
  return `$${usd.toLocaleString()}/mo`;
}

export function formatAvailability(avail: number): string {
  const pct = (avail * 100).toFixed(3);
  return `${pct}%`;
}

export function nines(avail: number): string {
  const pct = (avail * 100).toFixed(3);
  return `${pct}% (${countNines(avail)} nines)`;
}

function countNines(avail: number): string {
  const n = -Math.log10(1 - avail);
  return n.toFixed(1);
}
