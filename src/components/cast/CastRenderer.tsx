'use client';

/**
 * CastRenderer — Phase V2
 *
 * Code-drawn SVG blob placeholders for the five cast members.
 * Swap `.riv` art in when authored in the Rive editor.
 *
 * Props driven entirely by SimResult so the characters never fake data.
 */

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import type { SimResult } from '@/types';

/* ─── Palette of Ping jellybean colors ─────────────────────────────────────── */
const PING_COLORS = ['#FF6B6B', '#FFD93D', '#4ECDC4', '#A78BFA', '#FF8FB1', '#A3E635', '#FFA94D'];



function DotEyes({ cx, cy, eyeColor = 'white' }: { cx: number; cy: number; eyeColor?: string }) {
  return (
    <>
      <circle cx={cx - 5} cy={cy} r={2.5} fill="#1B1733" />
      <circle cx={cx + 5} cy={cy} r={2.5} fill="#1B1733" />
      <circle cx={cx - 4} cy={cy - 0.5} r={1} fill={eyeColor} />
      <circle cx={cx + 6} cy={cy - 0.5} r={1} fill={eyeColor} />
    </>
  );
}

function Blush({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <ellipse cx={cx - 10} cy={cy} rx={4} ry={2.5} fill="#FF8FB1" opacity={0.6} />
      <ellipse cx={cx + 10} cy={cy} rx={4} ry={2.5} fill="#FF8FB1" opacity={0.6} />
    </>
  );
}

/* ─── NIMBUS — host / guide ─────────────────────────────────────────────────── */
export function Nimbus({
  state = 'idle',
  size = 80,
}: {
  state?: 'idle' | 'cheer' | 'faint' | 'point';
  size?: number;
}) {
  const reduced = useReducedMotion();
  const blobClass = reduced
    ? ''
    : state === 'idle'
    ? 'blob-idle'
    : state === 'cheer'
    ? 'blob-cheer'
    : state === 'faint'
    ? 'blob-faint'
    : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      style={{ overflow: 'visible' }}
      aria-label="Nimbus"
    >
      {/* Cloud puff body */}
      <g className={blobClass} style={{ transformOrigin: '40px 44px' }}>
        {/* Stubby arms */}
        <ellipse cx={16} cy={50} rx={8} ry={6} fill="#D1C4E9" transform="rotate(-20 16 50)" />
        <ellipse cx={64} cy={50} rx={8} ry={6} fill="#D1C4E9" transform="rotate(20 64 50)" />
        {/* Main body — cloud blob */}
        <ellipse cx={40} cy={44} rx={22} ry={20} fill="#EDE7F6" />
        {/* Cloud puff top-left */}
        <circle cx={24} cy={32} r={11} fill="#EDE7F6" />
        {/* Cloud puff top-right */}
        <circle cx={54} cy={32} r={11} fill="#EDE7F6" />
        {/* Cloud puff top center */}
        <circle cx={40} cy={26} r={13} fill="#EDE7F6" />
        {/* Eyes */}
        <DotEyes cx={40} cy={40} />
        {/* Blush */}
        <Blush cx={40} cy={47} />
        {/* Smile / expression */}
        {state !== 'faint' ? (
          <path
            d={state === 'cheer' ? 'M33 51 Q40 58 47 51' : 'M34 51 Q40 56 46 51'}
            stroke="#1B1733"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        ) : (
          /* faint — flat line */
          <path d="M35 52 H45" stroke="#1B1733" strokeWidth={2} strokeLinecap="round" />
        )}
        {/* Point arm */}
        {state === 'point' && (
          <line
            x1={64}
            y1={44}
            x2={76}
            y2={36}
            stroke="#B39DDB"
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}
      </g>
    </svg>
  );
}

