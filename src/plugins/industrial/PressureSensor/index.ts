import { Plugin } from 'vue';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './PressureSensorWidget.vue';
import { PressureSensorWidget, PressureSensorWidgetConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const feature: WidgetFeature<PressureSensorWidgetConfig> = {
      id: 'PressureSensor',
      title: 'Capteur de pression',
      component: cref(app, widget),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
      generateConfig: () => ({
        sensorId: null,
        title: 'Pression',
        maxPressure: 6.0,
      }),
    };
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
