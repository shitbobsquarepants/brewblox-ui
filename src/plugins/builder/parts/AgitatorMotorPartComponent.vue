<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useIndustrialStore } from '@/plugins/industrial/store';
import { usePart } from '../composables';

const { width, height, settings } = usePart.setup();
const store = useIndustrialStore();

const agitator = computed(() =>
  settings.value.agitatorId
    ? store.getAgitator(settings.value.agitatorId)
    : null,
);

const isRunning = computed(() => agitator.value?.running ?? false);
const hasFault = computed(
  () =>
    agitator.value?.status === 'FAULT' ||
    agitator.value?.status === 'COMM_ERROR',
);

const indicatorColor = computed(() => {
  if (!agitator.value) return '#444';
  if (hasFault.value) return '#f87171';
  if (isRunning.value) return '#4ade80';
  return '#6b7280';
});

const angle = ref(0);
let animFrame: number | null = null;

function startAnim(): void {
  const step = ((agitator.value?.speed_pct ?? 50) / 100) * 4;
  const animate = (): void => {
    angle.value = (angle.value + step) % 360;
    animFrame = requestAnimationFrame(animate);
  };
  animFrame = requestAnimationFrame(animate);
}

function stopAnim(): void {
  if (animFrame !== null) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
}

watch(
  isRunning,
  (v) => {
    if (v) startAnim();
    else stopAnim();
  },
  { immediate: true },
);
onUnmounted(stopAnim);
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 100"
  >
    <!-- Corps moteur -->
    <circle
      cx="25"
      cy="25"
      r="20"
      :fill="isRunning ? '#0a1a0a' : '#111'"
      :stroke="indicatorColor"
      stroke-width="2"
    />
    <text
      x="25"
      y="31"
      text-anchor="middle"
      fill="white"
      font-size="16"
      font-weight="bold"
      font-family="monospace"
    >
      M
    </text>

    <!-- Indicateur état -->
    <circle
      cx="40"
      cy="10"
      r="6"
      :fill="indicatorColor"
    />
    <text
      v-if="hasFault"
      x="40"
      y="14"
      text-anchor="middle"
      fill="white"
      font-size="7"
      font-weight="bold"
    >
      !
    </text>

    <!-- Arbre -->
    <line
      x1="25"
      y1="45"
      x2="25"
      y2="58"
      stroke="#888"
      stroke-width="3"
    />

    <!-- Pales -->
    <g :transform="`translate(25, 58) rotate(${angle})`">
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="-10"
        :stroke="isRunning ? '#60a5fa' : '#444'"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <line
        x1="0"
        y1="0"
        x2="10"
        y2="0"
        :stroke="isRunning ? '#60a5fa' : '#444'"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="10"
        :stroke="isRunning ? '#60a5fa' : '#444'"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <line
        x1="0"
        y1="0"
        x2="-10"
        y2="0"
        :stroke="isRunning ? '#60a5fa' : '#444'"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    </g>

    <BuilderInteraction
      :width="50"
      :height="100"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <q-item>
            <q-item-section class="text-caption text-grey">
              {{ agitator?.name ?? 'Agitateur non configure' }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section class="text-caption">
              {{ isRunning ? 'En marche' : 'Arrete' }}
              {{
                agitator?.speed_rpm
                  ? '— ' + agitator.speed_rpm.toFixed(0) + ' rpm'
                  : ''
              }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
