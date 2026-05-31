<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { usePart } from '../composables';
import { useIndustrialStore } from '@/plugins/industrial/store';

const { width, height, settings } = usePart.setup();
const store = useIndustrialStore();

const cipBall = computed(() =>
  settings.value.cipBallId
    ? store.getCIPBall(settings.value.cipBallId)
    : null,
);

const isActive = computed(() => cipBall.value?.active ?? false);
const hasFault = computed(() =>
  cipBall.value?.status === 'FAULT' || cipBall.value?.status === 'COMM_ERROR',
);

const angle = ref(0);
let animFrame: number | null = null;

function startAnim(): void {
  const animate = (): void => {
    angle.value = (angle.value + 3) % 360;
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

watch(isActive, (v) => { if (v) startAnim(); else stopAnim(); }, { immediate: true });
onUnmounted(stopAnim);
</script>

<template>
  <svg
    v-bind="{ width, height }"
    viewBox="0 0 50 100"
  >
    <!-- Tube alimentation -->
    <rect x="22" y="0" width="6" height="28" fill="#888" rx="1" />

    <!-- Corps boule -->
    <circle
      cx="25" cy="42" r="14"
      :fill="isActive ? '#0a2520' : '#1a1a1a'"
      :stroke="hasFault ? '#f87171' : isActive ? '#4ade80' : '#444'"
      stroke-width="1.5"
    />

    <!-- Bras rotatifs -->
    <g :transform="`translate(25, 42) rotate(${angle})`">
      <line x1="-10" y1="0" x2="10" y2="0"
        :stroke="isActive ? '#4ade80' : '#444'"
        stroke-width="2" stroke-linecap="round"
      />
      <line x1="0" y1="-10" x2="0" y2="10"
        :stroke="isActive ? '#4ade80' : '#444'"
        stroke-width="2" stroke-linecap="round"
      />
      <circle cx="11" cy="0" r="2.5" :fill="isActive ? '#60b8ff' : '#222'" />
      <circle cx="-11" cy="0" r="2.5" :fill="isActive ? '#60b8ff' : '#222'" />
      <circle cx="0" cy="11" r="2.5" :fill="isActive ? '#60b8ff' : '#222'" />
      <circle cx="0" cy="-11" r="2.5" :fill="isActive ? '#60b8ff' : '#222'" />
    </g>

    <!-- Pulsation -->
    <circle v-if="isActive && !hasFault" cx="25" cy="42" r="14"
      fill="none" stroke="#4ade80" stroke-width="1.5" opacity="0.6"
    >
      <animate attributeName="r" values="14;19;14" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite" />
    </circle>

    <!-- Défaut -->
    <circle v-if="hasFault" cx="36" cy="30" r="7" fill="#f87171" />
    <text v-if="hasFault" x="36" y="34" text-anchor="middle" fill="white" font-size="9" font-weight="bold">!</text>

    <BuilderInteraction :width="50" :height="100">
      <q-menu touch-position context-menu>
        <q-list>
          <q-item>
            <q-item-section class="text-caption text-grey">
              {{ cipBall?.name ?? 'Boule CIP non configuree' }}
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section class="text-caption">
              Statut : {{ cipBall?.status ?? 'N/C' }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
