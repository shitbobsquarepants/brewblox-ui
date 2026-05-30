// Types pour le plugin industrial BrewBlox

export type SensorStatus =
  | 'OK'
  | 'VIDE_TUYAU'
  | 'ALARME_DEBIT'
  | 'ALARME_HAUTE'
  | 'ALARME_BASSE'
  | 'HORS_PLAGE'
  | 'ERREUR_COM'
  | 'NORMAL'
  | 'PLEIN'
  | 'VIDE';

// Données reçues via MQTT brewcast/state/{sensor_id}
export interface IndustrialStateEvent {
  type: string;
  key: string;
  data: Record<string, unknown>;
}

export interface FlowSensorState {
  sensor_id: string;
  name: string;
  flow_rate: number;
  flow_unit: string;
  batch_volume: number;
  total_volume: number;
  volume_unit: string;
  status: SensorStatus;
  consecutive_errors: number;
  timestamp: number;
}

export interface PressureSensorState {
  sensor_id: string;
  name: string;
  pressure: number;
  unit: string;
  temperature: number | null;
  status: SensorStatus;
  consecutive_errors: number;
  timestamp: number;
}

export interface LevelSensorState {
  sensor_id: string;
  name: string;
  level_pct: number;
  volume_liters: number;
  volume_hl: number;
  status: SensorStatus;
  consecutive_errors: number;
  timestamp: number;
}

export interface LevelSwitchState {
  sensor_id: string;
  name: string;
  high_active: boolean;
  low_active: boolean;
  status: SensorStatus;
  consecutive_errors: number;
  timestamp: number;
}

// Config des widgets (stockée dans Redis via BrewBlox)
export interface FlowSensorWidgetConfig {
  sensorId: string | null;
  title: string;
  maxFlow: number;
}

export interface PressureSensorWidgetConfig {
  sensorId: string | null;
  title: string;
  maxPressure: number;
}

export interface LevelSensorWidgetConfig {
  sensorId: string | null;
  title: string;
}

export interface LevelSwitchWidgetConfig {
  sensorId: string | null;
  title: string;
}

// -----------------------------------------------------------------------
// Phase Control
// -----------------------------------------------------------------------

export type PhaseStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'HOLD'
  | 'TIMEHOLD'
  | 'COMPLETED'
  | 'ERROR'
  | 'KILLED';

export interface PhaseSelection {
  id: string;
  label: string;
  options: string[];
  selected: string | null;
}

export interface PhaseControlState {
  zone_id: string;
  zone_name: string;
  status: PhaseStatus;
  current_step: number;
  current_step_name: string;
  step_elapsed_seconds: number;
  step_duration_seconds: number | null;
  pv1: number | null;
  sp1: number | null;
  pv2: number | null;
  sp2: number | null;
  pv1_unit: string;
  pv2_unit: string;
  error_message: string;
  selections: PhaseSelection[];
  timestamp: number;
}

export interface PhaseControlWidgetConfig {
  zoneId: string | null;
  title: string;
  pv1Label: string;
  sp1Label: string;
  pv2Label: string;
  sp2Label: string;
  pv1Unit: string;
  pv2Unit: string;
}

export type PhaseCommand =
  | 'start'
  | 'restart'
  | 'hold'
  | 'timehold'
  | 'resume'
  | 'kill'
  | 'step_next'
  | 'confirm'
  | 'cancel';

// -----------------------------------------------------------------------
// Agitateur
// -----------------------------------------------------------------------

export type AgitatorStatus = 'RUNNING' | 'STOPPED' | 'FAULT' | 'COMM_ERROR';

export interface AgitatorState {
  device_id: string;
  name: string;
  running: boolean;
  speed_rpm: number | null;
  speed_pct: number | null;
  fault: boolean;
  status: AgitatorStatus;
  timestamp: number;
}

export interface AgitatorWidgetConfig {
  deviceId: string | null;
  title: string;
  hasVFD: boolean;
  maxRpm: number;
}

// -----------------------------------------------------------------------
// Boule CIP
// -----------------------------------------------------------------------

export type CIPBallStatus = 'ACTIVE' | 'INACTIVE' | 'FAULT' | 'COMM_ERROR';

export interface CIPBallState {
  device_id: string;
  name: string;
  active: boolean;
  flow_rate: number | null;
  pressure: number | null;
  status: CIPBallStatus;
  timestamp: number;
}

// -----------------------------------------------------------------------
// Cuve cylindro-conique
// -----------------------------------------------------------------------

export interface ConiCalTankSettings {
  cylinderHeightRatio: number;
  name: string;
  capacity_hl: number;
  levelSensorId: string | null;
  temperatureSensorId: string | null;
  cipBallId: string | null;
  agitatorId: string | null;
}
