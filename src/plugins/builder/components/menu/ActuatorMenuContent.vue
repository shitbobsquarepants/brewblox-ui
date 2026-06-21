<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  blockId: string;
}
defineProps<Props>();

const mode = ref('AUTO');
const status = ref('MONITORED');
const tab = ref('control');
</script>

<template>
  <q-item v-ripple class="q-mb-sm">
    <q-item-section>
      <q-item-label class="text-uppercase text-caption">{{ blockId }}</q-item-label>
      <q-item-label caption>Mode: <span class="text-info">{{ mode }}</span> | Status: <span class="text-info">{{ status }}</span></q-item-label>
    </q-item-section>
  </q-item>

  <q-item>
    <q-tabs v-model="tab" dense class="text-white col">
      <q-tab name="control" label="Control" />
      <q-tab name="settings" label="Settings" />
    </q-tabs>
  </q-item>

  <q-tab-panels v-model="tab" animated>
    <q-tab-panel name="control" class="q-pa-sm">
      <div class="text-caption text-uppercase q-mb-sm">Mode</div>
      <div class="row q-gutter-xs q-mb-md">
        <q-btn 
          flat dense size="sm" 
          :color="mode === 'AUTO' ? 'positive' : 'grey'" 
          label="AUTO" 
          @click.stop="mode = 'AUTO'" 
          class="col"
        />
        <q-btn 
          flat dense size="sm" 
          :color="mode === 'MASK' ? 'warning' : 'grey'" 
          label="MASK" 
          @click.stop="mode = 'MASK'" 
          class="col"
        />
        <q-btn 
          flat dense size="sm" 
          :color="mode === 'MANUAL' ? 'info' : 'grey'" 
          label="MANUAL" 
          @click.stop="mode = 'MANUAL'" 
          class="col"
        />
        <q-btn 
          flat dense size="sm" 
          :color="mode === 'MAINTENANCE' ? 'negative' : 'grey'" 
          label="MAINT" 
          @click.stop="mode = 'MAINTENANCE'" 
          class="col"
        />
      </div>

      <div v-if="mode === 'MANUAL'" class="text-caption text-uppercase q-mb-sm">Status (Manual Only)</div>
      <div v-if="mode === 'MANUAL'" class="row q-gutter-xs">
        <q-btn 
          flat dense size="sm" 
          color="positive" 
          label="ENERGISE" 
          @click.stop="status = 'ENERGISED'" 
          class="col"
        />
        <q-btn 
          flat dense size="sm" 
          color="negative" 
          label="DE-ENERGISE" 
          @click.stop="status = 'DE_ENERGISED'" 
          class="col"
        />
      </div>
    </q-tab-panel>

    <q-tab-panel name="settings" class="q-pa-sm">
      <div class="text-caption">Settings coming soon...</div>
    </q-tab-panel>
  </q-tab-panels>
</template>
