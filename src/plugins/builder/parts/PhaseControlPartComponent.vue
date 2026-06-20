<script setup lang="ts">
import { reactive, computed, onUnmounted } from 'vue';
import { usePart } from '../composables';
import {
  ZoneState,
  ZoneStatus,
  PhaseAction,
  Sequence,
  PHASE_CONTROL_ZONES_KEY,
  PHASE_CONTROL_SEQUENCES_KEY,
} from '../blueprints/PhaseControl';

const { settings, patchSettings, width, height } = usePart.setup();

const zoneMap = reactive<Record<string, ZoneState>>(
  settings.value[PHASE_CONTROL_ZONES_KEY] ?? {
    mash: makeZone('mash', 'MASH'),
    cip: makeZone('cip', 'CIP', { status: 'hold', isHolding: true }),
    kettle: makeZone('kettle', 'KETTLE / BOIL'),
  },
);

const sequences = computed<Sequence[]>(
  () => settings.value[PHASE_CONTROL_SEQUENCES_KEY] ?? [],
);

const zonesArray = computed(() => Object.values(zoneMap));

function makeZone(zoneId: string, label: string, overrides: Partial<ZoneState> = {}): ZoneState {
  return {
    zoneId, label, status: 'idle', isHolding: false, isTimeHolding: false,
    pendingAction: null, loadedSequenceId: null, currentStep: 0,
    timeRemaining: 0, totalTime: 0, ...overrides,
  };
}

function persist(): void {
  patchSettings({ [PHASE_CONTROL_ZONES_KEY]: JSON.parse(JSON.stringify(zoneMap)) });
}

const timers: Record<string, ReturnType<typeof setInterval> | null> = {};

function clearTimer(zoneId: string): void {
  if (timers[zoneId]) { clearInterval(timers[zoneId]!); timers[zoneId] = null; }
}

function startTimer(zoneId: string): void {
  const zone = zoneMap[zoneId];
  const seq = sequences.value.find((s) => s.id === zone.loadedSequenceId);
  if (!seq) return;
  const step = seq.steps[zone.currentStep];
  if (!step) return;
  if (zone.timeRemaining <= 0) { zone.timeRemaining = step.duration * 60; zone.totalTime = step.duration * 60; }
  clearTimer(zoneId);
  timers[zoneId] = setInterval(() => {
    zone.timeRemaining--;
    if (zone.timeRemaining <= 0) {
      clearTimer(zoneId);
      const next = zone.currentStep + 1;
      if (seq.steps[next]) {
        zone.currentStep = next;
        zone.timeRemaining = seq.steps[next].duration * 60;
        zone.totalTime = zone.timeRemaining;
        startTimer(zoneId);
      } else {
        zone.status = 'idle'; zone.currentStep = 0;
      }
      persist();
    }
  }, 1000);
}

function handleAction(zoneId: string, action: PhaseAction): void {
  zoneMap[zoneId].pendingAction = action;
}

function confirmAction(zoneId: string): void {
  const zone = zoneMap[zoneId];
  const action = zone.pendingAction;
  if (!action) return;
  const seq = sequences.value.find((s) => s.id === zone.loadedSequenceId);
  switch (action) {
    case 'start':
      if (!seq) break;
      zone.status = 'running'; zone.isHolding = false;
      zone.timeRemaining = seq.steps[zone.currentStep].duration * 60;
      zone.totalTime = zone.timeRemaining;
      startTimer(zoneId); break;
    case 'hold':
      clearTimer(zoneId); zone.status = 'hold'; zone.isHolding = true; break;
    case 'restart':
      zone.status = 'running'; zone.isHolding = false; startTimer(zoneId); break;
    case 'kill':
      clearTimer(zoneId); zone.status = 'idle'; zone.isHolding = false; zone.isTimeHolding = false;
      zone.currentStep = 0; zone.timeRemaining = seq ? seq.steps[0].duration * 60 : 0;
      zone.totalTime = zone.timeRemaining; break;
    case 'timehold':
      clearTimer(zoneId); zone.status = 'timehold'; zone.isHolding = true; zone.isTimeHolding = true; break;
    case 'resume':
      zone.status = 'running'; zone.isHolding = false; zone.isTimeHolding = false; startTimer(zoneId); break;
    case 'step+1':
      if (!seq) break;
      clearTimer(zoneId);
      if (zone.currentStep < seq.steps.length - 1) {
        zone.currentStep++;
        zone.timeRemaining = seq.steps[zone.currentStep].duration * 60;
        zone.totalTime = zone.timeRemaining;
        zone.status = 'running'; zone.isHolding = false; startTimer(zoneId);
      }
      break;
  }
  zone.pendingAction = null;
  persist();
}

function cancelAction(zoneId: string): void {
  zoneMap[zoneId].pendingAction = null;
}

