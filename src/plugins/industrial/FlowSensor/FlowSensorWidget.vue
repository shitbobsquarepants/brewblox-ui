<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useContext, useWidget } from '@/composables';
import { STATUS_COLORS, STATUS_LABELS } from '../const';
import { useIndustrialStore } from '../store';
import { formatTimestamp } from '../utils';
import type { FlowSensorWidget } from './types';

const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<FlowSensorWidget>();
const store = useIndustrialStore();

const sensor = computed(() =>
  config.value.sensorId ? store.getFlowSensor(config.value.sensorId) : null,
);

const isConnected = computed(() => {
  if (!sensor.value) return false;
  const age = Date.now() / 1000 - sensor.value.timestamp;
  return age < 30;
});

const statusColor = computed(() =>
  sensor.value ? STATUS_COLORS[sensor.value.status] ?? 'grey' : 'grey',
);

const statusLabel = computed(() =>
  sensor.value
    ? STATUS_LABELS[sensor.value.status] ?? sensor.value.status
    : 'N/C',
);

const flowBarPct = computed(() => {
  if (!sensor.value) return 0;
  return Math.min(
    100,
    (sensor.value.flow_rate / (config.value.maxFlow || 200)) * 100,
  );
});

const lastUpdate = computed(() =>
  sensor.value ? formatTimestamp(sensor.value.timestamp) : '',
);

const sensorOpts = computed(() =>
  store.allFlowSensors.map((s) => ({ label: s.name, value: s.sensor_id })),
);

function resetBatch(): void {
  // TODO: appel API REST vers brewblox-industrial
}

const tick = ref(0);
const interval = setInterval(() => tick.value++, 1000);
onUnmounted(() => clearInterval(interval));
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <div
      v-if="context.mode === 'Basic'"
      class="widget-body"
    >
      <CardWarning v-if="!config.sensorId">
        <template #message>Aucun débitmètre sélectionné</template>
      </CardWarning>

      <CardWarning v-else-if="!sensor">
        <template #message>En attente de données...</template>
      </CardWarning>

      <template v-else>
        <div class="row justify-between items-center q-px-sm q-pt-sm">
          <div class="text-subtitle2 text-bold">{{ sensor.name }}</div>
          <q-badge
            :color="statusColor"
            :label="statusLabel"
          />
        </div>

        <div class="row justify-center items-baseline q-mt-md">
          <span class="text-h3 text-bold">{{
            sensor.flow_rate.toFixed(1)
          }}</span>
          <span class="text-h6 text-grey q-ml-sm">{{ sensor.flow_unit }}</span>
        </div>
        <div class="text-caption text-grey text-center q-mb-sm">
          Débit instantané
        </div>

        <div class="q-px-sm q-mb-xs">
          <q-linear-progress
            :value="flowBarPct / 100"
            :color="
              flowBarPct > 90
                ? 'negative'
                : flowBarPct > 70
                  ? 'warning'
                  : 'positive'
            "
            rounded
            size="8px"
          />
          <div class="row justify-between text-caption text-grey q-mt-xs">
            <span>0</span>
            <span>{{ config.maxFlow }} {{ sensor.flow_unit }}</span>
          </div>
        </div>

        <div class="row q-mt-sm q-px-sm">
          <div class="col text-center">
            <div class="text-h6 text-purple">
              {{ sensor.batch_volume.toFixed(2) }}
            </div>
            <div class="text-caption text-grey">
              {{ sensor.volume_unit }} batch
            </div>
          </div>
          <q-separator vertical />
          <div class="col text-center">
            <div class="text-h6 text-blue-4">
              {{ sensor.total_volume.toFixed(2) }}
            </div>
            <div class="text-caption text-grey">
              {{ sensor.volume_unit }} total
            </div>
          </div>
        </div>

        <div class="row justify-between items-center q-px-sm q-mt-sm">
          <q-btn
            flat
            dense
            size="sm"
            icon="restart_alt"
            color="blue-4"
            label="Reset batch"
            :disable="!isConnected"
            @click="resetBatch"
          />
          <span class="text-caption text-grey">{{ lastUpdate }}</span>
        </div>
      </template>
    </div>

    <div
      v-if="context.mode === 'Full'"
      class="widget-body column"
    >
      <SelectField
        :model-value="config.sensorId"
        label="Débitmètre"
        :options="sensorOpts"
        @update:model-value="(v) => patchConfig({ sensorId: v })"
      />
      <LabeledField label="Débit max (L/min)">
        <q-input
          :model-value="config.maxFlow"
          type="number"
          dense
          borderless
          @update:model-value="(v) => patchConfig({ maxFlow: Number(v) })"
        />
      </LabeledField>
    </div>
  </Card>
</template>
