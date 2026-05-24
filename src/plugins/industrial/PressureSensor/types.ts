import { Widget } from '@/store/widgets';

export interface PressureSensorWidgetConfig {
  sensorId: string | null;
  title: string;
  maxPressure: number;
}

export type PressureSensorWidget = Widget<PressureSensorWidgetConfig>;