/* ─── Single PING blob ────────────────────────────────────────────────────── */
function PingBlob({
  color,
  state = 'happy',
  size = 28,
  style,
}: {
  color: string;
  state: 'happy' | 'anxious' | 'sleepy' | 'splat';
  size?: number;
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const blobClass =
    !reduced && state === 'splat' ? 'blob-squash' : !reduced ? 'blob-idle' : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      style={{ overflow: 'visible', ...style }}
    >
      <g className={blobClass} style={{ transformOrigin: '14px 14px' }}>
        {/* Tiny legs */}
        {state !== 'splat' && (
          <>
            <rect x={10} y={20} width={3} height={5} rx={1.5} fill={color} opacity={0.7} />
            <rect x={15} y={20} width={3} height={5} rx={1.5} fill={color} opacity={0.7} />
          </>
        )}
        {/* Body */}
        <ellipse
          cx={14}
          cy={13}
          rx={state === 'splat' ? 16 : 10}
          ry={state === 'splat' ? 5 : 9}
          fill={color}
        />
        {/* Eyes */}
        {state === 'splat' ? (
          /* X eyes on splat */
          <>
            <text x={8} y={14} fontSize={6} fill="#1B1733" fontWeight="bold">✕</text>
            <text x={14} y={14} fontSize={6} fill="#1B1733" fontWeight="bold">✕</text>
          </>
        ) : state === 'sleepy' ? (
          /* Half-closed eyes */
          <>
            <ellipse cx={10} cy={11} rx={2} ry={1} fill="#1B1733" />
            <ellipse cx={18} cy={11} rx={2} ry={1} fill="#1B1733" />
          </>
        ) : (
          <>
            <circle cx={10} cy={11} r={1.8} fill="#1B1733" />
            <circle cx={18} cy={11} r={1.8} fill="#1B1733" />
            <circle cx={10.5} cy={10.5} r={0.7} fill="white" />
            <circle cx={18.5} cy={10.5} r={0.7} fill="white" />
          </>
        )}
        {/* Expression */}
        {state === 'happy' && (
          <path d="M11 15 Q14 18 17 15" stroke="#1B1733" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        )}
        {state === 'anxious' && (
          <path d="M11 16 Q14 14 17 16" stroke="#1B1733" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        )}
        {state === 'sleepy' && (
          <>
            <path d="M11 15 L17 15" stroke="#1B1733" strokeWidth={1.5} strokeLinecap="round" />
            {/* Z floats */}
            <text x={18} y={8} fontSize={5} fill="#94A3B8" fontWeight="bold">z</text>
            <text x={21} y={5} fontSize={4} fill="#94A3B8" fontWeight="bold">z</text>
          </>
        )}
      </g>
    </svg>
  );
}

/* ─── Pings layer — sprinkled over the canvas ──────────────────────────────── */
export function PingsLayer({
  count,
  state,
}: {
  count: number;
  state: 'happy' | 'anxious' | 'sleepy' | 'splat';
}) {
  const reduced = useReducedMotion();
  // Place up to 12 Pings in a gentle arc
  const displayed = Math.min(count, 12);

  return (
    <AnimatePresence>
      {Array.from({ length: displayed }).map((_, i) => {
        const color = PING_COLORS[i % PING_COLORS.length];
        const x = 80 + i * 36 + (i % 3) * 8;
        const y = 160 + ((i % 4) - 1.5) * 18;
        const delay = i * 0.08;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5, y: y + 20 }}
            animate={{ opacity: 1, scale: 1, y }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 20, delay }}
            style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }}
          >
            <PingBlob color={color} state={state} size={24} />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}

/* ─── THE LEAK — masked intruder bean ───────────────────────────────────────── */
export function TheLeakCharacter({
  state = 'sneak',
  style,
}: {
  state: 'sneak' | 'grab' | 'bounced';
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      style={{ position: 'absolute', ...style }}
      initial={{ x: -60, opacity: 0 }}
      animate={
        state === 'sneak'
          ? { x: 0, opacity: 1 }
          : state === 'grab'
          ? { x: 60, rotate: -15, opacity: 1 }
          : { x: -80, rotate: 20, opacity: 0 }
      }
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 18 }}
    >
      <svg width={44} height={52} viewBox="0 0 44 52" style={{ overflow: 'visible' }}>
        {/* Mask */}
        <ellipse cx={22} cy={12} rx={14} ry={10} fill="#1E293B" />
        <path d="M8 12 Q22 6 36 12" fill="#334155" />
        {/* Eye holes */}
        <ellipse cx={16} cy={13} rx={3} ry={2} fill="#E2E8F0" />
        <ellipse cx={28} cy={13} rx={3} ry={2} fill="#E2E8F0" />
        <circle cx={16} cy={13} r={1.5} fill="#1B1733" />
        <circle cx={28} cy={13} r={1.5} fill="#1B1733" />
        {/* Body */}
        <ellipse cx={22} cy={30} rx={14} ry={16} fill="#475569" />
        {/* Sack (DATA bag) */}
        {state === 'grab' && (
          <g>
            <ellipse cx={36} cy={38} rx={8} ry={10} fill="#FCD34D" />
            <text x={30} y={40} fontSize={5} fontWeight="bold" fill="#1B1733">DATA</text>
            <line x1={29} y1={30} x2={36} y2={34} stroke="#94A3B8" strokeWidth={2} strokeLinecap="round" />
          </g>
        )}
        {/* Bounced — stars */}
        {state === 'bounced' && (
          <>
            <text x={8} y={10} fontSize={10}>⭐</text>
            <text x={26} y={8} fontSize={8}>✨</text>
          </>
        )}
        {/* Feet */}
        <ellipse cx={16} cy={46} rx={5} ry={4} fill="#334155" />
        <ellipse cx={28} cy={46} rx={5} ry={4} fill="#334155" />
      </svg>
    </motion.div>
  );
}

