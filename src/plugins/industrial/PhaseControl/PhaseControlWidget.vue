<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useContext, useWidget } from '@/composables';
import { eventbus } from '@/eventbus';
import { useIndustrialStore } from '../store';
import { formatTimestamp } from '../utils';
import type { PhaseCommand } from '../types';
import type { PhaseControlWidget } from './types';

const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<PhaseControlWidget>();
const store = useIndustrialStore();

const phase = computed(() =>
  config.value.zoneId ? store.getPhaseControl(config.value.zoneId) : null,
);

const lastUpdate = computed(() =>
  phase.value ? formatTimestamp(phase.value.timestamp) : '',
);

const STATUS_COLORS: Record<string, string> = {
  IDLE: 'grey-6', RUNNING: 'positive', HOLD: 'warning',
  TIMEHOLD: 'orange', COMPLETED: 'blue-4', ERROR: 'negative', KILLED: 'negative',
};

const STATUS_LABELS: Record<string, string> = {
  IDLE: 'En attente', RUNNING: 'En cours', HOLD: 'Hold',
  TIMEHOLD: 'Time Hold', COMPLETED: 'Termine', ERROR: 'Erreur', KILLED: 'Arret force',
};

const statusColor = computed(() =>
  phase.value ? (STATUS_COLORS[phase.value.status] ?? 'grey') : 'grey',
);
const statusLabel = computed(() =>
  phase.value ? (STATUS_LABELS[phase.value.status] ?? phase.value.status) : 'N/C',
);

const tick = ref(0);
const interval = setInterval(() => tick.value++, 1000);
onUnmounted(() => clearInterval(interval));

const stepTimer = computed(() => {
  if (!phase.value) return '--:--:--';
  void tick.value;
  const elapsed = phase.value.step_elapsed_seconds;
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
});

const stepProgress = computed(() => {
  if (!phase.value || !phase.value.step_duration_seconds) return null;
  return Math.min(1, phase.value.step_elapsed_seconds / phase.value.step_duration_seconds);
});

function sendCommand(command: PhaseCommand): void {
  if (!config.value.zoneId) return;
  eventbus.publish('brewcast/cmd/phase/' + config.value.zoneId, {
    command, zone_id: config.value.zoneId, timestamp: Date.now() / 1000,
  });
}

const canStart   = computed(() => !phase.value || ['IDLE','COMPLETED','KILLED','ERROR'].includes(phase.value.status));
const canHold    = computed(() => phase.value?.status === 'RUNNING');
const canResume  = computed(() => phase.value?.status === 'HOLD' || phase.value?.status === 'TIMEHOLD');
const canKill    = computed(() => phase.value && !['IDLE','COMPLETED','KILLED'].includes(phase.value.status));
const canTimehold = computed(() => phase.value?.status === 'RUNNING');
const canStepNext = computed(() => phase.value?.status === 'RUNNING' || phase.value?.status === 'HOLD');

