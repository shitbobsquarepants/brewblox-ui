<script setup lang="ts">
import { computed } from 'vue';
import { usePart } from '@/plugins/builder/composables';
import { useIndustrialStore } from '../../store';

const { settings } = usePart.setup();
const store = useIndustrialStore();

const TOTAL_W = 60;
const TOTAL_H = 120;
const WALL = 3;

const cylinderRatio = computed(
  () => settings.value.cylinderHeightRatio ?? 0.65,
);
const cylinderH = computed(() => TOTAL_H * cylinderRatio.value);
const coneH = computed(() => TOTAL_H * (1 - cylinderRatio.value));
const innerLeft = WALL;
const innerRight = TOTAL_W - WALL;
const innerW = TOTAL_W - 2 * WALL;
const coneBottom = computed(() => TOTAL_H - WALL);
const coneTipX = TOTAL_W / 2;

const outerPath = computed(() => {
  const cy = cylinderH.value;
  return [
    'M ' + WALL + ' 0',
    'L ' + (TOTAL_W - WALL) + ' 0',
    'L ' + (TOTAL_W - WALL) + ' ' + cy,
    'L ' + (coneTipX + 4) + ' ' + coneBottom.value,
    'L ' + (coneTipX - 4) + ' ' + coneBottom.value,
    'L ' + WALL + ' ' + cy,
    'Z',
  ].join(' ');
});

const levelSensor = computed(() =>
  settings.value.levelSensorId
    ? store.getLevelSensor(settings.value.levelSensorId)
    : null,
);
const cipBall = computed(() =>
  settings.value.cipBallId ? store.getCIPBall(settings.value.cipBallId) : null,
);
const levelPct = computed(() => levelSensor.value?.level_pct ?? 0);

const liquidColor = computed(() => {
  const p = levelPct.value;
  if (p > 90) return '#1a3a6a';
  if (p > 10) return '#1a2a4a';
  return '#3a1a1a';
});

const liquidTopY = computed(() => {
  const pct = levelPct.value / 100;
  if (pct === 0) return coneBottom.value;
  const coneVolRatio = 0.15;
  if (pct <= coneVolRatio)
    return coneBottom.value - coneH.value * Math.cbrt(pct / coneVolRatio);
  return cylinderH.value * (1 - (pct - coneVolRatio) / (1 - coneVolRatio));
});

const liquidPath = computed(() => {
  const topY = liquidTopY.value;
  const cy = cylinderH.value;
  const bot = coneBottom.value;
  if (topY >= bot) return '';
  if (topY >= cy) {
    const progress = (topY - cy) / coneH.value;
    const topW = innerW * (1 - progress) + 8 * progress;
    const topX = coneTipX - topW / 2;
    return [
      'M ' + topX + ' ' + topY,
      'L ' + (topX + topW) + ' ' + topY,
      'L ' + (coneTipX + 4) + ' ' + bot,
      'L ' + (coneTipX - 4) + ' ' + bot,
      'Z',
    ].join(' ');
  }
  return [
    'M ' + innerLeft + ' ' + topY,
    'L ' + innerRight + ' ' + topY,
    'L ' + innerRight + ' ' + cy,
    'L ' + (coneTipX + 4) + ' ' + bot,
    'L ' + (coneTipX - 4) + ' ' + bot,
    'L ' + innerLeft + ' ' + cy,
    'Z',
  ].join(' ');
});

const cipActive = computed(() => cipBall.value?.active ?? false);
const tankName = computed(() => settings.value.name ?? 'Cuve');
</script>

<template>
  <svg
    :viewBox="'0 0 ' + TOTAL_W + ' ' + (TOTAL_H + 20)"
    :width="TOTAL_W"
    :height="TOTAL_H + 20"
    xmlns="http://www.w3.org/2000/svg"
    overflow="visible"
  >
    <defs>
      <clipPath id="tank-clip">
        <path :d="outerPath" />
      </clipPath>
    </defs>
    <path
      :d="outerPath"
      fill="#0d0d0d"
      stroke="none"
    />
    <g clip-path="url(#tank-clip)">
      <path
        v-if="liquidPath"
        :d="liquidPath"
        :fill="liquidColor"
        opacity="0.85"
      />
      <line
        v-if="liquidPath && liquidTopY < cylinderH"
        :x1="innerLeft + 2"
        :y1="liquidTopY + 1"
        :x2="innerRight - 2"
        :y2="liquidTopY + 1"
        stroke="rgba(255,255,255,0.15)"
        stroke-width="1.5"
      />
    </g>
    <path
      :d="outerPath"
      fill="none"
      stroke="#555"
      stroke-width="2"
    />
    <path
      :d="outerPath"
      fill="none"
      stroke="rgba(255,255,255,0.08)"
      stroke-width="1"
    />
    <g
      v-if="cipBall"
      :transform="'translate(' + (TOTAL_W / 2 - 5) + ', 8)'"
    >
      <line
        x1="5"
        y1="-8"
        x2="5"
        y2="2"
        stroke="#888"
        stroke-width="2"
      />
      <circle
        cx="5"
        cy="8"
        r="6"
        :fill="cipActive ? '#0a2520' : '#111'"
        :stroke="cipActive ? '#4ade80' : '#444'"
        stroke-width="1"
      />
      <circle
        cx="5"
        cy="8"
        r="1.5"
        :fill="cipActive ? '#4ade80' : '#444'"
      />
    </g>
    <text
      v-if="levelSensor"
      :x="TOTAL_W / 2"
      :y="Math.max(liquidTopY - 4, 15)"
      text-anchor="middle"
      :fill="levelPct < 15 ? '#f87171' : levelPct > 85 ? '#60a5fa' : '#e0e0e0'"
      font-size="9"
      font-weight="bold"
      font-family="monospace"
    >
      {{ levelPct.toFixed(0) }}%
    </text>
    <text
      :x="TOTAL_W / 2"
      :y="TOTAL_H + 14"
      text-anchor="middle"
      fill="#6b7280"
      font-size="8"
      font-family="sans-serif"
    >
      {{ tankName }}
    </text>
  </svg>
</template>
