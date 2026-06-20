import { Plugin } from 'vue';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './SequenceWidget.vue';
import type { SequenceWidgetConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const feature: WidgetFeature<SequenceWidgetConfig> = {
      id: 'IndustrialSequence',
      title: 'Éditeur de Séquences',
      component: cref(app, widget),
      widgetSize: { cols: 5, rows: 8 },
      generateConfig: () => ({
        title: 'Séquences',
      }),
    };
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
