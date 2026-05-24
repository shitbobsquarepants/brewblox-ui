import { Plugin } from 'vue';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './LevelSwitchWidget.vue';
import { LevelSwitchWidget } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const feature: WidgetFeature<LevelSwitchWidget> = {
      id: 'LevelSwitch',
      title: 'Level Switch TOR',
      component: cref(app, widget),
      widgetSize: {
        cols: 3,
        rows: 2,
      },
      generateConfig: () => ({
        sensorId: null,
        title: 'Level Switch',
      }),
    };
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
