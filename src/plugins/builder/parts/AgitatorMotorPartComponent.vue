<script setup lang="ts">
import { computed } from 'vue';
import { DEFAULT_SIZE } from '../blueprints/AgitatorMotor';
import { usePart, useSettingsBlock } from '../composables';
import { ACTUATOR_KEY, DIGITAL_ACTUATOR_TYPES } from '../const';
import { DigitalState } from 'brewblox-proto/ts';
import { DigitalActuatorBlockT } from '@/plugins/spark/types';
import { showAbsentBlock } from '@/plugins/builder/utils';

const { settings, width, height } = usePart.setup();
const {
  block: actuatorBlock,
  blockStatus: actuatorStatus,
  hasAddress: hasActuator,
  showBlockDialog: showActuatorDialog,
  showBlockSelectDialog: showActuatorSelectDialog,
  patchBlock,
} = useSettingsBlock.setup<DigitalActuatorBlockT>(ACTUATOR_KEY, DIGITAL_ACTUATOR_TYPES);

const isRunning = computed(() =>
  hasActuator.value && actuatorBlock.value
    ? actuatorBlock.value.data.state === DigitalState.STATE_ACTIVE
    : settings.value['running'] ?? false,
);

function toggleRunning(): void {
  if (hasActuator.value && actuatorBlock.value) {
    patchBlock({
      data: {
        state: isRunning.value ? DigitalState.STATE_INACTIVE : DigitalState.STATE_ACTIVE,
      },
    });
  } else {
    settings.value['running'] = !isRunning.value;
  }
}
</script>

<template>
  <svg v-bind="{ width, height }">
    <circle
      :cx="width / 2"
      :cy="width / 2"
      :r="width / 2 - 2"
      fill="none"
      stroke="white"
      stroke-width="2"
    />
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
    <line
      :x1="width / 2"
      :y1="width - 2"
      :x2="width / 2"
      :y2="height - 4"
      stroke="white"
      stroke-width="2"
    />
    <g :transform="`translate(${width / 2}, ${height - 4})`">
      <line x1="0" y1="0" x2="-8" y2="4" stroke="white" stroke-width="2" stroke-linecap="round" />
      <line x1="0" y1="0" x2="8" y2="4" stroke="white" stroke-width="2" stroke-linecap="round" />
      <line x1="0" y1="0" x2="0" y2="6" stroke="white" stroke-width="2" stroke-linecap="round" />
    </g>
    <circle
      :cx="width - 4"
      :cy="4"
      r="3"
      :fill="isRunning ? '#4ade80' : '#6b7280'"
    />
    <BuilderAbsentBlock v-if="showAbsentBlock(actuatorStatus)" :status="actuatorStatus" />
    <BuilderInteraction v-bind="{ width, height }">
      <q-menu touch-position context-menu>
        <q-list>
          <ToggleMenuContent
            :model-value="isRunning"
            label="Running"
            @update:model-value="toggleRunning()"
          />
          <SizeMenuContent
            :min="{ width: 1, height: 1 }"
            :max="{ width: 3, height: 3 }"
            :default="DEFAULT_SIZE"
          />
          <q-item clickable @click="showActuatorSelectDialog">
            <q-item-section>
              <q-item-label>Assign Actuator</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="hasActuator" clickable @click="showActuatorDialog">
            <q-item-section>
              <q-item-label>Actuator: {{ actuatorBlock?.service?.id }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
