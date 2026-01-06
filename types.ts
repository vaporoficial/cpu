
export interface TimerState {
  id: string;
  totalSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  label: string;
  customAlertText?: string;
  isLooping: boolean;
}

export interface SavedTimer {
  id: string;
  minutes: number;
  seconds: number;
  label: string;
  customAlertText: string;
  isLooping: boolean;
}

export interface AlarmState {
  id: string;
  time: string;
  isActive: boolean;
  label: string;
  customAlertText?: string;
}

export enum ViewMode {
  FULL = 'FULL',
  BUBBLE = 'BUBBLE'
}

export const VOICES = [
  { name: 'Zephyr', label: 'Voz Neural 1' },
  { name: 'Kore', label: 'Voz Neural 2' },
  { name: 'Puck', label: 'Voz Neural 3' },
  { name: 'Charon', label: 'Voz Neural 4' },
  { name: 'Fenrir', label: 'Voz Neural 5' }
];

export const VOICE_STYLES = [
  { id: 'normal', label: 'Padrão', prefix: '' },
  { id: 'alert', label: 'Alerta Crítico', prefix: 'URGENTE: ' },
  { id: 'calm', label: 'Zen / Calmo', prefix: 'Com calma e suavidade: ' },
  { id: 'robot', label: 'Robótico', prefix: 'Em voz sintética e robótica: ' }
];
