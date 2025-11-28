export enum GameType {
  MENU = 'MENU',
  COLORING = 'COLORING',
  DRAWING = 'DRAWING',
  PATTERN = 'PATTERN',
  PUZZLE = 'PUZZLE',
  DICE_STORY = 'DICE_STORY',
  DIFFERENCE = 'DIFFERENCE',
}

export interface GameConfig {
  id: GameType;
  color: string;
  icon: string; // Lucide icon name
  description: string; // For internal use, displayed via TTS
}

export interface PatternItem {
  id: number;
  type: 'shape' | 'color' | 'size';
  value: string; // Color code or Shape name
}

export interface PuzzlePiece {
  id: number;
  currentPos: number; // 0-3
  correctPos: number; // 0-3
  imagePart: string; // Data URL
}

export interface DifferenceItem {
  id: number;
  isDifferent: boolean;
  type: string;
  rotation: number;
  color: string;
  scale: number;
}
