<script setup lang="ts">
import { computed, ref } from 'vue';
import { useContext, useWidget } from '@/composables';
import { useSparkStore } from '@/plugins/spark/store';
import { useServiceStore } from '@/store/services';
import { useIndustrialStore } from '../store';
import type { ProcessZone, Sequence, SequenceStep, SparkBlocks, SequenceWidgetConfig } from './types';

const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<SequenceWidgetConfig>();
const store = useIndustrialStore();
const sparkStore = useSparkStore();
const serviceStore = useServiceStore();

// ---- Blocs Spark disponibles ----
const sparkBlockOpts = computed(() => {
  return serviceStore.serviceIds.flatMap((serviceId) =>
    sparkStore.blocksByService(serviceId).map((b) => ({
      label: b.id,
      value: b.id,
      caption: serviceId + ' · ' + b.type,
    })),
  );
});

// ---- State UI ----
const openFolders = ref<Set<string>>(new Set(['mash']));
const selectedSeqId = ref<string | null>(null);
const editMode = ref<'none' | 'edit-seq' | 'new-zone'>('none');
const editingZone = ref<ProcessZone | null>(null);

const selectedSeq = computed<Sequence | null>(
  () => store.allSequences.find((s) => s.id === selectedSeqId.value) ?? null,
);

// ---- Zone editor ----
const zoneForm = ref({ id: '', name: '', icon: '🏭', color: '#3fb950' });
const ZONE_ICONS = ['🍺','🔥','🌪️','🧼','🎯','➡️','🏭','⚙️','💧','🧪'];

function openNewZone(): void {
  zoneForm.value = { id: '', name: '', icon: '🏭', color: '#3fb950' };
  editingZone.value = null;
  editMode.value = 'new-zone';
}

function openEditZone(zone: ProcessZone): void {
  zoneForm.value = { ...zone };
  editingZone.value = zone;
  editMode.value = 'new-zone';
}

function saveZone(): void {
  if (!zoneForm.value.name) return;
  const id = editingZone.value?.id ?? zoneForm.value.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  store.addZone({ ...zoneForm.value, id });
  openFolders.value.add(id);
  editMode.value = 'none';
}

function deleteZone(id: string): void {
  store.deleteZone(id);
  if (selectedSeq.value?.zone_id === id) selectedSeqId.value = null;
}

// ---- Sequence editor ----
const seqForm = ref<Sequence>({
  id: '', name: '', zone_id: '',
  steps: [],
  spark_blocks: { vannes: [], pompes: [], capteurs: [] },
});
const isNewSeq = ref(false);

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function emptyStep(): SequenceStep {
  return { name: 'Nouvelle étape', duration_minutes: 30, temperature: null, pressure: null, flow_rate: null, power: null };
}

function openNewSeq(zoneId: string): void {
  seqForm.value = {
    id: uid(), name: '', zone_id: zoneId,
    steps: [emptyStep()],
    spark_blocks: { vannes: [], pompes: [], capteurs: [] },
  };
  isNewSeq.value = true;
  selectedSeqId.value = null;
  editMode.value = 'edit-seq';
}

function openEditSeq(seq: Sequence): void {
  seqForm.value = JSON.parse(JSON.stringify(seq));
  isNewSeq.value = false;
  editMode.value = 'edit-seq';
}

function saveSeq(): void {
  if (!seqForm.value.name) return;
  store.saveSequence({ ...seqForm.value });
  selectedSeqId.value = seqForm.value.id;
  editMode.value = 'none';
}

function cancelEdit(): void {
  editMode.value = 'none';
}

function deleteSeq(): void {
  if (!seqForm.value.id) return;
  store.deleteSequence(seqForm.value.id);
  selectedSeqId.value = null;
  editMode.value = 'none';
}

// ---- Step CRUD ----
function addStep(): void { seqForm.value.steps.push(emptyStep()); }
function removeStep(idx: number): void { seqForm.value.steps.splice(idx, 1); }

