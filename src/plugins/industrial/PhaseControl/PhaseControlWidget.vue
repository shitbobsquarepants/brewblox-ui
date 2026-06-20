<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useContext, useWidget } from '@/composables';
import { eventbus } from '@/eventbus';
import { useIndustrialStore } from '../store';
import type { PhaseCommand } from '../types';
import { formatTimestamp } from '../utils';
import type { PhaseControlWidgetConfig } from './types';

const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<PhaseControlWidgetConfig>();
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
  phase.value ? STATUS_COLORS[phase.value.status] ?? 'grey' : 'grey',
);
const statusLabel = computed(() =>
  phase.value ? STATUS_LABELS[phase.value.status] ?? phase.value.status : 'N/C',
);

// ---- Timer local ----
const tick = ref(0);
const interval = setInterval(() => tick.value++, 1000);
onUnmounted(() => clearInterval(interval));

const stepTimer = computed(() => {
  if (!phase.value) return '--:--:--';
  void tick.value;
  const elapsed = Math.floor(phase.value.step_elapsed_seconds);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
});

const stepProgress = computed(() => {
  if (!phase.value || !phase.value.step_duration_seconds) return null;
  return Math.min(1, phase.value.step_elapsed_seconds / phase.value.step_duration_seconds);
});

// ---- Séquences disponibles pour cette zone ----
const availableSequences = computed(() =>
  config.value.zoneId ? store.getSequencesByZone(config.value.zoneId) : [],
);

const selectedSequenceId = ref<string | null>(null);

const selectedSequenceOpts = computed(() =>
  availableSequences.value.map((s) => ({ label: s.name, value: s.id })),
);

function loadSequence(): void {
  if (!config.value.zoneId || !selectedSequenceId.value) return;
  const seq = store.allSequences.find((s) => s.id === selectedSequenceId.value);
  if (!seq) return;
  eventbus.publish('brewcast/cmd/phase/' + config.value.zoneId, {
    command: 'load_sequence',
    zone_id: config.value.zoneId,
    sequence: seq,
    timestamp: Date.now() / 1000,
  });
}

// ---- Pending action ----
const pendingAction = ref<PhaseCommand | null>(null);

function publish(command: PhaseCommand): void {
  if (!config.value.zoneId) return;
  eventbus.publish('brewcast/cmd/phase/' + config.value.zoneId, {
    command,
    zone_id: config.value.zoneId,
    timestamp: Date.now() / 1000,
  });
}

function requestAction(action: PhaseCommand): void {
  pendingAction.value = action;
}

function confirmAction(): void {
  if (!pendingAction.value) return;
  publish(pendingAction.value);
  pendingAction.value = null;
}

function cancelAction(): void {
  pendingAction.value = null;
}

// ---- Availability ----
const canStart = computed(
  () => !phase.value || ['IDLE', 'COMPLETED', 'KILLED', 'ERROR'].includes(phase.value.status),
);
const canHold = computed(() => phase.value?.status === 'RUNNING');
const canResume = computed(
  () => phase.value?.status === 'HOLD' || phase.value?.status === 'TIMEHOLD',
);
const canKill = computed(() => phase.value?.status === 'HOLD');
const canTimehold = computed(() => phase.value?.status === 'RUNNING');
const canStepNext = computed(
  () => phase.value?.status === 'RUNNING' || phase.value?.status === 'HOLD',
);
const canRestart = computed(() => phase.value?.status === 'HOLD');

const PENDING_LABELS: Partial<Record<PhaseCommand, string>> = {
  start: 'START', restart: 'RESTART', hold: 'HOLD', kill: 'KILL',
  timehold: 'TIME HOLD', resume: 'RESUME', step_next: 'STEP + 1',
};

