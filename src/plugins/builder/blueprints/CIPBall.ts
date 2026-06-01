import { BuilderBlueprint } from '@/plugins/builder/types';

export const ACTIVE_KEY = 'active';
export const DEFAULT_SIZE: AreaSize = { width: 1, height: 1 };

const blueprint: BuilderBlueprint = {
  type: 'CIPBall',
  title: 'CIP Ball',
  component: 'CIPBallPartComponent',
  transitions: () => null,
  defaultSize: DEFAULT_SIZE,
};

export default blueprint;