function addActuator(step: SequenceStep): void {
  if (!step.actuators) step.actuators = [];
  step.actuators.push({ block_id: '', block_type: 'pump', value: 0, apply_at_second: 0 });
}
function removeActuator(step: SequenceStep, idx: number): void {
  if (step.actuators) step.actuators.splice(idx, 1);
}

function moveStep(idx: number, dir: -1 | 1): void {
  const steps = seqForm.value.steps;
  const t = idx + dir;
  if (t < 0 || t >= steps.length) return;
  [steps[idx], steps[t]] = [steps[t], steps[idx]];
}

// ---- Spark blocks ----
function addSparkBlock(cat: keyof SparkBlocks): void {
  seqForm.value.spark_blocks[cat].push('');
}
function removeSparkBlock(cat: keyof SparkBlocks, idx: number): void {
  seqForm.value.spark_blocks[cat].splice(idx, 1);
}

// ---- Toggle folder ----
function toggleFolder(id: string): void {
  if (openFolders.value.has(id)) openFolders.value.delete(id);
  else openFolders.value.add(id);
}
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <div v-if="context.mode === 'Basic'" class="widget-body q-pa-sm">

      <!-- Header -->
      <div class="row justify-between items-center q-mb-sm">
        <div class="text-subtitle2 text-bold text-uppercase">
          {{ config.title || 'Éditeur de Séquences' }}
        </div>
        <div class="row q-gutter-xs">
          <q-btn flat dense icon="mdi-plus" label="Zone" color="blue-3" size="xs" @click="openNewZone" />
          <q-btn flat dense icon="mdi-plus" label="Séquence" color="positive" size="xs" :disable="store.allZones.length === 0" @click="openNewSeq(store.allZones[0]?.id ?? '')" />
        </div>
      </div>

      <!-- Zone editor -->
      <div
        v-if="editMode === 'new-zone'"
        class="q-pa-sm q-mb-sm rounded-borders"
        style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12)"
      >
        <div class="text-caption text-grey q-mb-sm">{{ editingZone ? 'Modifier la zone' : 'Nouvelle zone' }}</div>
        <div class="row q-col-gutter-sm q-mb-sm">
          <div class="col-8">
            <LabeledField label="Nom">
              <q-input v-model="zoneForm.name" dense borderless placeholder="ex: Mash Filter" />
            </LabeledField>
          </div>
          <div class="col-4">
            <LabeledField label="Couleur">
              <q-input v-model="zoneForm.color" dense borderless  />
            </LabeledField>
          </div>
        </div>
        <div class="row q-col-gutter-xs q-mb-sm">
          <div
            v-for="icon in ZONE_ICONS" :key="icon"
            class="col-auto cursor-pointer q-pa-xs rounded-borders text-center"
            :style="zoneForm.icon === icon ? 'background: rgba(255,255,255,0.15)' : ''"
            style="min-width: 32px; font-size: 16px"
            @click="zoneForm.icon = icon"
          >{{ icon }}</div>
        </div>
        <div class="row q-gutter-xs">
          <q-btn color="positive" label="Sauvegarder" size="sm" @click="saveZone" />
          <q-btn flat color="grey-6" label="Annuler" size="sm" @click="editMode = 'none'" />
          <q-btn v-if="editingZone" flat color="negative" icon="mdi-delete" size="sm" @click="deleteZone(editingZone.id); editMode = 'none'" />
        </div>
      </div>

      <!-- Folders -->
      <div v-if="editMode !== 'edit-seq'">
        <div v-if="store.allZones.length === 0" class="text-caption text-grey text-center q-py-md">
          Aucune zone — créez-en une avec le bouton "Zone"
        </div>

        <div v-for="zone in store.allZones" :key="zone.id" class="q-mb-sm">
          <div
            class="row items-center q-pa-xs rounded-borders cursor-pointer"
            style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1)"
            @click="toggleFolder(zone.id)"
          >
            <span style="font-size: 16px; margin-right: 6px">{{ zone.icon }}</span>
            <span class="text-body2 text-bold col" :style="{ color: zone.color }">{{ zone.name }}</span>
            <span class="text-caption text-grey q-mr-sm">{{ store.getSequencesByZone(zone.id).length }} séq.</span>
            <q-btn flat dense round icon="mdi-pencil-outline" size="xs" color="grey-6" @click.stop="openEditZone(zone)" />
            <q-btn flat dense round icon="mdi-plus" size="xs" color="positive" @click.stop="openNewSeq(zone.id)" />
            <q-icon :name="openFolders.has(zone.id) ? 'mdi-chevron-down' : 'mdi-chevron-right'" color="grey-6" size="18px" />
          </div>

          <div v-if="openFolders.has(zone.id)" class="row q-gutter-sm q-pl-sm q-pt-sm q-pb-xs flex-wrap">
            <div
              v-for="seq in store.getSequencesByZone(zone.id)" :key="seq.id"
              class="cursor-pointer rounded-borders q-pa-sm"
              style="width: 140px; border: 1px solid"
              :style="selectedSeqId === seq.id
                ? `background: rgba(30,100,200,0.2); border-color: ${zone.color}`
                : 'background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1)'"
              @click="selectedSeqId = seq.id"
            >
              <div class="text-body2 text-bold ellipsis">{{ seq.name }}</div>
              <div class="text-caption text-grey">{{ seq.steps.length }} étapes</div>
              <div class="text-caption text-grey">{{ seq.steps.reduce((a, s) => a + s.duration_minutes, 0) }} min</div>
              <q-btn flat dense icon="mdi-pencil-outline" size="xs" color="grey-5" class="q-mt-xs" @click.stop="openEditSeq(seq)" />
            </div>
            <div v-if="store.getSequencesByZone(zone.id).length === 0" class="text-caption text-grey q-pa-xs">Aucune séquence</div>
          </div>
        </div>
      </div>

      <!-- Sequence editor -->
      <div v-if="editMode === 'edit-seq'">
        <div class="row items-center q-mb-sm">
          <q-btn flat dense round icon="mdi-arrow-left" color="grey-4" @click="cancelEdit" />
          <span class="text-subtitle2 text-bold q-ml-xs">
            {{ isNewSeq ? 'Nouvelle séquence' : 'Modifier : ' + seqForm.name }}
          </span>
        </div>

        <!-- Nom + zone -->
        <div class="row q-col-gutter-sm q-mb-sm">
          <div class="col-8">
            <LabeledField label="Nom de la séquence">
              <q-input v-model="seqForm.name" dense borderless placeholder="ex: Single Infusion" />
            </LabeledField>
          </div>
          <div class="col-4">
            <LabeledField label="Zone">
              <q-select
                v-model="seqForm.zone_id"
                :options="store.allZones.map(z => ({ label: z.name, value: z.id }))"
                dense borderless emit-value map-options
              />
            </LabeledField>
          </div>
        </div>

        <!-- Steps -->
        <div class="text-caption text-grey q-mb-xs">ÉTAPES</div>
        <div v-for="(step, idx) in seqForm.steps" :key="idx" class="q-mb-xs">
          <div
            class="row items-center q-pa-xs rounded-borders q-gutter-xs"
            style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)"
          >
            <span class="text-caption text-grey" style="min-width:16px">{{ idx + 1 }}</span>
            <q-input v-model="step.name" dense borderless class="col" placeholder="Nom" style="min-width:80px" />
            <q-input v-model.number="step.duration_minutes" dense borderless type="number" style="width:52px" placeholder="min" />
            <q-input v-model.number="step.temperature" dense borderless type="number" style="width:48px" placeholder="°C" />
            <q-input v-model.number="step.pressure" dense borderless type="number" style="width:44px" placeholder="bar" />
            <q-input v-model.number="step.flow_rate" dense borderless type="number" style="width:48px" placeholder="L/m" />
            <q-input v-model.number="step.power" dense borderless type="number" style="width:44px" placeholder="%" />
            <q-btn flat dense round icon="mdi-chevron-up" size="xs" color="grey-6" :disable="idx === 0" @click="moveStep(idx, -1)" />
            <q-btn flat dense round icon="mdi-chevron-down" size="xs" color="grey-6" :disable="idx === seqForm.steps.length - 1" @click="moveStep(idx, 1)" />
            <q-btn flat dense round icon="mdi-close" size="xs" color="negative" @click="removeStep(idx)" />
          </div>
          
          <!-- Actuateurs du step -->
          <div v-if="step.actuators && step.actuators.length > 0" class="q-pl-sm q-pt-xs">
            <div v-for="(act, actIdx) in step.actuators" :key="actIdx" class="row items-center q-mb-xs q-pa-xs rounded-borders q-gutter-xs" style="background: rgba(255,255,255,0.02);">
              <q-select v-model="act.block_type" :options="['pump', 'valve', 'sensor']" dense borderless style="width: 70px" />
              <q-select v-model="act.block_id" :options="sparkBlockOpts.map(b => ({ label: b.label, value: b.value }))" dense borderless emit-value map-options class="col" placeholder="Bloc" />
              <q-input v-model.number="act.value" dense borderless type="number" style="width: 50px" placeholder="Val" />
              <q-input v-model.number="act.apply_at_second" dense borderless type="number" style="width: 50px" placeholder="sec" />
              <q-btn flat dense round icon="mdi-close" size="xs" color="negative" @click="removeActuator(step, actIdx)" />
            </div>
            <q-btn flat dense icon="mdi-plus" label="Actuateur" color="grey-5" size="xs" @click="addActuator(step)" />
          </div>
        </div>
        <q-btn flat dense icon="mdi-plus" label="Étape" color="blue-3" size="sm" class="q-mb-md" @click="addStep" />

        <!-- Blocs Spark -->
        <div class="text-caption text-grey q-mb-xs">BLOCS SPARK</div>
        <div
          v-if="sparkBlockOpts.length === 0"
          class="text-caption text-grey q-mb-sm"
          style="background: rgba(255,255,255,0.03); border-radius: 4px; padding: 6px 8px"
        >
          Aucun service Spark connecté — les blocs seront disponibles une fois connecté
        </div>

        <div class="row q-col-gutter-sm q-mb-sm">
          <div v-for="cat in (['vannes', 'pompes', 'capteurs'] as const)" :key="cat" class="col-4">
            <div class="text-caption text-grey text-uppercase q-mb-xs">{{ cat }}</div>
            <div v-for="(blockId, idx) in seqForm.spark_blocks[cat]" :key="idx" class="row items-center q-mb-xs">
              <q-select
                v-model="seqForm.spark_blocks[cat][idx]"
                :options="sparkBlockOpts"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                use-input
                fill-input
                hide-selected
                input-debounce="0"
                dense borderless
                class="col"
                style="background: rgba(255,255,255,0.05); border-radius: 4px; padding: 0 4px; min-width: 0"
                :placeholder="cat.slice(0, -1)"
              >
                <template #no-option="{ inputValue }">
                  <q-item>
                    <q-item-section class="text-grey text-caption">
                      {{ inputValue ? 'Aucun résultat' : 'Tapez pour chercher' }}
                    </q-item-section>
                  </q-item>
                </template>
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.caption }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <q-btn flat dense round icon="mdi-close" size="xs" color="negative" @click="removeSparkBlock(cat, idx)" />
            </div>
            <q-btn flat dense icon="mdi-plus" :label="cat.slice(0, -1)" color="grey-5" size="xs" @click="addSparkBlock(cat)" />
          </div>
        </div>

        <!-- Actions -->
        <div class="row q-gutter-xs q-mt-sm">
          <q-btn color="positive" icon="mdi-content-save" label="Sauvegarder" size="sm" @click="saveSeq" />
          <q-btn flat color="grey-6" label="Annuler" size="sm" @click="cancelEdit" />
          <q-btn v-if="!isNewSeq" flat color="negative" icon="mdi-delete" label="Supprimer" size="sm" @click="deleteSeq" />
        </div>
      </div>
    </div>

    <div v-if="context.mode === 'Full'" class="widget-body column q-pa-sm">
      <LabeledField label="Titre affiché">
        <q-input
          :model-value="config.title"
          dense borderless
          @update:model-value="(v) => patchConfig({ title: String(v) })"
        />
      </LabeledField>
    </div>
  </Card>
</template>
