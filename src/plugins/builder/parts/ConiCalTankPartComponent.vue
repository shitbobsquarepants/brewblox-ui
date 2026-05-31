<script setup lang="ts">
import { computed } from 'vue';
import { useIndustrialStore } from '@/plugins/industrial/store';
import { DEFAULT_SIZE } from '../blueprints/ConiCalTank';
import { usePart } from '../composables';

const { width, height, settings } = usePart.setup();
const store = useIndustrialStore();

const levelSensor = computed(() =>
  settings.value.levelSensorId
    ? store.getLevelSensor(settings.value.levelSensorId)
    : null,
);

const cipBall = computed(() =>
  settings.value.cipBallId ? store.getCIPBall(settings.value.cipBallId) : null,
);

const levelPct = computed(() => levelSensor.value?.level_pct ?? 0);
const cipActive = computed(() => cipBall.value?.active ?? false);
const tankName = computed(() => settings.value.name ?? 'Cuve');

// Geometrie SVG viewBox 100x250
const VW = 100;
const VH = 250;
const WALL = 4;
const cylRatio = computed(() => settings.value.cylinderHeightRatio ?? 0.65);
const cylH = computed(() => VH * cylRatio.value);
const coneH = computed(() => VH * (1 - cylRatio.value) - 10);
const botY = computed(() => cylH.value + coneH.value);
const tipX = VW / 2;

const outerPath = computed(() => {
  const cy = cylH.value;
  const bot = botY.value;
  return [
    `M ${WALL} 0`,
    `L ${VW - WALL} 0`,
    `L ${VW - WALL} ${cy}`,
    `L ${tipX + 5} ${bot}`,
    `L ${tipX - 5} ${bot}`,
    `L ${WALL} ${cy}`,
    'Z',
  ].join(' ');
});

const liquidTopY = computed(() => {
  const pct = levelPct.value / 100;
  if (pct === 0) return botY.value;
  const coneVol = 0.15;
  if (pct <= coneVol) {
    return botY.value - coneH.value * Math.cbrt(pct / coneVol);
  }
  return cylH.value * (1 - (pct - coneVol) / (1 - coneVol));
});

const liquidPath = computed(() => {
  const topY = liquidTopY.value;
  const cy = cylH.value;
  const bot = botY.value;
  const iW = VW - 2 * WALL;
  if (topY >= bot) return '';
  if (topY >= cy) {
    const prog = (topY - cy) / coneH.value;
    const w = iW * (1 - prog) + 10 * prog;
    const x = tipX - w / 2;
    return [
      `M ${x} ${topY}`,
      `L ${x + w} ${topY}`,
      `L ${tipX + 5} ${bot}`,
      `L ${tipX - 5} ${bot}`,
      'Z',
    ].join(' ');
  }
  return [
    `M ${WALL} ${topY}`,
    `L ${VW - WALL} ${topY}`,
    `L ${VW - WALL} ${cy}`,
    `L ${tipX + 5} ${bot}`,
    `L ${tipX - 5} ${bot}`,
    `L ${WALL} ${cy}`,
    'Z',
  ].join(' ');
});

const liquidColor = computed(() => {
  const p = levelPct.value;
  if (p > 90) return '#1a3a6a';
  if (p > 10) return '#1a2a4a';
  return '#3a1a1a';
});
</script>

<template>
  <svg
    v-bind="{ width, height }"
    :viewBox="`0 0 ${VW} ${VH}`"
  >
    <defs>
      <clipPath id="conical-clip">
        <path :d="outerPath" />
      </clipPath>
    </defs>

    <!-- Fond -->
    <path
      :d="outerPath"
      fill="#0d0d0d"
      stroke="none"
    />

    <!-- Liquide -->
    <g clip-path="url(#conical-clip)">
      <path
        v-if="liquidPath"
        :d="liquidPath"
        :fill="liquidColor"
        opacity="0.85"
      />
      <line
        v-if="liquidPath && liquidTopY < cylH"
        :x1="WALL + 2"
        :y1="liquidTopY + 1"
        :x2="VW - WALL - 2"
        :y2="liquidTopY + 1"
        stroke="rgba(255,255,255,0.15)"
        stroke-width="1.5"
      />
    </g>

    <!-- Paroi -->
    <path
      :d="outerPath"
      fill="none"
      stroke="#555"
      stroke-width="2"
    />

    <!-- Boule CIP -->
    <g
      v-if="cipBall"
      :transform="`translate(${VW / 2 - 4}, 8)`"
    >
      <line
        x1="4"
        y1="-8"
        x2="4"
        y2="2"
        stroke="#888"
        stroke-width="2"
      />
      <circle
        cx="4"
        cy="9"
        r="7"
        :fill="cipActive ? '#0a2520' : '#111'"
        :stroke="cipActive ? '#4ade80' : '#444'"
        stroke-width="1"
      />
      <circle
        cx="4"
        cy="9"
        r="2"
        :fill="cipActive ? '#4ade80' : '#444'"
      />
    </g>

    <!-- Niveau % -->
    <text
      v-if="levelSensor"
      :x="VW / 2"
      :y="Math.max(liquidTopY - 4, 14)"
      text-anchor="middle"
      :fill="levelPct < 15 ? '#f87171' : levelPct > 85 ? '#60a5fa' : '#e0e0e0'"
      font-size="11"
      font-weight="bold"
      font-family="monospace"
    >
      {{ levelPct.toFixed(0) }}%
    </text>

    <!-- Nom -->
    <text
      :x="VW / 2"
      :y="VH - 4"
      text-anchor="middle"
      fill="#6b7280"
      font-size="9"
      font-family="sans-serif"
    >
      {{ tankName }}
    </text>

    <BuilderInteraction
      :width="VW"
      :height="VH"
    >
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <q-item>
            <q-item-section class="text-caption text-grey">
              {{ tankName }}
            </q-item-section>
          </q-item>
          <q-item v-if="levelSensor">
            <q-item-section class="text-caption">
              Niveau : {{ levelPct.toFixed(1) }}% ({{
                levelSensor.volume_hl.toFixed(2)
              }}
              hL)
            </q-item-section>
          </q-item>
          <SizeMenuContent
            :min="{ width: 1, height: 3 }"
            :max="{ width: 6, height: 12 }"
            :default="DEFAULT_SIZE"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
