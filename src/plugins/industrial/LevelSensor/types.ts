import { Widget } from '@/store/widgets';

export interface LevelSensorWidgetConfig {
  sensorId: string | null;
  title: string;
}

export type LevelSensorWidget = Widget<LevelSensorWidgetConfig>;
