<script setup lang="ts">
import { computed } from 'vue';
import { ACTIVE_KEY, DEFAULT_SIZE } from '../blueprints/CIPBall';
import { usePart } from '../composables';

const { settings, width, height } = usePart.setup();

const isActive = computed(() => settings.value[ACTIVE_KEY] ?? false);

function toggleActive(): void {
  settings.value[ACTIVE_KEY] = !isActive.value;
}
</script>

<template>
  <svg v-bind="{ width, height }">
    <!-- Supply pipe top -->
    <rect
      :x="width / 2 - 2"
      y="0"
      width="4"
      :height="height * 0.28"
      fill="white"
    />

    <!-- Ball body -->
    <circle
      :cx="width / 2"
      :cy="height / 2 + height * 0.05"
      :r="height * 0.32"
      fill="none"
      stroke="white"
      stroke-width="2"
    />

    <!-- Cross inside ball -->
    <line
      :x1="width / 2 - height * 0.2"
      :y1="height / 2 + height * 0.05"
      :x2="width / 2 + height * 0.2"
      :y2="height / 2 + height * 0.05"
      stroke="white"
      stroke-width="1.5"
      opacity="0.7"
    />
    <line
      :x1="width / 2"
      :y1="height / 2 - height * 0.15"
      :x2="width / 2"
      :y2="height / 2 + height * 0.25"
      stroke="white"
      stroke-width="1.5"
      opacity="0.7"
    />

    <!-- Jets — 8 directions like reference -->
    <g
      v-for="angle in [0, 45, 90, 135, 180, 225, 270, 315]"
      :key="angle"
      :transform="`translate(${width / 2}, ${height / 2 + height * 0.05}) rotate(${angle})`"
    >
      <line
        :x1="height * 0.33"
        y1="0"
        :x2="height * 0.46"
        y2="0"
        :stroke="isActive ? 'white' : 'rgba(255,255,255,0.25)'"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </g>

    <!-- Active dot -->
    <circle
      :cx="width - 3"
      cy="3"
      r="2.5"
      :fill="isActive ? '#4ade80' : '#6b7280'"
    />

    <BuilderInteraction v-bind="{ width, height }">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <ToggleMenuContent
            :model-value="isActive"
            label="CIP Active"
            @update:model-value="toggleActive()"
          />
          <SizeMenuContent
            :min="{ width: 1, height: 1 }"
            :max="{ width: 3, height: 3 }"
            :default="DEFAULT_SIZE"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
