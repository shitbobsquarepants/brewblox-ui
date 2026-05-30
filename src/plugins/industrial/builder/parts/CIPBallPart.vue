<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { usePart } from '@/plugins/builder/composables';
import { useIndustrialStore } from '../../store';

const { settings } = usePart.setup();
const store = useIndustrialStore();

const cipBall = computed(() =>
  settings.value.cipBallId ? store.getCIPBall(settings.value.cipBallId) : null,
);
const isActive = computed(() => cipBall.value?.active ?? false);
const hasFault = computed(
  () =>
    cipBall.value?.status === 'FAULT' || cipBall.value?.status === 'COMM_ERROR',
);

const rotationAngle = ref(0);
let animFrame: number | null = null;

function startAnimation(): void {
  const animate = (): void => {
    rotationAngle.value = (rotationAngle.value + 3) % 360;
    animFrame = requestAnimationFrame(animate);
  };
  animFrame = requestAnimationFrame(animate);
}
function stopAnimation(): void {
  if (animFrame !== null) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
}

watch(
  isActive,
  (active) => {
    if (active) startAnimation();
    else stopAnimation();
  },
  { immediate: true },
);
onUnmounted(stopAnimation);
</script>

<template>
  <svg
    viewBox="0 0 50 60"
    width="50"
    height="60"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="22"
      y="0"
      width="6"
      height="22"
      fill="#888"
      rx="1"
    />
    <circle
      cx="25"
      cy="34"
      r="12"
      :fill="isActive ? '#0a2520' : '#1a1a1a'"
      :stroke="hasFault ? '#f87171' : isActive ? '#4ade80' : '#444'"
      stroke-width="1.5"
    />
    <g :transform="'translate(25, 34) rotate(' + rotationAngle + ')'">
      <line
        x1="-9"
        y1="0"
        x2="9"
        y2="0"
        :stroke="isActive ? '#4ade80' : '#444'"
        stroke-width="2"
        stroke-linecap="round"
      />
      <line
        x1="0"
        y1="-9"
        x2="0"
        y2="9"
        :stroke="isActive ? '#4ade80' : '#444'"
        stroke-width="2"
        stroke-linecap="round"
      />
      <circle
        v-for="(pos, i) in [
          { x: 10, y: 0 },
          { x: -10, y: 0 },
          { x: 0, y: 10 },
          { x: 0, y: -10 },
        ]"
        :key="i"
        :cx="pos.x"
        :cy="pos.y"
        r="2.5"
        :fill="isActive ? '#60b8ff' : '#222'"
      />
    </g>
    <circle
      v-if="isActive && !hasFault"
      cx="25"
      cy="34"
      r="12"
      fill="none"
      stroke="#4ade80"
      stroke-width="1.5"
      opacity="0.6"
    >
      <animate
        attributeName="r"
        values="12;17;12"
        dur="1.8s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="opacity"
        values="0.6;0;0.6"
        dur="1.8s"
        repeatCount="indefinite"
      />
    </circle>
    <circle
      v-if="hasFault"
      cx="37"
      cy="24"
      r="6"
      fill="#f87171"
    />
    <text
      v-if="hasFault"
      x="37"
      y="28"
      text-anchor="middle"
      fill="white"
      font-size="8"
      font-weight="bold"
    >
      !
    </text>
  </svg>
</template>
