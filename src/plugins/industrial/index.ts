import { Plugin } from 'vue';
import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { globRegister } from '@/utils/component-ref';
import AgitatorWidget from './Agitator';
import FlowSensorWidget from './FlowSensor';
import LevelSensorWidget from './LevelSensor';
import LevelSwitchWidget from './LevelSwitch';
import PhaseControlWidget from './PhaseControl';
import SequenceWidget from './Sequence';
import RecipeWidget from './Recipe';
import PressureSensorWidget from './PressureSensor';
import { useIndustrialStore } from './store';
import type {
  AgitatorState,
  CIPBallState,
  FlowSensorState,
  LevelSensorState,
  LevelSwitchState,
  PhaseControlState,
  PressureSensorState,
} from './types';
import {
  isAgitatorState,
  isCIPBallState,
  isFlowSensorState,
  isLevelSensorState,
  isLevelSwitchState,
  isPhaseControlState,
  isPressureSensorState,
} from './utils';

const plugin: Plugin = {
  install(app) {
    const store = useIndustrialStore();
    store.start();

    // Enregistrer les composants partagés
    globRegister(
      app,
      import.meta.glob('./components/**/*.vue', { eager: true }),
    );

    // Enregistrer les widgets
    app.use(FlowSensorWidget);
    app.use(PressureSensorWidget);
    app.use(LevelSensorWidget);
    app.use(LevelSwitchWidget);
    app.use(PhaseControlWidget);
    app.use(AgitatorWidget);
    app.use(SequenceWidget);
    app.use(RecipeWidget);

    // Écouter les messages MQTT du service brewblox-industrial
    eventbus.subscribe(`${STATE_TOPIC}/+`);
    eventbus.addListener(`${STATE_TOPIC}/+`, (_, data) => {
      if (isFlowSensorState(data)) {
        store.updateFlowSensor((data as { data: FlowSensorState }).data);
      } else if (isPressureSensorState(data)) {
        store.updatePressureSensor(
          (data as { data: PressureSensorState }).data,
        );
      } else if (isLevelSensorState(data)) {
        store.updateLevelSensor((data as { data: LevelSensorState }).data);
      } else if (isLevelSwitchState(data)) {
        store.updateLevelSwitch((data as { data: LevelSwitchState }).data);
      } else if (isPhaseControlState(data)) {
        store.updatePhaseControl((data as { data: PhaseControlState }).data);
      } else if (isAgitatorState(data)) {
        store.updateAgitator((data as { data: AgitatorState }).data);
      } else if (isCIPBallState(data)) {
        store.updateCIPBall((data as { data: CIPBallState }).data);
      }
    });
  },
};

export default plugin;
