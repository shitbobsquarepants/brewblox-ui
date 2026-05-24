<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useContext, useWidget } from '@/composables';
import { useIndustrialStore } from '../store';
import { STATUS_COLORS, STATUS_LABELS } from '../const';
import { formatTimestamp } from '../utils';
import type { LevelSensorWidget } from './types';

const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<LevelSensorWidget>();
const store = useIndustrialStore();

const sensor = computed(() =>
  config.value.sensorId
    ? store.getLevelSensor(config.value.sensorId)
    : null,
);

const statusColor = computed(() =>
  sensor.value ? STATUS_COLORS[sensor.value.status] ?? 'grey' : 'grey',
);

const statusLabel = computed(() =>
  sensor.value ? STATUS_LABELS[sensor.value.status] ?? sensor.value.status : 'N/C',
);

const levelColor = computed(() => {
  if (!sensor.value) return 'grey';
  const pct = sensor.value.level_pct;
  if (pct >= 90) return 'negative';
  if (pct <= 10) return 'warning';
  return 'blue-4';
});

const lastUpdate = computed(() =>
  sensor.value ? formatTimestamp(sensor.value.timestamp) : '',
);

const sensorOpts = computed(() =>
  store.allLevelSensors.map((s) => ({ label: s.name, value: s.sensor_id })),
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
          <q-badge :color="statusColor" :label="statusLabel" />
        </div>

        <div class="row justify-center q-mt-md q-mb-sm">
          <div class="tank-container">
            <div
              class="tank-fill"
              :style="{ height: sensor.level_pct + '%' }"
              :class="`bg-${levelColor}`"
            />
            <div class="tank-level-label">{{ sensor.level_pct.toFixed(1) }}%</div>
          </div>
        </div>

        <div class="row q-px-sm q-mt-sm">
          <div class="col text-center">
            <div class="text-h6" :class="`text-${levelColor}`">
              {{ sensor.volume_hl.toFixed(2) }}
            </div>
            <div class="text-caption text-grey">hL</div>
          </div>
          <q-separator vertical />
          <div class="col text-center">
            <div class="text-h6 text-grey">{{ sensor.volume_liters.toFixed(0) }}</div>
            <div class="text-caption text-grey">L</div>
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
        label="Capteur de niveau"
        :options="sensorOpts"
        @update:model-value="(v) => patchConfig({ sensorId: v })"
      />
      <LabeledField label="Titre">
        <q-input
          :model-value="config.title"
          dense
          borderless
          @update:model-value="(v) => patchConfig({ title: String(v) })"
        />
      </LabeledField>
    </div>
  </Card>
</template>

<style scoped lang="sass">
.tank-container
  position: relative
  width: 80px
  height: 120px
  border: 2px solid rgba(255,255,255,0.3)
  border-radius: 4px 4px 8px 8px
  overflow: hidden
  background: rgba(255,255,255,0.05)

.tank-fill
  position: absolute
  bottom: 0
  left: 0
  right: 0
  transition: height 1s ease
  opacity: 0.7

.tank-level-label
  position: absolute
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  font-weight: bold
  font-size: 12px
  color: white
  text-shadow: 0 1px 2px rgba(0,0,0,0.8)
</style>
