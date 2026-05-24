import { Plugin } from 'vue';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './LevelSensorWidget.vue';
import type { LevelSensorWidgetConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const feature: WidgetFeature<LevelSensorWidgetConfig> = {
      id: 'LevelSensor',
      title: 'Niveau de cuve',
      component: cref(app, widget),
      widgetSize: { cols: 4, rows: 4 },
      generateConfig: () => ({
        sensorId: null,
        title: 'Niveau',
      }),
    };
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
