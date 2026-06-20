import { BuilderBlueprint } from '@/plugins/builder/types';

export type ZoneStatus = 'idle' | 'running' | 'hold' | 'timehold';

export type PhaseAction =
  | 'start'
  | 'restart'
  | 'hold'
  | 'kill'
  | 'timehold'
  | 'resume'
  | 'step+1';

export interface SequenceStep {
  name: string;
  duration: number;
  temperature: number | null;
  pressure: number | null;
  flowRate: number | null;
  power: number | null;
}

export interface SparkBlocks {
  vannes: string[];
  pompes: string[];
  capteurs: string[];
  zones?: string[];
}

export interface Sequence {
  id: string;
  name: string;
  type: string;
  steps: SequenceStep[];
  sparkBlocks: SparkBlocks;
}

export interface ZoneState {
  zoneId: string;
  label: string;
  status: ZoneStatus;
  isHolding: boolean;
  isTimeHolding: boolean;
  pendingAction: PhaseAction | null;
  loadedSequenceId: string | null;
  currentStep: number;
  timeRemaining: number;
  totalTime: number;
}

export const PHASE_CONTROL_ZONES_KEY = 'phaseControlZones';
export const PHASE_CONTROL_SEQUENCES_KEY = 'phaseControlSequences';

const blueprint: BuilderBlueprint = {
  type: 'PhaseControl',
  title: 'Phase Control',
  component: 'PhaseControlPartComponent',
  defaultSize: { width: 10, height: 8 },
  transitions: () => ({}),
};

export default blueprint;
