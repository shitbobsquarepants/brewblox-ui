<script setup lang="ts">
import { DigitalState } from 'brewblox-proto/ts';
import { computed } from 'vue';
import { DEFAULT_SIZE } from '../blueprints/CIPBall';
import { usePart, useSettingsBlock } from '../composables';
import { CIP_BALL_KEY, DIGITAL_TYPES } from '../const';

const { settings, width, height } = usePart.setup();
const {
  block: cipBallBlock,
  blockStatus: cipBallStatus,
  hasAddress: hasCipBall,
  showBlockDialog: showCipBallDialog,
  showBlockSelectDialog: showCipBallSelectDialog,
  patchBlock,
} = useSettingsBlock.setup(CIP_BALL_KEY, DIGITAL_TYPES);

const isActive = computed(() =>
  hasCipBall.value && cipBallBlock.value
    ? cipBallBlock.value.data.state === DigitalState.STATE_ACTIVE
    : settings.value['active'] ?? false,
);

function toggleActive(): void {
  if (hasCipBall.value && cipBallBlock.value) {
    patchBlock({
      data: {
        state: isActive.value
          ? DigitalState.STATE_INACTIVE
          : DigitalState.STATE_ACTIVE,
      },
    } as any);
  } else {
    settings.value['active'] = !isActive.value;
  }
}
</script>

<template>
  <svg v-bind="{ width, height }">
    <rect
      :x="width / 2 - 2"
      y="0"
      width="4"
      :height="height * 0.28"
      fill="white"
    />
    <circle
      :cx="width / 2"
      :cy="height / 2 + height * 0.05"
      :r="height * 0.32"
      fill="none"
      stroke="white"
      stroke-width="2"
    />
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
    <circle
      :cx="width - 3"
      :cy="3"
      r="2.5"
      :fill="isActive ? '#4ade80' : '#6b7280'"
    />
    <BuilderAbsentBlock
      :key="CIP_BALL_KEY"
      :status="cipBallStatus"
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
          <q-item
            clickable
            @click="showCipBallSelectDialog"
          >
            <q-item-section>
              <q-item-label>Assign CIP Ball Actuator</q-item-label>
            </q-item-section>
          </q-item>
          <q-item
            v-if="hasCipBall"
            clickable
            @click="showCipBallDialog"
          >
            <q-item-section>
              <q-item-label>
                Actuator: {{ cipBallBlock?.serviceId }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </BuilderInteraction>
  </svg>
</template>
