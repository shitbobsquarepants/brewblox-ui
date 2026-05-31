<script setup lang="ts">
import { computed } from 'vue';
import { colorString } from '@/plugins/builder/utils';
import {
  CONE_ANGLE_KEY,
  DEFAULT_CONE_ANGLE,
  DEFAULT_LEVEL,
  DEFAULT_SIZE,
  LABEL_KEY_TANK,
  LEVEL_KEY,
  MAX_SIZE,
  MIN_SIZE,
} from '../blueprints/ConiCalTank';
import { usePart } from '../composables';
import { COLOR_KEY } from '../const';

const { settings, width, height } = usePart.setup();

const color = computed<string>(() =>
  colorString(settings.value[COLOR_KEY]),
);

const levelPct = computed<number>(
  () => settings.value[LEVEL_KEY] ?? DEFAULT_LEVEL,
);

const coneAnglePct = computed<number>(
  () => settings.value[CONE_ANGLE_KEY] ?? DEFAULT_CONE_ANGLE,
);

// Geometry — cylinder + cone
// coneAnglePct: 0 = flat bottom, 100 = very pointed
const coneRatio = computed(() => 0.15 + (coneAnglePct.value / 100) * 0.35);
const cylH = computed(() => height.value * (1 - coneRatio.value));
const coneH = computed(() => height.value * coneRatio.value);

const tipX = computed(() => width.value / 2);
const tipY = computed(() => height.value - 2);

// Liquid fill path — follows cone geometry
const filledH = computed(() => levelPct.value * (height.value / 100));

const liquidPath = computed(() => {
  const lh = filledH.value;
  const ch = cylH.value;
  const W = width.value;
  const tx = tipX.value;
  const ty = tipY.value;

  if (lh <= 0) return '';

  if (lh <= coneH.value) {
    // Only in cone
    const prog = lh / coneH.value;
    const hw = (W / 2 - 2) * prog;
    const topY = ty - lh;
    return [
      `M ${tx - hw} ${topY}`,
      `L ${tx + hw} ${topY}`,
      `L ${tx + 2} ${ty}`,
      `L ${tx - 2} ${ty}`,
      'Z',
    ].join(' ');
  }

  // Cylinder + cone
  const cylFill = lh - coneH.value;
  const topY = ch - cylFill;
  return [
    `M 2 ${topY}`,
    `L ${W - 2} ${topY}`,
    `L ${W - 2} ${ch}`,
    `L ${tx + 2} ${ty}`,
    `L ${tx - 2} ${ty}`,
    `L 2 ${ch}`,
    'Z',
  ].join(' ');
});

// Outline path
const outlinePath = computed(() => {
  const W = width.value;
  const ch = cylH.value;
  const tx = tipX.value;
  const ty = tipY.value;
  return [
    `M 2 2`,
    `L ${W - 2} 2`,
    `L ${W - 2} ${ch}`,
    `L ${tx + 2} ${ty}`,
    `L ${tx - 2} ${ty}`,
    `L 2 ${ch}`,
    'Z',
  ].join(' ');
});
</script>

<template>
  <svg v-bind="{ width, height }">
    <!-- Liquid fill -->
    <path
      :d="liquidPath"
      :fill="color"
      opacity="0.9"
    />

    <!-- Outline — same weight as native BuilderBorder -->
    <path
      :d="outlinePath"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linejoin="round"
    />

    <!-- Label -->
    <BuilderLabelValues
      :width="width"
      :height="50"
    />

    <BuilderInteraction v-bind="{ width, height }">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <ColorMenuContent />
          <SizeMenuContent
            :min="MIN_SIZE"
            :max="MAX_SIZE"
            :default="DEFAULT_SIZE"
          />
          <SliderMenuContent
            :min="0"
            :max="100"
            :default="DEFAULT_LEVEL"
            :settings-key="LEVEL_KEY"
            label="Liquid level"
            postfix="%"
          />
          <SliderMenuContent
            :min="0"
            :max="100"
            :default="DEFAULT_CONE_ANGLE"
            :settings-key="CONE_ANGLE_KEY"
            label="Cone angle"
            postfix="%"
          />
          <TextMenuContent
            :settings-key="LABEL_KEY_TANK"
            label="Edit label"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
