import { Plugin } from 'vue';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './FlowSensorWidget.vue';
import type { FlowSensorWidgetConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const feature: WidgetFeature<FlowSensorWidgetConfig> = {
      id: 'FlowSensor',
      title: 'Débitmètre EM',
      component: cref(app, widget),
      widgetSize: { cols: 4, rows: 3 },
      generateConfig: () => ({
        sensorId: null,
        title: 'Débitmètre',
        maxFlow: 200,
      }),
    };
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
