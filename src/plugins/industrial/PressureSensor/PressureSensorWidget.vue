<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useContext, useWidget } from '@/composables';
import { STATUS_COLORS, STATUS_LABELS } from '../const';
import { useIndustrialStore } from '../store';
import { formatTimestamp } from '../utils';
import type { PressureSensorWidget } from './types';

const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<PressureSensorWidget>();
const store = useIndustrialStore();

const sensor = computed(() =>
  config.value.sensorId ? store.getPressureSensor(config.value.sensorId) : null,
);

const statusColor = computed(() =>
  sensor.value ? STATUS_COLORS[sensor.value.status] ?? 'grey' : 'grey',
);

const statusLabel = computed(() =>
  sensor.value
    ? STATUS_LABELS[sensor.value.status] ?? sensor.value.status
    : 'N/C',
);

const pressureBarPct = computed(() => {
  if (!sensor.value) return 0;
  return Math.min(
    100,
    (sensor.value.pressure / (config.value.maxPressure || 6)) * 100,
  );
});

const lastUpdate = computed(() =>
  sensor.value ? formatTimestamp(sensor.value.timestamp) : '',
);

const sensorOpts = computed(() =>
  store.allPressureSensors.map((s) => ({ label: s.name, value: s.sensor_id })),
);

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
        <template #message>Aucun capteur sélectionné</template>
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
            sensor.pressure.toFixed(3)
          }}</span>
          <span class="text-h6 text-grey q-ml-sm">{{ sensor.unit }}</span>
        </div>
        <div class="text-caption text-grey text-center q-mb-sm">
          Pression process
        </div>

        <div class="q-px-sm q-mb-xs">
          <q-linear-progress
            :value="pressureBarPct / 100"
            :color="pressureBarPct > 90 ? 'negative' : 'blue-4'"
            rounded
            size="8px"
          />
          <div class="row justify-between text-caption text-grey q-mt-xs">
            <span>0</span>
            <span>{{ config.maxPressure }} {{ sensor.unit }}</span>
          </div>
        </div>

        <div
          v-if="sensor.temperature !== null"
          class="row justify-center q-mt-sm"
        >
          <div class="text-center">
            <div class="text-h6 text-orange-4">
              {{ sensor.temperature?.toFixed(1) }} °C
            </div>
            <div class="text-caption text-grey">Température process</div>
          </div>
        </div>

        <div class="row justify-end q-px-sm q-mt-sm">
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
        label="Capteur de pression"
        :options="sensorOpts"
        @update:model-value="(v) => patchConfig({ sensorId: v })"
      />
      <LabeledField label="Pression max (bar)">
        <q-input
          :model-value="config.maxPressure"
          type="number"
          dense
          borderless
          @update:model-value="(v) => patchConfig({ maxPressure: Number(v) })"
        />
      </LabeledField>
    </div>
  </Card>
</template>