function loadSequence(zoneId: string, seqId: string): void {
  const zone = zoneMap[zoneId];
  const seq = sequences.value.find((s) => s.id === seqId);
  if (!seq || !seqId) return;
  clearTimer(zoneId);
  zone.loadedSequenceId = seqId; zone.currentStep = 0; zone.status = 'idle';
  zone.isHolding = false; zone.isTimeHolding = false;
  zone.timeRemaining = seq.steps[0].duration * 60; zone.totalTime = zone.timeRemaining;
  persist();
}

function fmt(s: number): string {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
}

function loadedSeq(zone: ZoneState): Sequence | null {
  return sequences.value.find((s) => s.id === zone.loadedSequenceId) ?? null;
}

function loadedStep(zone: ZoneState) {
  return loadedSeq(zone)?.steps[zone.currentStep] ?? null;
}

function availableSequences(zone: ZoneState): Sequence[] {
  return sequences.value.filter((s) => s.type === zone.zoneId);
}

const STATUS_LABEL: Record<ZoneStatus, string> = {
  idle: 'Idle', running: 'Running', hold: 'Hold', timehold: 'Timehold',
};

onUnmounted(() => Object.keys(timers).forEach(clearTimer));
</script>

<template>
  <svg v-bind="{ width, height }" :viewBox="`0 0 ${width} ${height}`">
    <foreignObject x="0" y="0" :width="width" :height="height">
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style="display:flex;gap:12px;padding:8px;overflow-x:auto;height:100%"
      >
        <div v-for="zone in zonesArray" :key="zone.zoneId" class="pc-card">
          <div class="pc-card-label">{{ zone.label }} — {{ STATUS_LABEL[zone.status] }}</div>
          <div class="pc-inner">
            <div class="pc-head">
              <span class="pc-title">{{ zone.label }}</span>
              <span class="pc-badge" :class="zone.status">{{ STATUS_LABEL[zone.status] }}</span>
            </div>
            <div class="pc-phase-row">
              <span class="pc-dot" :style="{ background: zone.status === 'idle' ? '#484f58' : '#3fb950' }" />
              <span class="pc-step-num">{{ loadedStep(zone) ? zone.currentStep + 1 : '—' }}</span>
              <span class="pc-step-name">{{ loadedStep(zone)?.name ?? 'En attente' }}</span>
              <span class="pc-timer" :class="{ 'idle-t': zone.status === 'idle' }">
                {{ zone.status !== 'idle' ? fmt(zone.timeRemaining) : '--:--:--' }}
              </span>
            </div>
            <div class="pc-progress">
              <div class="pc-progress-fill" :style="{ width: zone.totalTime > 0 ? Math.round((1 - zone.timeRemaining / zone.totalTime) * 100) + '%' : '0%' }" />
            </div>
            <div class="pc-sensor-grid">
              <div class="pc-sensor"><div class="pc-sensor-lbl">PV1 — TEMP</div><div class="pc-sensor-val empty">—</div></div>
              <div class="pc-sensor"><div class="pc-sensor-lbl">SP1 — TARGET</div><div class="pc-sensor-val empty">—</div></div>
              <div class="pc-sensor"><div class="pc-sensor-lbl">PV2</div><div class="pc-sensor-val empty">—</div></div>
              <div class="pc-sensor"><div class="pc-sensor-lbl">SP2</div><div class="pc-sensor-val empty">—</div></div>
            </div>
            <div class="pc-btns-row">
              <button class="pc-btn start" :disabled="!zone.loadedSequenceId || zone.status === 'running'" @click="handleAction(zone.zoneId, 'start')">Start</button>
              <button class="pc-btn restart" :disabled="!zone.isHolding && zone.status !== 'hold'" @click="handleAction(zone.zoneId, 'restart')">Restart</button>
              <button class="pc-btn hold" :disabled="zone.status === 'idle' || !zone.loadedSequenceId" @click="handleAction(zone.zoneId, 'hold')">Hold</button>
            </div>
            <div class="pc-btns-row">
              <button class="pc-btn kill" :disabled="!zone.isHolding && zone.zoneId !== 'cip'" @click="handleAction(zone.zoneId, 'kill')">Kill</button>
              <button class="pc-btn thold" :disabled="!zone.isHolding && zone.zoneId !== 'cip'" @click="handleAction(zone.zoneId, 'timehold')">Time Hold</button>
              <button class="pc-btn resume" :disabled="!zone.isHolding" @click="handleAction(zone.zoneId, 'resume')">Resume</button>
            </div>
            <button class="pc-btn-splus" :disabled="!zone.isHolding && zone.zoneId !== 'cip'" @click="handleAction(zone.zoneId, 'step+1')">Step + 1</button>
            <div class="pc-divider" />
            <div class="pc-select-row">
              <label class="pc-select-label">Séquence</label>
              <select class="pc-select" :value="zone.loadedSequenceId ?? ''" @change="loadSequence(zone.zoneId, ($event.target as HTMLSelectElement).value)">
                <option value="">-- Charger --</option>
                <option v-for="seq in availableSequences(zone)" :key="seq.id" :value="seq.id">{{ seq.name }}</option>
              </select>
            </div>
            <div v-if="zone.pendingAction" class="pc-confirm">
              <p>Confirmer : <strong>{{ zone.pendingAction?.toUpperCase() }}</strong> ?</p>
              <div class="pc-confirm-btns">
                <button class="pc-btn-ok" @click="confirmAction(zone.zoneId)">Confirm</button>
                <button class="pc-btn-cx" @click="cancelAction(zone.zoneId)">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </foreignObject>
  </svg>
