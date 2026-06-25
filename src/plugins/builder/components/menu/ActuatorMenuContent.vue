<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  blockId: string;
}
defineProps<Props>();

const mode = ref('AUTO');
const status = ref('MONITORED');
const tab = ref('control');
const loading = ref(false);

const apiBase = 'http://192.168.0.40:5000/api/actuators';

async function setMode(newMode: string) {
  loading.value = true;
  try {
    const res = await fetch(`${apiBase}/${blockId}/mode/${newMode}`, { method: 'POST' });
    if (res.ok) mode.value = newMode;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
}

async function setStatus(newStatus: string) {
  loading.value = true;
  try {
    const res = await fetch(`${apiBase}/${blockId}/status/${newStatus}`, { method: 'POST' });
    if (res.ok) status.value = newStatus;
  } catch (e) {
    console.error(e);
  }
  loading.value = false;
}
</script>

<template>
  <q-item v-ripple class="q-mb-sm">
    <q-item-section>
      <q-item-label class="text-uppercase text-caption">{{ blockId }}</q-item-label>
      <q-item-label caption>Mode: <span class="text-info">{{ mode }}</span> | Status: <span class="text-info">{{ status }}</span></q-item-label>
    </q-item-section>
  </q-item>

  <q-item>
    <q-item-section class="col">
      <q-tabs v-model="tab" dense class="text-white">
        <q-tab name="control" label="Control" />
        <q-tab name="settings" label="Settings" />
      </q-tabs>
    </q-item-section>
  </q-item>

  <q-item v-show="tab === 'control'" v-ripple class="q-pa-sm">
    <q-item-section>
      <div class="text-caption text-uppercase q-mb-sm">Mode</div>
      <div class="row q-gutter-xs q-mb-md">
        <q-btn flat dense size="sm" :color="mode === 'AUTO' ? 'positive' : 'grey'" label="AUTO" :loading="loading" @click.stop="setMode('AUTO')" class="col" />
        <q-btn flat dense size="sm" :color="mode === 'MASK' ? 'warning' : 'grey'" label="MASK" :loading="loading" @click.stop="setMode('MASK')" class="col" />
        <q-btn flat dense size="sm" :color="mode === 'MANUAL' ? 'info' : 'grey'" label="MANUAL" :loading="loading" @click.stop="setMode('MANUAL')" class="col" />
        <q-btn flat dense size="sm" :color="mode === 'MAINTENANCE' ? 'negative' : 'grey'" label="MAINT" :loading="loading" @click.stop="setMode('MAINTENANCE')" class="col" />
      </div>

      <div v-if="mode === 'MANUAL'" class="text-caption text-uppercase q-mb-sm">Status</div>
      <div v-if="mode === 'MANUAL'" class="row q-gutter-xs">
        <q-btn flat dense size="sm" color="positive" label="ENERGISE" :loading="loading" @click.stop="setStatus('ENERGISED')" class="col" />
        <q-btn flat dense size="sm" color="negative" label="DE-ENERGISE" :loading="loading" @click.stop="setStatus('DE_ENERGISED')" class="col" />
      </div>
    </q-item-section>
  </q-item>

  <q-item v-show="tab === 'settings'" v-ripple class="q-pa-sm">
    <q-item-section>
      <div class="text-caption">Settings coming soon...</div>
    </q-item-section>
  </q-item>
</template>
