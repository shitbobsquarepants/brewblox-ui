<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  blockId: string;
}
defineProps<Props>();

const mode = ref('AUTO');
const status = ref('MONITORED');

async function setMode(newMode: string) {
  // POST /api/actuators/{blockId}/mode/{newMode}
  mode.value = newMode;
}

async function setStatus(newStatus: string) {
  // POST /api/actuators/{blockId}/status/{newStatus}
  status.value = newStatus;
}
</script>

<template>
  <q-item-label header>ACTUATOR CONTROL</q-item-label>
  
  <q-item>
    <q-item-section>
      <div class="text-caption">Mode: {{ mode }} | Status: {{ status }}</div>
    </q-item-section>
  </q-item>

  <q-item class="q-gutter-xs">
    <q-btn flat dense size="sm" :color="mode === 'AUTO' ? 'positive' : 'grey'" label="AUTO" @click="setMode('AUTO')" />
    <q-btn flat dense size="sm" :color="mode === 'MASK' ? 'warning' : 'grey'" label="MASK" @click="setMode('MASK')" />
    <q-btn flat dense size="sm" :color="mode === 'MANUAL' ? 'info' : 'grey'" label="MANUAL" @click="setMode('MANUAL')" />
    <q-btn flat dense size="sm" :color="mode === 'MAINTENANCE' ? 'negative' : 'grey'" label="MAINT" @click="setMode('MAINTENANCE')" />
  </q-item>

  <q-item class="q-gutter-xs" v-if="mode === 'MANUAL'">
    <q-btn flat dense size="sm" color="positive" label="ENERGISE" @click="setStatus('ENERGISED')" />
    <q-btn flat dense size="sm" color="negative" label="DE-ENERGISE" @click="setStatus('DE_ENERGISED')" />
  </q-item>
</template>
