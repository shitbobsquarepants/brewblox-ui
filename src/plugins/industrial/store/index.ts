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
import type { ProcessZone, Sequence, Recipe } from '../Sequence/types';
import { zoneApi, sequenceApi, recipeApi } from './api';

export const useIndustrialStore = defineStore('industrialStore', () => {
  const flowSensors = reactive<Record<string, FlowSensorState>>({});
  const pressureSensors = reactive<Record<string, PressureSensorState>>({});
  const levelSensors = reactive<Record<string, LevelSensorState>>({});
  const levelSwitches = reactive<Record<string, LevelSwitchState>>({});
  const phaseControls = reactive<Record<string, PhaseControlState>>({});
  const agitators = reactive<Record<string, AgitatorState>>({});
  const cipBalls = reactive<Record<string, CIPBallState>>({});
  const zones = reactive<Record<string, ProcessZone>>({});
  const sequences = reactive<Record<string, Sequence>>({});
  const recipes = reactive<Record<string, Recipe>>({});

  const allFlowSensors = computed(() => Object.values(flowSensors));
  const allPressureSensors = computed(() => Object.values(pressureSensors));
  const allLevelSensors = computed(() => Object.values(levelSensors));
  const allLevelSwitches = computed(() => Object.values(levelSwitches));
  const allPhaseControls = computed(() => Object.values(phaseControls));
  const allAgitators = computed(() => Object.values(agitators));
  const allCIPBalls = computed(() => Object.values(cipBalls));
  const allZones = computed(() => Object.values(zones));
  const allSequences = computed(() => Object.values(sequences));
  const allRecipes = computed(() => Object.values(recipes));

  function updateFlowSensor(data: FlowSensorState): void { flowSensors[data.sensor_id] = data; }
  function updatePressureSensor(data: PressureSensorState): void { pressureSensors[data.sensor_id] = data; }
  function updateLevelSensor(data: LevelSensorState): void { levelSensors[data.sensor_id] = data; }
  function updateLevelSwitch(data: LevelSwitchState): void { levelSwitches[data.sensor_id] = data; }
  function updatePhaseControl(data: PhaseControlState): void { phaseControls[data.zone_id] = data; }
  function updateAgitator(data: AgitatorState): void { agitators[data.device_id] = data; }
  function updateCIPBall(data: CIPBallState): void { cipBalls[data.device_id] = data; }

  function getFlowSensor(id: string): FlowSensorState | null { return flowSensors[id] ?? null; }
  function getPressureSensor(id: string): PressureSensorState | null { return pressureSensors[id] ?? null; }
  function getLevelSensor(id: string): LevelSensorState | null { return levelSensors[id] ?? null; }
  function getLevelSwitch(id: string): LevelSwitchState | null { return levelSwitches[id] ?? null; }
  function getPhaseControl(id: string): PhaseControlState | null { return phaseControls[id] ?? null; }
  function getAgitator(id: string): AgitatorState | null { return agitators[id] ?? null; }
  function getCIPBall(id: string): CIPBallState | null { return cipBalls[id] ?? null; }
  function getSequencesByZone(zoneId: string): Sequence[] {
    return Object.values(sequences).filter((s) => s.zone_id === zoneId);
  }

  async function addZone(zone: ProcessZone): Promise<void> {
    if (zones[zone.id]) { await zoneApi.persist(zone); } else { await zoneApi.create(zone); }
  }
  async function deleteZone(id: string): Promise<void> {
    const zone = zones[id];
    if (!zone) return;
    await zoneApi.remove(zone);
    for (const seq of Object.values(sequences).filter((s) => s.zone_id === id)) {
      await sequenceApi.remove(seq);
    }
  }
  async function saveSequence(seq: Sequence): Promise<void> {
    if (sequences[seq.id]) { await sequenceApi.persist(seq); } else { await sequenceApi.create(seq); }
  }
  async function deleteSequence(id: string): Promise<void> {
    const seq = sequences[id];
    if (!seq) return;
    await sequenceApi.remove(seq);
  }
  async function saveRecipe(recipe: Recipe): Promise<void> {
    if (recipes[recipe.id]) { await recipeApi.persist(recipe); } else { await recipeApi.create(recipe); }
  }
  async function deleteRecipe(id: string): Promise<void> {
    const recipe = recipes[id];
    if (!recipe) return;
    await recipeApi.remove(recipe);
  }

  async function start(): Promise<void> {
    const storedZones = await zoneApi.fetch();
    const storedSequences = await sequenceApi.fetch();
    const storedRecipes = await recipeApi.fetch();
    if (storedZones.length === 0) {
      const defaults: ProcessZone[] = [
        { id: 'mash', name: 'Mash', icon: '🍺', color: '#e6af4b' },
        { id: 'mash-filter', name: 'Mash Filter', icon: '🎯', color: '#79c0ff' },
        { id: 'kettle', name: 'Kettle / Boil', icon: '🔥', color: '#ff7b72' },
        { id: 'whirlpool', name: 'Whirlpool', icon: '🌪️', color: '#d2a8ff' },
        { id: 'transfer', name: 'Transfer', icon: '➡️', color: '#3fb950' },
        { id: 'cip', name: 'CIP', icon: '🧼', color: '#58a6ff' },
      ];
      for (const zone of defaults) { await zoneApi.create(zone); }
      defaults.forEach((z) => (zones[z.id] = z));
    } else {
      storedZones.forEach((z) => (zones[z.id] = z));
    }
    storedSequences.forEach((s) => (sequences[s.id] = s));
    storedRecipes.forEach((r) => (recipes[r.id] = r));
    zoneApi.subscribe((z) => (zones[z.id] = z), (id) => delete zones[id]);
    sequenceApi.subscribe((s) => (sequences[s.id] = s), (id) => delete sequences[id]);
    recipeApi.subscribe((r) => (recipes[r.id] = r), (id) => delete recipes[id]);
  }

  return {
    allFlowSensors, allPressureSensors, allLevelSensors, allLevelSwitches,
    allPhaseControls, allAgitators, allCIPBalls,
    allZones, allSequences, allRecipes,
    updateFlowSensor, updatePressureSensor, updateLevelSensor, updateLevelSwitch,
    updatePhaseControl, updateAgitator, updateCIPBall,
    getFlowSensor, getPressureSensor, getLevelSensor, getLevelSwitch,
    getPhaseControl, getAgitator, getCIPBall, getSequencesByZone,
    addZone, deleteZone, saveSequence, deleteSequence, saveRecipe, deleteRecipe,
    start,
  };
});
