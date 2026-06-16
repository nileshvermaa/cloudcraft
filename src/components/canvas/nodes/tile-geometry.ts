/**
 * Isometric tile geometry helpers.
 * The tile is an SVG cuboid with three visible faces:
 *   - top face (rhombus)   = category color
 *   - left wall            = category color darkened 12%
 *   - right wall           = category color darkened 22%
 *
 * Geometry (SVG viewBox 110x130):
 *   top face:   (55,10) (105,38) (55,66) (5,38)
 *   left wall:  (5,38)  (55,66)  (55,110) (5,82)
 *   right wall: (105,38)(55,66)  (55,110) (105,82)
 *   shadow:     ellipse cx=55 cy=118 rx=44 ry=7
 */

export const TILE_W = 110;
export const TILE_H = 130;

/** SVG polygon points for each face. */
export const TOP_FACE   = '55,10 105,38 55,66 5,38';
export const LEFT_WALL  = '5,38 55,66 55,110 5,82';
export const RIGHT_WALL = '105,38 55,66 55,110 105,82';

/** Icon center on the top face. */
export const ICON_CX = 55;
export const ICON_CY = 38;

/**
 * Darken a hex color by a fraction (0–1).
 * e.g. shade('#14B8A6', 0.12) → darker teal
 */
export function shade(hex: string, amount: number): string {
  // Parse hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const factor = 1 - amount;
  const nr = Math.max(0, Math.round(r * factor));
  const ng = Math.max(0, Math.round(g * factor));
  const nb = Math.max(0, Math.round(b * factor));

  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

/**
 * Returns all three face colors for a category hex color, supporting CSS theme overrides when category is provided.
 */
export function tileFaces(baseColor: string, category?: string) {
  if (category) {
    const catKey = category === 'networking' ? 'net' : category;
    return {
      top: `var(--color-cat-${catKey})`,
      left: `var(--color-cat-${catKey}-left)`,
      right: `var(--color-cat-${catKey}-right)`,
    };
  }
  return {
    top:   baseColor,
    left:  shade(baseColor, 0.12),
    right: shade(baseColor, 0.22),
  };
}
