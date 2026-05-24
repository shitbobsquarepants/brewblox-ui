import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import type {
  FlowSensorState,
  PressureSensorState,
  LevelSensorState,
  LevelSwitchState,
} from '../types';

export const useIndustrialStore = defineStore('industrialStore', () => {
  const flowSensors = reactive<Record<string, FlowSensorState>>({});
  const pressureSensors = reactive<Record<string, PressureSensorState>>({});
  const levelSensors = reactive<Record<string, LevelSensorState>>({});
  const levelSwitches = reactive<Record<string, LevelSwitchState>>({});

  const allFlowSensors = computed(() => Object.values(flowSensors));
  const allPressureSensors = computed(() => Object.values(pressureSensors));
  const allLevelSensors = computed(() => Object.values(levelSensors));
  const allLevelSwitches = computed(() => Object.values(levelSwitches));

  function updateFlowSensor(data: FlowSensorState): void {
    flowSensors[data.sensor_id] = data;
  }

  function updatePressureSensor(data: PressureSensorState): void {
    pressureSensors[data.sensor_id] = data;
  }

  function updateLevelSensor(data: LevelSensorState): void {
    levelSensors[data.sensor_id] = data;
  }

  function updateLevelSwitch(data: LevelSwitchState): void {
    levelSwitches[data.sensor_id] = data;
  }

  function getFlowSensor(id: string): FlowSensorState | null {
    return flowSensors[id] ?? null;
  }

  function getPressureSensor(id: string): PressureSensorState | null {
    return pressureSensors[id] ?? null;
  }

  function getLevelSensor(id: string): LevelSensorState | null {
    return levelSensors[id] ?? null;
  }

  function getLevelSwitch(id: string): LevelSwitchState | null {
    return levelSwitches[id] ?? null;
  }

  return {
    allFlowSensors,
    allPressureSensors,
    allLevelSensors,
    allLevelSwitches,
    updateFlowSensor,
    updatePressureSensor,
    updateLevelSensor,
    updateLevelSwitch,
    getFlowSensor,
    getPressureSensor,
    getLevelSensor,
    getLevelSwitch,
  };
});
