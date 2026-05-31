import { BuilderBlueprint } from '@/plugins/builder/types';

export const CONE_ANGLE_KEY = 'coneAngle';
export const LEVEL_KEY = 'levelPct';
export const LABEL_KEY_TANK = 'label';
export const DEFAULT_CONE_ANGLE = 30;
export const DEFAULT_LEVEL = 0;
export const MIN_SIZE: AreaSize = { width: 2, height: 4 };
export const MAX_SIZE: AreaSize = { width: 8, height: 16 };
export const DEFAULT_SIZE: AreaSize = { width: 3, height: 8 };

const blueprint: BuilderBlueprint = {
  type: 'ConiCalTank',
  title: 'Conical Tank',
  component: 'ConiCalTankPartComponent',
  transitions: () => null,
  defaultSize: DEFAULT_SIZE,
};

export default blueprint;
