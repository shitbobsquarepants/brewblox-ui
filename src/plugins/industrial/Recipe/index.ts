import { Plugin } from 'vue';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './RecipeWidget.vue';
import type { RecipeWidgetConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const feature: WidgetFeature<RecipeWidgetConfig> = {
      id: 'IndustrialRecipe',
      title: 'Recettes Process',
      component: cref(app, widget),
      widgetSize: { cols: 5, rows: 8 },
      generateConfig: () => ({
        title: 'Recettes',
      }),
    };
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