</template>

<style scoped>
.pc-card{background:#161b22;border:1px solid #30363d;border-radius:12px;width:280px;flex-shrink:0;overflow:hidden;font-family:system-ui,sans-serif}
.pc-card-label{text-align:center;font-size:11px;color:#8b949e;letter-spacing:.08em;padding:8px 0 0;text-transform:uppercase}
.pc-inner{padding:14px}
.pc-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.pc-title{font-size:18px;font-weight:500;color:#e6edf3}
.pc-badge{padding:4px 10px;border-radius:6px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.05em}
.pc-badge.running{background:#1f6feb;color:#cae8ff}
.pc-badge.hold{background:#9e6a03;color:#ffd66e}
.pc-badge.idle{background:#21262d;color:#8b949e;border:1px solid #30363d}
.pc-badge.timehold{background:#6e40c9;color:#d2a8ff}
.pc-phase-row{display:flex;align-items:baseline;gap:6px;margin-bottom:10px}
.pc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;display:inline-block;margin-bottom:2px}
.pc-step-num{font-size:22px;font-weight:500;color:#e6edf3}
.pc-step-name{font-size:13px;color:#e6af4b;flex:1}
.pc-timer{font-size:20px;font-weight:500;color:#e6af4b;font-variant-numeric:tabular-nums;margin-left:auto}
.pc-timer.idle-t{color:#484f58}
.pc-progress{height:3px;background:#21262d;border-radius:2px;margin-bottom:12px;overflow:hidden}
.pc-progress-fill{height:100%;background:#e6af4b;border-radius:2px;transition:width .5s}
.pc-sensor-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}
.pc-sensor{background:#0d1117;border:1px solid #21262d;border-radius:7px;padding:8px;text-align:center}
.pc-sensor-lbl{font-size:10px;color:#8b949e;margin-bottom:3px;letter-spacing:.04em}
.pc-sensor-val{font-size:16px;font-weight:500;color:#3fb950}
.pc-sensor-val.empty{color:#30363d;font-size:13px}
.pc-btns-row{display:flex;gap:5px;margin-bottom:5px}
.pc-btn{flex:1;padding:8px 4px;border:none;border-radius:6px;font-size:11px;font-weight:500;cursor:pointer;transition:opacity .15s}
.pc-btn:disabled{opacity:.3;cursor:default}
.pc-btn:not(:disabled):hover{opacity:.85}
.pc-btn.start{background:#238636;color:#fff}
.pc-btn.restart{background:#1f3c5a;color:#79c0ff}
.pc-btn.hold{background:#9e6a03;color:#ffd66e}
.pc-btn.kill{background:#6e1f1f;color:#ff7b7b}
.pc-btn.thold{background:#3d2b6b;color:#d2a8ff}
.pc-btn.resume{background:#1f3c5a;color:#79c0ff}
.pc-btn-splus{width:100%;padding:7px;border:1px solid #30363d;border-radius:6px;background:#161b22;color:#3fb950;font-size:11px;font-weight:500;cursor:pointer;margin-bottom:12px;letter-spacing:.04em}
.pc-btn-splus:disabled{opacity:.3;cursor:default}
.pc-btn-splus:not(:disabled):hover{background:#21262d}
.pc-divider{height:1px;background:#21262d;margin-bottom:10px}
.pc-select-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.pc-select-label{font-size:11px;color:#8b949e;white-space:nowrap;min-width:60px}
.pc-select{flex:1;background:#0d1117;color:#e6edf3;border:1px solid #30363d;border-radius:6px;padding:5px 7px;font-size:11px}
.pc-confirm{background:#160d0d;border:1px solid #6e1f1f;border-radius:8px;padding:10px;margin-top:8px}
.pc-confirm p{font-size:11px;color:#ff9999;margin-bottom:8px;text-align:center}
.pc-confirm-btns{display:flex;gap:6px}
.pc-btn-ok{flex:1;padding:9px;background:#238636;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer}
.pc-btn-ok:hover{background:#2ea043}
.pc-btn-cx{flex:1;padding:9px;background:#6e1f1f;color:#ff9999;border:none;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer}
</style>
