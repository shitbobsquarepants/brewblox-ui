import { Widget } from '@/store/widgets';

export interface FlowSensorWidgetConfig {
  sensorId: string | null;
  title: string;
  maxFlow: number;
}

export type FlowSensorWidget = Widget<FlowSensorWidgetConfig>;