/* ─── THE CREW — hard-hat ops blob ─────────────────────────────────────────── */
export function TheCrewCharacter({
  state = 'work',
  style,
}: {
  state: 'work' | 'panic' | 'faint';
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const blobClass = !reduced
    ? state === 'panic'
      ? 'blob-cheer'
      : state === 'faint'
      ? 'blob-faint'
      : 'blob-idle'
    : '';
  const color = '#FB923C';

  return (
    <div style={{ position: 'absolute', ...style }}>
      <svg width={36} height={44} viewBox="0 0 36 44" style={{ overflow: 'visible' }}>
        <g className={blobClass} style={{ transformOrigin: '18px 24px' }}>
          {/* Hard hat */}
          <ellipse cx={18} cy={10} rx={14} ry={6} fill="#FCD34D" />
          <rect x={6} y={9} width={24} height={5} rx={2} fill="#F59E0B" />
          {/* Head */}
          <ellipse cx={18} cy={20} rx={12} ry={12} fill={color} />
          {/* Eyes */}
          <circle cx={13} cy={19} r={2} fill="#1B1733" />
          <circle cx={23} cy={19} r={2} fill="#1B1733" />
          {state === 'panic' && (
            /* Wide panic eyes */
            <>
              <circle cx={13} cy={19} r={3} fill="#1B1733" />
              <circle cx={23} cy={19} r={3} fill="#1B1733" />
              <circle cx={14} cy={18} r={1} fill="white" />
              <circle cx={24} cy={18} r={1} fill="white" />
            </>
          )}
          {/* Mouth */}
          {state === 'work' ? (
            <path d="M14 26 Q18 29 22 26" stroke="#1B1733" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          ) : state === 'panic' ? (
            <ellipse cx={18} cy={27} rx={4} ry={3} fill="#1B1733" />
          ) : (
            <path d="M14 27 L22 27" stroke="#1B1733" strokeWidth={1.5} strokeLinecap="round" />
          )}
          {/* Body */}
          <ellipse cx={18} cy={38} rx={10} ry={8} fill={color} opacity={0.85} />
          {/* Wrench/tool */}
          {state === 'work' && (
            <line x1={28} y1={28} x2={34} y2={22} stroke="#94A3B8" strokeWidth={3} strokeLinecap="round" />
          )}
        </g>
      </svg>
    </div>
  );
}

/* ─── BILLY — the accountant bean ─────────────────────────────────────────── */
export function BillyCharacter({
  state = 'ok',
  style,
}: {
  state: 'ok' | 'faint';
  style?: React.CSSProperties;
}) {
  const reduced = useReducedMotion();
  const blobClass = !reduced
    ? state === 'faint'
      ? 'blob-faint'
      : 'blob-idle'
    : '';

  return (
    <div style={{ position: 'absolute', ...style }}>
      <svg width={40} height={52} viewBox="0 0 40 52" style={{ overflow: 'visible' }}>
        <g className={blobClass} style={{ transformOrigin: '20px 28px' }}>
          {/* Head */}
          <ellipse cx={20} cy={18} rx={14} ry={14} fill="#60A5FA" />
          {/* Glasses */}
          <rect x={8} y={16} width={10} height={6} rx={3} fill="none" stroke="#1E293B" strokeWidth={1.5} />
          <rect x={22} y={16} width={10} height={6} rx={3} fill="none" stroke="#1E293B" strokeWidth={1.5} />
          <line x1={18} y1={19} x2={22} y2={19} stroke="#1E293B" strokeWidth={1.5} />
          {/* Eyes */}
          <circle cx={13} cy={19} r={1.5} fill="#1B1733" />
          <circle cx={27} cy={19} r={1.5} fill="#1B1733" />
          {/* Expression */}
          {state === 'ok' ? (
            <path d="M15 27 Q20 31 25 27" stroke="#1B1733" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          ) : (
            <path d="M15 29 Q20 25 25 29" stroke="#1B1733" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          )}
          {/* Body */}
          <ellipse cx={20} cy={40} rx={12} ry={10} fill="#93C5FD" />
          {/* Ledger */}
          <rect x={9} y={35} width={10} height={14} rx={2} fill="white" stroke="#CBD5E1" strokeWidth={1} />
          <line x1={11} y1={40} x2={17} y2={40} stroke="#94A3B8" strokeWidth={1} />
          <line x1={11} y1={43} x2={17} y2={43} stroke="#94A3B8" strokeWidth={1} />
          {state === 'faint' && (
            /* Invoice flying off */
            <g transform="rotate(-25 20 28) translate(18, 8)">
              <rect width={14} height={18} rx={2} fill="white" stroke="#EF4444" strokeWidth={1.5} />
              <text x={2} y={10} fontSize={5} fill="#EF4444" fontWeight="bold">BILL</text>
              <text x={2} y={16} fontSize={4} fill="#EF4444">$$$$</text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

/* ─── CastBar — the cast mini-row shown during/after simulation ───────────── */
export function CastBar({ result }: { result: SimResult | null }) {
  const reduced = useReducedMotion();

  // Derive cast states from SimResult
  const grade = result?.grade ?? null;
  const hasSecurityViolation = (result?.securityViolations ?? []).length > 0;
  const isOverBudget = (result?.monthlyCost ?? 0) > 5_000;
  const isOverloaded = (result?.overloadedNodeIds ?? []).length > 0;
  const hasSpof = (result?.spofs ?? []).length > 0;
  const isHighLatency = (result?.p50LatencyMs ?? 0) > 800;

  const nimbusState: 'idle' | 'cheer' | 'faint' | 'point' =
    !result
      ? 'idle'
      : grade === 'S' || grade === 'A'
      ? 'cheer'
      : grade === 'F'
      ? 'faint'
      : 'point';

  const pingState: 'happy' | 'anxious' | 'sleepy' | 'splat' =
    !result
      ? 'happy'
      : isOverloaded
      ? 'splat'
      : hasSpof
      ? 'anxious'
      : isHighLatency
      ? 'sleepy'
      : 'happy';

  const crewState: 'work' | 'panic' | 'faint' =
    !result ? 'work' : isOverloaded ? 'panic' : hasSpof ? 'faint' : 'work';

  const leakState: 'sneak' | 'grab' | 'bounced' =
    !result ? 'sneak' : hasSecurityViolation ? 'grab' : 'bounced';

  const billyState: 'ok' | 'faint' = !result || !isOverBudget ? 'ok' : 'faint';

  const pingCount = result ? Math.round(Math.min(result.servedRps / 1000, 8)) + 2 : 3;

  return (
    <motion.div
      className="flex items-end gap-3 px-4 py-2 select-none"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 250, damping: 20 }}
    >
      {/* Nimbus */}
      <div className="relative" title="Nimbus — your guide">
        <Nimbus state={nimbusState} size={52} />
      </div>

      {/* Pings (mini row) */}
      <div className="flex items-end gap-1">
        {Array.from({ length: Math.min(pingCount, 5) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', delay: i * 0.06 }}
          >
            <PingBlob color={PING_COLORS[i % PING_COLORS.length]} state={pingState} size={20} />
          </motion.div>
        ))}
      </div>

      {/* The Crew */}
      <div style={{ position: 'relative', width: 36, height: 44 }}>
        <TheCrewCharacter state={crewState} />
      </div>

      {/* Billy */}
      <div style={{ position: 'relative', width: 40, height: 52 }}>
        <BillyCharacter state={billyState} />
      </div>

      {/* The Leak — only when security issue present */}
      <AnimatePresence>
        {result && (
          <div style={{ position: 'relative', width: 44, height: 52 }}>
            <TheLeakCharacter state={leakState} />
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
