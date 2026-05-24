<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { useWidget } from '@/composables';
import { useIndustrialStore } from '../store';
import { STATUS_COLORS, STATUS_LABELS } from '../const';
import { formatTimestamp } from '../utils';
import { LevelSwitchWidget } from './types';

const { config, patchConfig } = useWidget.setup<LevelSwitchWidget>();
const store = useIndustrialStore();

const sensor = computed(() =>
  config.value.sensorId
    ? store.getLevelSwitch(config.value.sensorId)
    : null,
);

const statusColor = computed(() =>
  sensor.value ? STATUS_COLORS[sensor.value.status] ?? 'grey' : 'grey',
);

const statusLabel = computed(() =>
  sensor.value ? STATUS_LABELS[sensor.value.status] ?? sensor.value.status : 'N/C',
);

const lastUpdate = computed(() =>
  sensor.value ? formatTimestamp(sensor.value.timestamp) : '',
);

const sensorOpts = computed(() =>
  store.allLevelSwitches.map((s) => ({ label: s.name, value: s.sensor_id })),
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

        <!-- Indicateurs TOR -->
        <div class="row justify-around q-mt-lg q-mb-md">
          <!-- Contact haut -->
          <div class="column items-center">
            <q-icon
              name="arrow_upward"
              size="32px"
              :color="sensor.high_active ? 'positive' : 'grey-7'"
            />
            <div
              class="switch-indicator q-mt-sm"
              :class="sensor.high_active ? 'active-high' : 'inactive'"
            />
            <div class="text-caption q-mt-xs text-grey">Haut</div>
            <q-badge
              :color="sensor.high_active ? 'positive' : 'grey-7'"
              :label="sensor.high_active ? 'ACTIF' : 'INACTIF'"
              class="q-mt-xs"
            />
          </div>

          <!-- Séparateur vertical -->
          <q-separator vertical />

          <!-- Contact bas -->
          <div class="column items-center">
            <q-icon
              name="arrow_downward"
              size="32px"
              :color="sensor.low_active ? 'warning' : 'grey-7'"
            />
            <div
              class="switch-indicator q-mt-sm"
              :class="sensor.low_active ? 'active-low' : 'inactive'"
            />
            <div class="text-caption q-mt-xs text-grey">Bas</div>
            <q-badge
              :color="sensor.low_active ? 'warning' : 'grey-7'"
              :label="sensor.low_active ? 'ACTIF' : 'INACTIF'"
              class="q-mt-xs"
            />
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
        label="Level Switch"
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
.switch-indicator
  width: 24px
  height: 24px
  border-radius: 50%
  border: 2px solid rgba(255,255,255,0.2)

.active-high
  background: var(--q-positive)
  box-shadow: 0 0 8px var(--q-positive)

.active-low
  background: var(--q-warning)
  box-shadow: 0 0 8px var(--q-warning)

.inactive
  background: rgba(255,255,255,0.1)
</style>
