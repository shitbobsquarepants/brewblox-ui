<script setup lang="ts">
import { computed } from 'vue';
import { DEFAULT_SIZE, RUNNING_KEY } from '../blueprints/AgitatorMotor';
import { usePart } from '../composables';

const { settings, width, height } = usePart.setup();

const isRunning = computed(() => settings.value[RUNNING_KEY] ?? false);

function toggleRunning(): void {
  settings.value[RUNNING_KEY] = !isRunning.value;
}
</script>

<template>
  <svg v-bind="{ width, height }">
    <!-- Motor body — circle ISA standard -->
    <circle
      :cx="width / 2"
      :cy="width / 2"
      :r="width / 2 - 2"
      fill="none"
      stroke="white"
      stroke-width="2"
    />
    <!-- M letter -->
    <text
      :x="width / 2"
      :y="width / 2 + 5"
      text-anchor="middle"
      fill="white"
      font-size="14"
      font-weight="bold"
      font-family="monospace"
    >
      M
    </text>

    <!-- Shaft -->
    <line
      :x1="width / 2"
      :y1="width - 2"
      :x2="width / 2"
      :y2="height - 4"
      stroke="white"
      stroke-width="2"
    />

    <!-- Impeller blades — 3 blades at bottom -->
    <g :transform="`translate(${width / 2}, ${height - 4})`">
      <!-- Blade left -->
      <line
        x1="0"
        y1="0"
        x2="-8"
        y2="4"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
      />
      <!-- Blade right -->
      <line
        x1="0"
        y1="0"
        x2="8"
        y2="4"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
      />
      <!-- Blade center -->
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="6"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
      />
    </g>

    <!-- Running indicator dot -->
    <circle
      :cx="width - 4"
      :cy="4"
      r="3"
      :fill="isRunning ? '#4ade80' : '#6b7280'"
    />

    <BuilderInteraction v-bind="{ width, height }">
      <q-menu
        touch-position
        context-menu
      >
        <q-list>
          <ToggleMenuContent
            :model-value="isRunning"
            label="Running"
            @update:model-value="toggleRunning()"
          />
          <SizeMenuContent
            :min="{ width: 1, height: 2 }"
            :max="{ width: 3, height: 6 }"
            :default="DEFAULT_SIZE"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
