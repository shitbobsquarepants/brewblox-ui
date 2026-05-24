import { IndustrialStateEvent } from './types';

export function isFlowSensorState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { flow_rate?: unknown } }).data?.flow_rate === 'number'
  );
}

export function isPressureSensorState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { pressure?: unknown } }).data?.pressure === 'number'
  );
}

export function isLevelSensorState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { level_pct?: unknown } }).data?.level_pct === 'number'
  );
}

export function isLevelSwitchState(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as IndustrialStateEvent).type === 'Industrial.state' &&
    typeof (data as { data?: { high_active?: unknown } }).data?.high_active === 'boolean'
  );
}

export function formatTimestamp(timestamp: number): string {
  const diff = Math.round((Date.now() / 1000) - timestamp);
  if (diff < 60) return `il y a ${diff}s`;
  if (diff < 3600) return `il y a ${Math.round(diff / 60)}min`;
  return `il y a ${Math.round(diff / 3600)}h`;
}
