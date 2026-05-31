<script setup lang="ts">
import { computed } from 'vue';
import { ACTIVE_KEY, DEFAULT_SIZE } from '../blueprints/CIPBall';
import { usePart } from '../composables';

const { settings, width, height } = usePart.setup();

const isActive = computed(() => settings.value[ACTIVE_KEY] ?? false);

// Pipe enters from top, ball at bottom
const ballCY = computed(() => height.value - width.value / 2 - 2);
const ballR = computed(() => width.value / 2 - 3);

function toggleActive(): void {
  settings.value[ACTIVE_KEY] = !isActive.value;
}
</script>

<template>
  <svg v-bind="{ width, height }">
    <!-- Supply pipe — top to ball -->
    <line
      :x1="width / 2"
      y1="0"
      :x2="width / 2"
      :y2="ballCY - ballR"
      stroke="white"
      stroke-width="2"
    />

    <!-- Ball body -->
    <circle
      :cx="width / 2"
      :cy="ballCY"
      :r="ballR"
      fill="none"
      stroke="white"
      stroke-width="2"
    />

    <!-- Cross spray pattern inside ball -->
    <line
      :x1="width / 2 - ballR + 3"
      :y1="ballCY"
      :x2="width / 2 + ballR - 3"
      :y2="ballCY"
      stroke="white"
      stroke-width="1.5"
      opacity="0.6"
    />
    <line
      :x1="width / 2"
      :y1="ballCY - ballR + 3"
      :x2="width / 2"
      :y2="ballCY + ballR - 3"
      stroke="white"
      stroke-width="1.5"
      opacity="0.6"
    />

    <!-- Active indicator -->
    <circle
      :cx="width - 3"
      :cy="3"
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
            :min="{ width: 1, height: 2 }"
            :max="{ width: 3, height: 6 }"
            :default="DEFAULT_SIZE"
          />
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
