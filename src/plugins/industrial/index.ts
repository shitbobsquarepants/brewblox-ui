import { Plugin } from 'vue';
import { STATE_TOPIC } from '@/const';
import { eventbus } from '@/eventbus';
import { globRegister } from '@/utils/component-ref';
import { useIndustrialStore } from './store';
import FlowSensorWidget from './FlowSensor';
import PressureSensorWidget from './PressureSensor';
import LevelSensorWidget from './LevelSensor';
import LevelSwitchWidget from './LevelSwitch';
import {
  isFlowSensorState,
  isPressureSensorState,
  isLevelSensorState,
  isLevelSwitchState,
} from './utils';
import type {
  FlowSensorState,
  PressureSensorState,
  LevelSensorState,
  LevelSwitchState,
} from './types';

const plugin: Plugin = {
  install(app) {
    const store = useIndustrialStore();

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

    // Écouter les messages MQTT du service brewblox-industrial
    eventbus.subscribe(`${STATE_TOPIC}/+`);
    eventbus.addListener(`${STATE_TOPIC}/+`, (_, data) => {
      if (isFlowSensorState(data)) {
        store.updateFlowSensor((data as { data: FlowSensorState }).data);
      } else if (isPressureSensorState(data)) {
        store.updatePressureSensor((data as { data: PressureSensorState }).data);
      } else if (isLevelSensorState(data)) {
        store.updateLevelSensor((data as { data: LevelSensorState }).data);
      } else if (isLevelSwitchState(data)) {
        store.updateLevelSwitch((data as { data: LevelSwitchState }).data);
      }
    });
  },
};

export default plugin;
