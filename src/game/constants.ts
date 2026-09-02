// ─── Tile constants ───────────────────────────────────────────────────────────
export const TILE_SIZE = 16          // px per grid tile
export const COLS = 28               // maze width  in tiles
export const ROWS = 31               // maze height in tiles
export const CANVAS_W = COLS * TILE_SIZE   // 448 (internal render resolution)
export const CANVAS_H = ROWS * TILE_SIZE   // 496 (internal render resolution)
export const GAME_SCALE = 1.50             // 50% game size increase
export const DISPLAY_W = Math.round(CANVAS_W * GAME_SCALE) // 672px
export const DISPLAY_H = Math.round(CANVAS_H * GAME_SCALE) // 744px

// ─── Tile types ───────────────────────────────────────────────────────────────
export const T_EMPTY  = 0
export const T_WALL   = 1
export const T_DOT    = 2
export const T_PELLET = 3   // power pellet
export const T_DOOR   = 4   // ghost-house door (passable only by ghosts)
export const T_HOUSE  = 5   // ghost-house interior (ghosts only)

// ─── Directions ───────────────────────────────────────────────────────────────
export const DIR_NONE  = -1
export const DIR_RIGHT = 0
export const DIR_DOWN  = 1
export const DIR_LEFT  = 2
export const DIR_UP    = 3

export const DIR_VECTORS: Record<number, { dx: number; dy: number }> = {
  [DIR_RIGHT]: { dx: 1, dy: 0 },
  [DIR_DOWN]:  { dx: 0, dy: 1 },
  [DIR_LEFT]:  { dx: -1, dy: 0 },
  [DIR_UP]:    { dx: 0, dy: -1 },
}

// ─── Scoring ──────────────────────────────────────────────────────────────────
export const SCORE_DOT    = 10
export const SCORE_PELLET = 50
export const SCORE_GHOST  = [200, 400, 800, 1600]
export const EXTRA_LIFE_AT = 10_000

// ─── Ghost IDs ────────────────────────────────────────────────────────────────
export const BLINKY = 0
export const PINKY  = 1
export const INKY   = 2
export const CLYDE  = 3

// ─── Ghost scatter corners (tile coords) ─────────────────────────────────────
export const SCATTER_TARGETS = [
  { col: 25, row: 0  },  // Blinky — top-right
  { col: 2,  row: 0  },  // Pinky  — top-left
  { col: 27, row: 30 },  // Inky   — bottom-right
  { col: 0,  row: 30 },  // Clyde  — bottom-left
]

// ─── Ghost colors ─────────────────────────────────────────────────────────────
export const GHOST_COLORS = ['#FF0000', '#FFB8FF', '#00FFFF', '#FFB852']

// ─── Ghost home spawn positions (pixel centers) ───────────────────────────────
// Ghost house interior: cols 11-16, rows 13-15
export const GHOST_HOME_COLS = [14, 12, 14, 16]  // spawn col per ghost
export const GHOST_HOME_ROWS = [11, 14, 14, 14]  // spawn row per ghost (blinky starts above door)

// ─── Game Modes ───────────────────────────────────────────────────────────────
export type GameMode = 'solo' | 'local' | 'online'

// ─── Pac-Man start positions ───────────────────────────────────────────────────
export const PACMAN_START = { col: 14, row: 23 }
export const PACMAN1_START = { col: 13, row: 23 }
export const PACMAN2_START = { col: 15, row: 23 }

export const PACMAN1_COLOR = '#FFE000'
export const PACMAN2_COLOR = '#FF69B4'

export const GAME_SPEED_OPTIONS = [
  { label: '1.0x Normal', value: 1.0 },
  { label: '1.25x Fast',  value: 1.25 },
  { label: '1.5x Turbo',  value: 1.5 },
]

export const PACMAN_SPEEDS = [
  0.80, 0.90, 0.90, 0.90, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00,
  1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00,
  0.90, // Level 21+
]
export const PACMAN_FRIGHT_SPEEDS = [
  0.90, 0.95, 0.95, 0.95, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00,
  1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00,
]
export const GHOST_SPEEDS = [
  0.75, 0.85, 0.85, 0.85, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95,
  0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95,
]
export const GHOST_TUNNEL_SPEEDS = [
  0.40, 0.45, 0.45, 0.45, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50,
  0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50,
]
export const GHOST_FRIGHT_SPEEDS = [
  0.50, 0.55, 0.55, 0.55, 0.60, 0.60, 0.60, 0.60, 0.60, 0.60,
  0.60, 0.60, 0.60, 0.60, 0.60, 0.60, 0.60, 0.60, 0.60, 0.60,
]
export const GHOST_EATEN_SPEED = 1.5   // eyes move fast back home

// ─── Frightened duration (seconds) by level ──────────────────────────────────
export const FRIGHT_DURATION = [
  6, 5, 4, 3, 2, 5, 2, 2, 1, 5,
  2, 1, 1, 3, 1, 1, 0, 1, 0, 0,
]

// ─── Mode cycle timers (seconds) [scatter, chase, scatter, chase, ...] ────────
// Trailing Infinity = stay in chase forever
export const MODE_CYCLE: number[][] = [
  [7, 20, 7, 20, 5, 20, 5, Infinity],  // level 1
  [7, 20, 7, 20, 5, 1033, 1/60, Infinity],  // levels 2-4
]
export function getModeCycle(level: number): number[] {
  return level <= 1 ? MODE_CYCLE[0] : MODE_CYCLE[1]
}

// ─── Elroy thresholds (dots remaining to trigger Elroy 1/2) ──────────────────
export const ELROY1_DOTS = [20, 30, 40, 40, 40, 50, 50, 50, 60, 60, 60, 80, 80, 80, 100, 100, 100, 100, 120, 120]
export const ELROY2_DOTS = [10, 15, 20, 20, 20, 25, 25, 25, 30, 30, 30, 40, 40, 40, 50,  50,  50,  50,  60,  60]
export const ELROY1_SPEED = 0.85
export const ELROY2_SPEED = 0.95

// ─── Total dots in level ──────────────────────────────────────────────────────
export const TOTAL_DOTS = 244

// ─── Tunnel row ───────────────────────────────────────────────────────────────
export const TUNNEL_ROW = 14

// ─── Animation ────────────────────────────────────────────────────────────────
export const MOUTH_FRAMES = 8   // steps for open→close cycle
export const DEATH_FRAMES = 12  // animation frames for death
