<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { usePart } from '@/plugins/builder/composables';
import { useIndustrialStore } from '../../store';

const { settings } = usePart.setup();
const store = useIndustrialStore();

const agitator = computed(() => settings.value.agitatorId ? store.getAgitator(settings.value.agitatorId) : null);
const isRunning = computed(() => agitator.value?.running ?? false);
const hasFault = computed(() => agitator.value?.status === 'FAULT' || agitator.value?.status === 'COMM_ERROR');
const indicatorColor = computed(() => { if (!agitator.value) return '#444'; if (hasFault.value) return '#f87171'; if (isRunning.value) return '#4ade80'; return '#6b7280'; });

const angle = ref(0);
let animFrame: number | null = null;

function startAnim(): void {
  const step = ((agitator.value?.speed_pct ?? 50) / 100) * 4;
  const animate = (): void => { angle.value = (angle.value + step) % 360; animFrame = requestAnimationFrame(animate); };
  animFrame = requestAnimationFrame(animate);
}
function stopAnim(): void { if (animFrame !== null) { cancelAnimationFrame(animFrame); animFrame = null; } }

watch(isRunning, (r) => { if (r) startAnim(); else stopAnim(); }, { immediate: true });
onUnmounted(stopAnim);
</script>

<template>
  <svg viewBox="0 0 50 50" width="50" height="50" xmlns="http://www.w3.org/2000/svg">
    <circle cx="25" cy="25" r="18" :fill="isRunning ? '#0a1a0a' : '#111'" :stroke="indicatorColor" stroke-width="2" />
    <text x="25" y="30" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="monospace">M</text>
    <line x1="25" y1="43" x2="25" y2="50" stroke="#888" stroke-width="3" />
    <g :transform="'translate(25, 50) rotate(' + angle + ')'">
      <line x1="0" y1="0" x2="0" y2="-8" :stroke="isRunning ? '#60a5fa' : '#444'" stroke-width="2.5" stroke-linecap="round" />
      <line x1="0" y1="0" x2="8" y2="0" :stroke="isRunning ? '#60a5fa' : '#444'" stroke-width="2.5" stroke-linecap="round" />
      <line x1="0" y1="0" x2="0" y2="8" :stroke="isRunning ? '#60a5fa' : '#444'" stroke-width="2.5" stroke-linecap="round" />
      <line x1="0" y1="0" x2="-8" y2="0" :stroke="isRunning ? '#60a5fa' : '#444'" stroke-width="2.5" stroke-linecap="round" />
    </g>
    <circle cx="38" cy="12" r="5" :fill="indicatorColor" />
    <text v-if="hasFault" x="38" y="16" text-anchor="middle" fill="white" font-size="7" font-weight="bold">!</text>
  </svg>
</template>
