;

export interface RecipeStep {
  id: string;
  zone_id: string;
  sequence_id: string;
  label: string;
}

export interface Recipe {
  id: string;
  name: string;
  steps: RecipeStep[];
}

export interface RecipeWidgetConfig {
  title: string;
}
