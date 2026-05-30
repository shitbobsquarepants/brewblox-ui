import type { Plugin } from 'vue';
import { useFeatureStore, type WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import type { AgitatorWidgetConfig } from '../types';
import widget from './AgitatorWidget.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const feature: WidgetFeature<AgitatorWidgetConfig> = {
      id: 'Agitator',
      title: 'Moteur agitateur',
      component: cref(app, widget),
      widgetSize: { cols: 3, rows: 3 },
      generateConfig: () => ({
        deviceId: null,
        title: 'Agitateur',
        hasVFD: false,
        maxRpm: 100,
      }),
    };
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
