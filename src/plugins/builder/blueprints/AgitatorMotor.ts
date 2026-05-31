import { BuilderBlueprint } from '@/plugins/builder/types';

export const RUNNING_KEY = 'running';
export const DEFAULT_SIZE: AreaSize = { width: 1, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'AgitatorMotor',
  title: 'Agitator Motor',
  component: 'AgitatorMotorPartComponent',
  transitions: () => null,
  defaultSize: DEFAULT_SIZE,
};

export default blueprint;
