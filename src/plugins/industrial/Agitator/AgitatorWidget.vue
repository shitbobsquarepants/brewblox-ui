<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useContext, useWidget } from '@/composables';
import { useIndustrialStore } from '../store';
import { formatTimestamp } from '../utils';
import type { AgitatorWidget } from './types';

const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<AgitatorWidget>();
const store = useIndustrialStore();

const agitator = computed(() =>
  config.value.deviceId ? store.getAgitator(config.value.deviceId) : null,
);

const statusColor = computed(() => {
  if (!agitator.value) return 'grey';
  const map: Record<string, string> = { RUNNING: 'positive', STOPPED: 'grey-6', FAULT: 'negative', COMM_ERROR: 'negative' };
  return map[agitator.value.status] ?? 'grey';
});

const statusLabel = computed(() => {
  if (!agitator.value) return 'N/C';
  const map: Record<string, string> = { RUNNING: 'En marche', STOPPED: 'Arrete', FAULT: 'Defaut', COMM_ERROR: 'Erreur com' };
  return map[agitator.value.status] ?? agitator.value.status;
});

const speedPct = computed(() => Math.min(100, agitator.value?.speed_pct ?? 0));
const lastUpdate = computed(() => agitator.value ? formatTimestamp(agitator.value.timestamp) : '');
const agitatorOpts = computed(() => store.allAgitators.map((a) => ({ label: a.name, value: a.device_id })));

const angle = ref(0);
let animFrame: number | null = null;

function startAnim(): void {
  const step = ((agitator.value?.speed_pct ?? 50) / 100) * 5;
  const animate = (): void => {
    angle.value = (angle.value + step) % 360;
    animFrame = requestAnimationFrame(animate);
  };
  animFrame = requestAnimationFrame(animate);
}

function stopAnim(): void {
  if (animFrame !== null) { cancelAnimationFrame(animFrame); animFrame = null; }
}

watch(() => agitator.value?.running, (running) => {
  if (running) startAnim(); else stopAnim();
}, { immediate: true });

onUnmounted(stopAnim);
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <div v-if="context.mode === 'Basic'" class="widget-body q-pa-sm">
      <CardWarning v-if="!config.deviceId">
        <template #message>Aucun agitateur configure</template>
      </CardWarning>

      <template v-else>
        <div class="row justify-between items-center q-mb-md">
          <div class="text-subtitle2 text-bold">{{ agitator?.name ?? config.deviceId }}</div>
          <q-badge :color="statusColor" :label="statusLabel" />
        </div>

        <div class="row justify-center q-mb-md">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <rect x="10" y="25" width="60" height="30" rx="4"
              :fill="agitator?.running ? '#1a4731' : '#2a2a2a'"
              :stroke="agitator?.running ? '#4ade80' : '#555'"
              stroke-width="2"
            />
            <text x="40" y="45" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="monospace">M</text>
            <line x1="70" y1="40" x2="78" y2="40" stroke="#888" stroke-width="3" />
            <g :transform="'translate(78, 40) rotate(' + angle + ')'">
              <line x1="0" y1="0" x2="0" y2="-12" :stroke="agitator?.running ? '#60a5fa' : '#444'" stroke-width="3" stroke-linecap="round" />
              <line x1="0" y1="0" x2="12" y2="0" :stroke="agitator?.running ? '#60a5fa' : '#444'" stroke-width="3" stroke-linecap="round" />
              <line x1="0" y1="0" x2="0" y2="12" :stroke="agitator?.running ? '#60a5fa' : '#444'" stroke-width="3" stroke-linecap="round" />
              <line x1="0" y1="0" x2="-12" y2="0" :stroke="agitator?.running ? '#60a5fa' : '#444'" stroke-width="3" stroke-linecap="round" />
            </g>
            <circle v-if="agitator?.fault" cx="65" cy="28" r="6" fill="#f87171" />
            <text v-if="agitator?.fault" x="65" y="32" text-anchor="middle" fill="white" font-size="8" font-weight="bold">!</text>
          </svg>
        </div>

        <template v-if="config.hasVFD && agitator">
          <div class="row justify-center items-baseline q-mb-xs">
            <span class="text-h4 text-bold text-mono">{{ agitator.speed_rpm?.toFixed(0) ?? '---' }}</span>
            <span class="text-caption text-grey q-ml-xs">rpm</span>
          </div>
          <div class="q-px-sm q-mb-xs">
            <q-linear-progress :value="speedPct / 100" :color="agitator.running ? 'blue-4' : 'grey-7'" rounded size="6px" />
            <div class="row justify-between text-caption text-grey q-mt-xs">
              <span>0</span><span>{{ config.maxRpm }} rpm</span>
            </div>
          </div>
        </template>

        <div class="row justify-end">
          <span class="text-caption text-grey">{{ lastUpdate }}</span>
        </div>
      </template>
    </div>

    <div v-if="context.mode === 'Full'" class="widget-body column q-pa-sm">
      <SelectField :model-value="config.deviceId" label="Agitateur" :options="agitatorOpts" @update:model-value="(v) => patchConfig({ deviceId: v })" />
      <LabeledField label="Variateur de frequence (VFD)">
        <q-toggle :model-value="config.hasVFD" @update:model-value="(v) => patchConfig({ hasVFD: v })" />
      </LabeledField>
      <LabeledField v-if="config.hasVFD" label="Vitesse max (rpm)">
        <q-input :model-value="config.maxRpm" type="number" dense borderless @update:model-value="(v) => patchConfig({ maxRpm: Number(v) })" />
      </LabeledField>
    </div>
  </Card>
</template>