const zoneOpts = computed(() =>
  store.allZones.map((z) => ({ label: z.icon + ' ' + z.name, value: z.id })),
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
        <!-- Header -->
        <div class="row justify-between items-center q-mb-sm">
          <div class="text-subtitle2 text-bold text-uppercase">
            {{ config.title || phase?.zone_name || 'Phase Control' }}
          </div>
          <q-badge :color="statusColor" :label="statusLabel" class="text-bold" />
        </div>

        <!-- Loaded sequence -->
        <div v-if="phase?.loaded_sequence_name" class="text-caption text-grey q-mb-xs q-pl-xs">
          📋 <span class="text-white">{{ phase.loaded_sequence_name }}</span>
        </div>

        <!-- Step + timer -->
        <div
          class="q-pa-sm q-mb-sm rounded-borders"
          style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1)"
        >
          <div class="row items-center justify-between">
            <div class="row items-center">
              <span class="text-caption text-grey q-mr-xs">Step :</span>
              <span class="text-bold text-white q-mr-sm">{{ phase?.current_step ?? '--' }}</span>
              <span class="text-body2">{{ phase?.current_step_name ?? '---' }}</span>
            </div>
            <span
              class="text-h6 text-bold text-mono"
              :class="phase?.status === 'RUNNING' ? 'text-positive' : 'text-grey'"
            >{{ stepTimer }}</span>
          </div>
          <q-linear-progress
            v-if="stepProgress !== null"
            :value="stepProgress"
            color="positive"
            track-color="grey-9"
            rounded size="4px"
            class="q-mt-xs"
          />
        </div>

        <!-- PV / SP -->
        <div class="row q-col-gutter-sm q-mb-sm">
          <div class="col-6">
            <div class="q-pa-xs rounded-borders text-center" style="background: rgba(255,255,255,0.05)">
              <div class="text-caption text-grey">{{ config.pv1Label || 'PV1' }}</div>
              <div class="text-h6 text-white text-mono">
                {{ phase?.pv1?.toFixed(2) ?? '—' }}
                <span class="text-caption text-grey">{{ config.pv1Unit }}</span>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="q-pa-xs rounded-borders text-center" style="background: rgba(255,255,255,0.05)">
              <div class="text-caption text-grey">{{ config.sp1Label || 'SP1' }}</div>
              <div class="text-h6 text-positive text-mono">
                {{ phase?.sp1?.toFixed(2) ?? '—' }}
                <span class="text-caption text-grey">{{ config.pv1Unit }}</span>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="q-pa-xs rounded-borders text-center" style="background: rgba(255,255,255,0.05)">
              <div class="text-caption text-grey">{{ config.pv2Label || 'PV2' }}</div>
              <div class="text-h6 text-white text-mono">
                {{ phase?.pv2?.toFixed(2) ?? '—' }}
                <span class="text-caption text-grey">{{ config.pv2Unit }}</span>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="q-pa-xs rounded-borders text-center" style="background: rgba(255,255,255,0.05)">
              <div class="text-caption text-grey">{{ config.sp2Label || 'SP2' }}</div>
              <div class="text-h6 text-positive text-mono">
                {{ phase?.sp2?.toFixed(2) ?? '—' }}
                <span class="text-caption text-grey">{{ config.pv2Unit }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charger une séquence -->
        <div
          class="row items-center q-gutter-xs q-mb-sm q-pa-xs rounded-borders"
          style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08)"
        >
          <q-select
            v-model="selectedSequenceId"
            :options="selectedSequenceOpts"
            emit-value map-options
            dense borderless
            class="col"
            placeholder="Charger une séquence..."
            :disable="availableSequences.length === 0"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey text-caption">
                  Aucune séquence pour cette zone
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-btn
            flat dense
            icon="mdi-upload"
            color="positive"
            size="sm"
            :disable="!selectedSequenceId"
            @click="loadSequence"
          >
            <q-tooltip>Charger sur la zone</q-tooltip>
          </q-btn>
        </div>

        <!-- Erreur -->
        <div
          v-if="phase?.error_message"
          class="q-pa-xs q-mb-sm rounded-borders text-negative text-caption"
          style="background: rgba(244,67,54,0.1); border: 1px solid rgba(244,67,54,0.3)"
        >{{ phase.error_message }}</div>

        <!-- Boutons actions -->
        <div class="row q-col-gutter-xs q-mb-xs">
          <div class="col-4">
            <q-btn :disable="!canStart || !!pendingAction" color="positive" label="Start" size="sm" class="full-width" @click="requestAction('start')" />
          </div>
          <div class="col-4">
            <q-btn :disable="!canRestart || !!pendingAction" color="grey-7" label="Restart" size="sm" class="full-width" @click="requestAction('restart')" />
          </div>
          <div class="col-4">
            <q-btn :disable="!canHold || !!pendingAction" color="warning" label="Hold" size="sm" class="full-width" @click="requestAction('hold')" />
          </div>
          <div class="col-4">
            <q-btn :disable="!canKill || !!pendingAction" color="negative" label="Kill" size="sm" class="full-width" @click="requestAction('kill')" />
          </div>
          <div class="col-4">
            <q-btn :disable="!canTimehold || !!pendingAction" color="orange" label="Time Hold" size="sm" class="full-width" @click="requestAction('timehold')" />
          </div>
          <div class="col-4">
            <q-btn :disable="!canResume || !!pendingAction" color="blue-4" label="Resume" size="sm" class="full-width" @click="requestAction('resume')" />
          </div>
        </div>

        <!-- Step + 1 + timestamp -->
        <div class="row justify-between items-center q-mb-sm">
          <q-btn flat dense :disable="!canStepNext || !!pendingAction" color="blue-3" label="Step + 1" size="sm" @click="requestAction('step_next')" />
          <span class="text-caption text-grey">{{ lastUpdate }}</span>
        </div>

        <!-- Selections dynamiques -->
        <div v-if="phase?.selections?.length" class="q-mt-sm">
          <div v-for="sel in phase.selections" :key="sel.id" class="q-mb-xs">
            <div class="row items-center q-gutter-sm">
              <span class="text-caption text-grey col-3">{{ sel.label }}</span>
              <q-select
                :model-value="sel.selected"
                :options="sel.options"
                dense borderless class="col"
                style="min-width: 120px"
                @update:model-value="(v) => eventbus.publish('brewcast/cmd/phase/' + config.zoneId, {
                  command: 'select',
                  zone_id: config.zoneId,
                  selection_id: sel.id,
                  selection_value: v,
                  timestamp: Date.now() / 1000,
                })"
              />
            </div>
          </div>
        </div>

        <!-- Confirm / Cancel -->
        <div
          v-if="pendingAction"
          class="q-mt-sm q-pa-sm rounded-borders"
          style="background: rgba(255,152,0,0.08); border: 1px solid rgba(255,152,0,0.3)"
        >
          <div class="text-caption text-center text-grey q-mb-sm">
            Confirmer : <span class="text-white text-bold">{{ PENDING_LABELS[pendingAction] }}</span> ?
          </div>
          <div class="row q-gutter-sm">
            <q-btn color="positive" label="Confirm" size="sm" class="col" @click="confirmAction" />
            <q-btn color="negative" label="Cancel" size="sm" class="col" @click="cancelAction" />
          </div>
        </div>
      </template>
    </div>

    <!-- Mode Full = settings -->
    <div v-if="context.mode === 'Full'" class="widget-body column q-pa-sm">
      <SelectField
        :model-value="config.zoneId"
        label="Zone process"
        :options="zoneOpts"
        @update:model-value="(v) => patchConfig({ zoneId: v })"
      />
      <LabeledField label="Titre affiche">
        <q-input :model-value="config.title" dense borderless @update:model-value="(v) => patchConfig({ title: String(v) })" />
      </LabeledField>
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <LabeledField label="Label PV1">
            <q-input :model-value="config.pv1Label" dense borderless @update:model-value="(v) => patchConfig({ pv1Label: String(v) })" />
          </LabeledField>
        </div>
        <div class="col-6">
          <LabeledField label="Unite PV1">
            <q-input :model-value="config.pv1Unit" dense borderless @update:model-value="(v) => patchConfig({ pv1Unit: String(v) })" />
          </LabeledField>
        </div>
        <div class="col-6">
          <LabeledField label="Label SP1">
            <q-input :model-value="config.sp1Label" dense borderless @update:model-value="(v) => patchConfig({ sp1Label: String(v) })" />
          </LabeledField>
        </div>
        <div class="col-6">
          <LabeledField label="Label PV2">
            <q-input :model-value="config.pv2Label" dense borderless @update:model-value="(v) => patchConfig({ pv2Label: String(v) })" />
          </LabeledField>
        </div>
        <div class="col-6">
          <LabeledField label="Unite PV2">
            <q-input :model-value="config.pv2Unit" dense borderless @update:model-value="(v) => patchConfig({ pv2Unit: String(v) })" />
          </LabeledField>
        </div>
        <div class="col-6">
          <LabeledField label="Label SP2">
            <q-input :model-value="config.sp2Label" dense borderless @update:model-value="(v) => patchConfig({ sp2Label: String(v) })" />
          </LabeledField>
        </div>
        <div class="col-12">
          <LabeledField label="Zone suivante (next_zone_id)">
            <SelectField
              :model-value="config.nextZoneId"
              :options="store.allZones.filter(z => z.id !== config.zoneId).map(z => ({ label: z.icon + ' ' + z.name, value: z.id }))"
              clearable
              @update:model-value="(v) => {
                patchConfig({ nextZoneId: v || null });
                if (config.zoneId) {
                  eventbus.publish('brewcast/cmd/phase/' + config.zoneId, {
                    command: 'set_next_zone_id',
                    zone_id: config.zoneId,
                    next_zone_id: v || null,
                    timestamp: Date.now() / 1000,
                  });
                }
              }"
            />
          </LabeledField>
        </div>
      </div>
    </div>
  </Card>
</template>
