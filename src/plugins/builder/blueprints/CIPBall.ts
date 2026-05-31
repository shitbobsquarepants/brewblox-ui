import { BuilderBlueprint } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'CIPBall',
  title: 'Boule CIP',
  component: 'CIPBallPartComponent',
  transitions: () => null,
  defaultSize: { width: 1, height: 2 },
};

export default blueprint;
