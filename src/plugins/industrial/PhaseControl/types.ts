;

export interface PhaseControlState {
  zone_id: string;
  zone_name: string;
  status: string;
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
  loaded_sequence_name: string;
  timestamp: number;
}

export interface PhaseControlWidgetConfig {
  zoneId: string;
  title: string;
  pv1Label: string;
  pv1Unit: string;
  sp1Label: string;
  pv2Label: string;
  pv2Unit: string;
  sp2Label: string;
  nextZoneId: string | null;
}
