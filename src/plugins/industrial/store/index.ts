import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import type {
  AgitatorState,
  CIPBallState,
  FlowSensorState,
  LevelSensorState,
  LevelSwitchState,
  PhaseControlState,
  PressureSensorState,
} from '../types';

export const useIndustrialStore = defineStore('industrialStore', () => {
  const flowSensors = reactive<Record<string, FlowSensorState>>({});
  const pressureSensors = reactive<Record<string, PressureSensorState>>({});
  const levelSensors = reactive<Record<string, LevelSensorState>>({});
  const levelSwitches = reactive<Record<string, LevelSwitchState>>({});
  const phaseControls = reactive<Record<string, PhaseControlState>>({});
  const agitators = reactive<Record<string, AgitatorState>>({});
  const cipBalls = reactive<Record<string, CIPBallState>>({});

  const allFlowSensors = computed(() => Object.values(flowSensors));
  const allPressureSensors = computed(() => Object.values(pressureSensors));
  const allLevelSensors = computed(() => Object.values(levelSensors));
  const allLevelSwitches = computed(() => Object.values(levelSwitches));
  const allPhaseControls = computed(() => Object.values(phaseControls));
  const allAgitators = computed(() => Object.values(agitators));
  const allCIPBalls = computed(() => Object.values(cipBalls));

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
  function updatePhaseControl(data: PhaseControlState): void {
    phaseControls[data.zone_id] = data;
  }
  function updateAgitator(data: AgitatorState): void {
    agitators[data.device_id] = data;
  }
  function updateCIPBall(data: CIPBallState): void {
    cipBalls[data.device_id] = data;
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
  function getPhaseControl(id: string): PhaseControlState | null {
    return phaseControls[id] ?? null;
  }
  function getAgitator(id: string): AgitatorState | null {
    return agitators[id] ?? null;
  }
  function getCIPBall(id: string): CIPBallState | null {
    return cipBalls[id] ?? null;
  }

  return {
    allFlowSensors,
    allPressureSensors,
    allLevelSensors,
    allLevelSwitches,
    allPhaseControls,
    allAgitators,
    allCIPBalls,
    updateFlowSensor,
    updatePressureSensor,
    updateLevelSensor,
    updateLevelSwitch,
    updatePhaseControl,
    updateAgitator,
    updateCIPBall,
    getFlowSensor,
    getPressureSensor,
    getLevelSensor,
    getLevelSwitch,
    getPhaseControl,
    getAgitator,
    getCIPBall,
  };
});
