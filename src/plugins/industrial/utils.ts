import { IndustrialStateEvent } from './types';

export function isFlowSensorState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { flow_rate?: unknown } }).data?.flow_rate ===
      'number'
  );
}

export function isPressureSensorState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { pressure?: unknown } }).data?.pressure ===
      'number'
  );
}

export function isLevelSensorState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { level_pct?: unknown } }).data?.level_pct ===
      'number'
  );
}

export function isLevelSwitchState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { high_active?: unknown } }).data?.high_active ===
      'boolean'
  );
}

export function formatTimestamp(timestamp: number): string {
  const diff = Math.round(Date.now() / 1000 - timestamp);
  if (diff < 60) return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.round(diff / 60)}min`;
  return `il y a ${Math.round(diff / 3600)}h`;
}

export function isPhaseControlState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { zone_id?: unknown } }).data?.zone_id ===
      'string' &&
    typeof (data as { data?: { current_step?: unknown } }).data
      ?.current_step === 'number'
  );
}

export function isAgitatorState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { running?: unknown } }).data?.running ===
      'boolean' &&
    typeof (data as { data?: { device_id?: unknown } }).data?.device_id ===
      'string'
  );
}

export function isCIPBallState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { active?: unknown } }).data?.active ===
      'boolean' &&
    typeof (data as { data?: { device_id?: unknown } }).data?.device_id ===
      'string'
  );
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return (
      h +
      'h' +
      String(m).padStart(2, '0') +
      'm' +
      String(s).padStart(2, '0') +
      's'
    );
  }
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