const zoneOpts = computed(() =>
  store.allPhaseControls.map((p) => ({ label: p.zone_name, value: p.zone_id })),
);
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <div v-if="context.mode === 'Basic'" class="widget-body q-pa-sm">
      <CardWarning v-if="!config.zoneId">
        <template #message>Aucune zone configuree</template>
      </CardWarning>

      <template v-else>
        <div class="row justify-between items-center q-mb-sm">
          <div class="text-subtitle2 text-bold text-uppercase">
            {{ config.title || phase?.zone_name || 'Phase Control' }}
          </div>
          <q-badge :color="statusColor" :label="statusLabel" class="text-bold" />
        </div>

        <div class="q-pa-sm q-mb-sm rounded-borders" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1)">
          <div class="row items-center justify-between">
            <div class="row items-center">
              <span class="text-caption text-grey q-mr-xs">Step :</span>
              <span class="text-bold text-white q-mr-sm">{{ phase?.current_step ?? '--' }}</span>
              <span class="text-body2">{{ phase?.current_step_name ?? '---' }}</span>
            </div>
            <span class="text-h6 text-bold text-mono" :class="phase?.status === 'RUNNING' ? 'text-positive' : 'text-grey'">
              {{ stepTimer }}
            </span>
          </div>
          <q-linear-progress v-if="stepProgress !== null" :value="stepProgress" color="positive" track-color="grey-9" rounded size="4px" class="q-mt-xs" />
        </div>

        <div class="row q-col-gutter-sm q-mb-sm">
          <div class="col-6">
            <div class="q-pa-xs rounded-borders text-center" style="background: rgba(255,255,255,0.05)">
              <div class="text-caption text-grey">{{ config.pv1Label || 'PV1' }}</div>
              <div class="text-h6 text-white text-mono">{{ phase?.pv1?.toFixed(2) ?? '0.00' }} <span class="text-caption text-grey">{{ config.pv1Unit }}</span></div>
            </div>
          </div>
          <div class="col-6">
            <div class="q-pa-xs rounded-borders text-center" style="background: rgba(255,255,255,0.05)">
              <div class="text-caption text-grey">{{ config.sp1Label || 'SP1' }}</div>
              <div class="text-h6 text-positive text-mono">{{ phase?.sp1?.toFixed(2) ?? '0.00' }} <span class="text-caption text-grey">{{ config.pv1Unit }}</span></div>
            </div>
          </div>
          <div class="col-6">
            <div class="q-pa-xs rounded-borders text-center" style="background: rgba(255,255,255,0.05)">
              <div class="text-caption text-grey">{{ config.pv2Label || 'PV2' }}</div>
              <div class="text-h6 text-white text-mono">{{ phase?.pv2?.toFixed(2) ?? '0.00' }} <span class="text-caption text-grey">{{ config.pv2Unit }}</span></div>
            </div>
          </div>
          <div class="col-6">
            <div class="q-pa-xs rounded-borders text-center" style="background: rgba(255,255,255,0.05)">
              <div class="text-caption text-grey">{{ config.sp2Label || 'SP2' }}</div>
              <div class="text-h6 text-positive text-mono">{{ phase?.sp2?.toFixed(2) ?? '0.00' }} <span class="text-caption text-grey">{{ config.pv2Unit }}</span></div>
            </div>
          </div>
        </div>

        <div v-if="phase?.error_message" class="q-pa-xs q-mb-sm rounded-borders text-negative text-caption" style="background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.3)">
          {{ phase.error_message }}
        </div>

        <div class="row q-col-gutter-xs q-mb-sm">
          <div class="col-4"><q-btn :disable="!canStart" color="positive" label="Start" size="sm" class="full-width" @click="sendCommand('start')" /></div>
          <div class="col-4"><q-btn :disable="!canStart" color="grey-7" label="Restart" size="sm" class="full-width" @click="sendCommand('restart')" /></div>
          <div class="col-4"><q-btn :disable="!canHold" color="warning" label="Hold" size="sm" class="full-width" @click="sendCommand('hold')" /></div>
          <div class="col-4"><q-btn :disable="!canKill" color="negative" label="Kill" size="sm" class="full-width" @click="sendCommand('kill')" /></div>
          <div class="col-4"><q-btn :disable="!canTimehold" color="orange" label="Time Hold" size="sm" class="full-width" @click="sendCommand('timehold')" /></div>
          <div class="col-4"><q-btn :disable="!canResume" color="blue-4" label="Resume" size="sm" class="full-width" @click="sendCommand('resume')" /></div>
        </div>

        <div class="row justify-between items-center q-mb-sm">
          <q-btn flat dense :disable="!canStepNext" color="blue-3" label="Step + 1" size="sm" @click="sendCommand('step_next')" />
          <span class="text-caption text-grey">{{ lastUpdate }}</span>
        </div>

        <div v-if="phase?.selections?.length" class="q-mt-sm">
          <div v-for="sel in phase.selections" :key="sel.id" class="q-mb-xs">
            <div class="row items-center q-gutter-sm">
              <span class="text-caption text-grey col-3">{{ sel.label }}</span>
              <q-select :model-value="sel.selected" :options="sel.options" dense borderless class="col" style="min-width: 120px" @update:model-value="(v) => eventbus.publish('brewcast/cmd/phase/' + config.zoneId, { command: 'start', zone_id: config.zoneId, selection_id: sel.id, selection_value: v, timestamp: Date.now() / 1000 })" />
            </div>
          </div>
        </div>

        <div v-if="phase?.status === 'HOLD'" class="row q-gutter-sm q-mt-sm">
          <q-btn color="positive" label="Confirm" size="sm" class="col" @click="sendCommand('confirm')" />
          <q-btn color="negative" label="Cancel" size="sm" class="col" @click="sendCommand('cancel')" />
        </div>
      </template>
    </div>

    <div v-if="context.mode === 'Full'" class="widget-body column q-pa-sm">
      <SelectField :model-value="config.zoneId" label="Zone process" :options="zoneOpts" @update:model-value="(v) => patchConfig({ zoneId: v })" />
      <LabeledField label="Titre affiche">
        <q-input :model-value="config.title" dense borderless @update:model-value="(v) => patchConfig({ title: String(v) })" />
      </LabeledField>
      <div class="row q-col-gutter-sm">
        <div class="col-6"><LabeledField label="Label PV1"><q-input :model-value="config.pv1Label" dense borderless @update:model-value="(v) => patchConfig({ pv1Label: String(v) })" /></LabeledField></div>
        <div class="col-6"><LabeledField label="Unite PV1"><q-input :model-value="config.pv1Unit" dense borderless @update:model-value="(v) => patchConfig({ pv1Unit: String(v) })" /></LabeledField></div>
        <div class="col-6"><LabeledField label="Label SP1"><q-input :model-value="config.sp1Label" dense borderless @update:model-value="(v) => patchConfig({ sp1Label: String(v) })" /></LabeledField></div>
        <div class="col-6"><LabeledField label="Label PV2"><q-input :model-value="config.pv2Label" dense borderless @update:model-value="(v) => patchConfig({ pv2Label: String(v) })" /></LabeledField></div>
        <div class="col-6"><LabeledField label="Unite PV2"><q-input :model-value="config.pv2Unit" dense borderless @update:model-value="(v) => patchConfig({ pv2Unit: String(v) })" /></LabeledField></div>
        <div class="col-6"><LabeledField label="Label SP2"><q-input :model-value="config.sp2Label" dense borderless @update:model-value="(v) => patchConfig({ sp2Label: String(v) })" /></LabeledField></div>
      </div>
    </div>
  </Card>
</template>
