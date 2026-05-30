import type { Plugin } from 'vue';
import { useFeatureStore, type WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './PhaseControlWidget.vue';
import type { PhaseControlWidgetConfig } from '../types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const feature: WidgetFeature<PhaseControlWidgetConfig> = {
      id: 'PhaseControl',
      title: 'Phase Control',
      component: cref(app, widget),
      widgetSize: { cols: 6, rows: 5 },
      generateConfig: () => ({
        zoneId: null,
        title: 'Phase Control',
        pv1Label: 'PV1',
        sp1Label: 'SP1',
        pv2Label: 'PV2',
        sp2Label: 'SP2',
        pv1Unit: '',
        pv2Unit: '',
      }),
    };
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
