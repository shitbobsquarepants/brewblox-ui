// ---- Zones process ----
export interface ProcessZone {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// ---- Séquences ----
export interface StepActuator {
  block_id: string;
  block_type: 'pump' | 'valve' | 'sensor';
  value: number;
  apply_at_second: number;
}
export interface SequenceStep {
  name: string;
  duration_minutes: number;
  temperature: number | null;
  pressure: number | null;
  flow_rate: number | null;
  power: number | null;
  actuators?: StepActuator[];
}

export interface SparkBlocks {
  vannes: string[];
  pompes: string[];
  capteurs: string[];
}

export interface Sequence {
  id: string;
  name: string;
  zone_id: string;
  steps: SequenceStep[];
  spark_blocks: SparkBlocks;
}

// ---- Recettes ----
export interface RecipeStep {
  id: string;
  zone_id: string;
  sequence_id: string;
  label: string;  // affiché dans le workflow
}

export interface Recipe {
  id: string;
  name: string;
  steps: RecipeStep[];  // ordonnés, s'enchaînent sur COMPLETED
}

// ---- Widget configs ----
export interface SequenceWidgetConfig {
  title: string;
}

export interface RecipeWidgetConfig {
  title: string;
}
