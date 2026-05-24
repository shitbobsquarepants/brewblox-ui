import { Widget } from '@/store/widgets';

export interface LevelSwitchWidgetConfig {
  sensorId: string | null;
  title: string;
}

export type LevelSwitchWidget = Widget<LevelSwitchWidgetConfig>;
