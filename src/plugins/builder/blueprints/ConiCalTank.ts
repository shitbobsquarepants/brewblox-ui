import { BuilderBlueprint } from '@/plugins/builder/types';

export const DEFAULT_SIZE = { width: 2, height: 5 };

const blueprint: BuilderBlueprint = {
  type: 'ConiCalTank',
  title: 'Cuve cylindro-conique',
  component: 'ConiCalTankPartComponent',
  transitions: () => null,
  defaultSize: DEFAULT_SIZE,
};

export default blueprint;
