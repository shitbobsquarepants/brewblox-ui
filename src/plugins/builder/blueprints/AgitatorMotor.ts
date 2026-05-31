import { BuilderBlueprint } from '@/plugins/builder/types';

const blueprint: BuilderBlueprint = {
  type: 'AgitatorMotor',
  title: 'Moteur agitateur',
  component: 'AgitatorMotorPartComponent',
  transitions: () => null,
  defaultSize: { width: 1, height: 2 },
};

export default blueprint;
