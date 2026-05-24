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
