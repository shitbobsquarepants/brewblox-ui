<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  blockId: string;
}
defineProps<Props>();

const mode = ref('AUTO');
const status = ref('MONITORED');

async function setMode(newMode: string) {
  mode.value = newMode;
}

async function setStatus(newStatus: string) {
  status.value = newStatus;
}
</script>

<template>
  <q-item-label header class="text-uppercase">Actuator Control</q-item-label>
  
  <q-item>
    <q-item-section>
      <div class="text-caption">{{ mode }} | {{ status }}</div>
    </q-item-section>
  </q-item>

  <q-item>
    <q-item-section>
      <div class="row q-gutter-xs">
        <q-btn flat dense size="sm" :color="mode === 'AUTO' ? 'positive' : 'grey'" label="AUTO" @click.stop="setMode('AUTO')" />
        <q-btn flat dense size="sm" :color="mode === 'MASK' ? 'warning' : 'grey'" label="MASK" @click.stop="setMode('MASK')" />
        <q-btn flat dense size="sm" :color="mode === 'MANUAL' ? 'info' : 'grey'" label="MANUAL" @click.stop="setMode('MANUAL')" />
        <q-btn flat dense size="sm" :color="mode === 'MAINTENANCE' ? 'negative' : 'grey'" label="MAINT" @click.stop="setMode('MAINTENANCE')" />
      </div>
    </q-item-section>
  </q-item>

  <q-item v-if="mode === 'MANUAL'">
    <q-item-section>
      <div class="row q-gutter-xs">
        <q-btn flat dense size="sm" color="positive" label="ENERGISE" @click.stop="setStatus('ENERGISED')" />
        <q-btn flat dense size="sm" color="negative" label="DE-ENERGISE" @click.stop="setStatus('DE_ENERGISED')" />
      </div>
    </q-item-section>
  </q-item>
</template>
