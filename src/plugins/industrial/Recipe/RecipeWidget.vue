<script setup lang="ts">
import { computed, ref } from 'vue';
import { useContext, useWidget } from '@/composables';
import { eventbus } from '@/eventbus';
import { useIndustrialStore } from '../store';
import type { Recipe, RecipeStep, RecipeWidgetConfig } from './types';

const { context } = useContext.setup();
const { config, patchConfig } = useWidget.setup<RecipeWidgetConfig>();
const store = useIndustrialStore();

// ---- State ----
const selectedRecipeId = ref<string | null>(null);
const editMode = ref<'none' | 'edit'>('none');
const recipeForm = ref<Recipe>({ id: '', name: '', steps: [] });
const isNew = ref(false);

const selectedRecipe = computed<Recipe | null>(
  () => store.allRecipes.find((r) => r.id === selectedRecipeId.value) ?? null,
);

// ---- Helpers ----
function uid(): string { return Math.random().toString(36).slice(2, 9); }

function zoneLabel(zoneId: string): string {
  return store.allZones.find((z) => z.id === zoneId)?.name ?? zoneId;
}
function zoneIcon(zoneId: string): string {
  return store.allZones.find((z) => z.id === zoneId)?.icon ?? '⚙️';
}
function seqLabel(seqId: string): string {
  return store.allSequences.find((s) => s.id === seqId)?.name ?? seqId;
}
function seqsByZone(zoneId: string) {
  return store.getSequencesByZone(zoneId).map((s) => ({ label: s.name, value: s.id }));
}

// ---- Recipe CRUD ----
function openNew(): void {
  recipeForm.value = { id: uid(), name: '', steps: [] };
  isNew.value = true;
  editMode.value = 'edit';
}

function openEdit(recipe: Recipe): void {
  recipeForm.value = JSON.parse(JSON.stringify(recipe));
  isNew.value = false;
  editMode.value = 'edit';
}

function saveRecipe(): void {
  if (!recipeForm.value.name) return;
  store.saveRecipe({ ...recipeForm.value });
  selectedRecipeId.value = recipeForm.value.id;
  editMode.value = 'none';
}

function deleteRecipe(): void {
  store.deleteRecipe(recipeForm.value.id);
  selectedRecipeId.value = null;
  editMode.value = 'none';
}

// ---- Step CRUD ----
function addRecipeStep(): void {
  recipeForm.value.steps.push({
    id: uid(),
    zone_id: store.allZones[0]?.id ?? '',
    sequence_id: '',
    label: '',
  });
}

function removeRecipeStep(idx: number): void {
  recipeForm.value.steps.splice(idx, 1);
}

function moveRecipeStep(idx: number, dir: -1 | 1): void {
  const steps = recipeForm.value.steps;
  const t = idx + dir;
  if (t < 0 || t >= steps.length) return;
  [steps[idx], steps[t]] = [steps[t], steps[idx]];
}

// ---- Chargement recette ----
function loadRecipe(recipe: Recipe): void {
  // Publie chaque séquence sur sa zone
  recipe.steps.forEach((step) => {
    const seq = store.allSequences.find((s) => s.id === step.sequence_id);
    if (!seq) return;
    eventbus.publish('brewcast/cmd/phase/' + step.zone_id, {
      command: 'load_sequence',
      zone_id: step.zone_id,
      sequence: seq,
      timestamp: Date.now() / 1000,
    });
  });
}

// ---- Lancer recette (load + chainaison + start première) ----
function launchRecipe(recipe: Recipe): void {
  // 1. Charger les séquences
  recipe.steps.forEach((step) => {
    const seq = store.allSequences.find((s) => s.id === step.sequence_id);
    if (!seq) return;
    eventbus.publish('brewcast/cmd/phase/' + step.zone_id, {
      command: 'load_sequence',
      zone_id: step.zone_id,
      sequence: seq,
      timestamp: Date.now() / 1000,
    });
  });
  
  // 2. Configurer les next_zone_id pour chaîner les zones
  recipe.steps.forEach((step, idx) => {
    const nextZone = idx < recipe.steps.length - 1 ? recipe.steps[idx + 1].zone_id : null;
    eventbus.publish('brewcast/cmd/phase/' + step.zone_id, {
      command: 'set_next_zone_id',
      zone_id: step.zone_id,
      next_zone_id: nextZone,
      timestamp: Date.now() / 1000,
    });
  });
  
  // 3. Démarrer seulement la première zone (avec délai)
  setTimeout(() => {
    if (recipe.steps.length > 0) {
      const firstStep = recipe.steps[0];
      eventbus.publish('brewcast/cmd/phase/' + firstStep.zone_id, {
        command: 'start',
        zone_id: firstStep.zone_id,
        timestamp: Date.now() / 1000,
      });
    }
  }, 300);
}

const STATUS_COLOR: Record<string, string> = {
  IDLE: '#484f58', RUNNING: '#3fb950', HOLD: '#f5a623',
  TIMEHOLD: '#d2a8ff', COMPLETED: '#58a6ff', KILLED: '#ff7b72', ERROR: '#ff7b72',
};
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
          {{ config.title || 'Recettes' }}
        </div>
        <q-btn flat dense icon="mdi-plus" label="Recette" color="positive" size="xs" @click="openNew" />
      </div>

      <!-- Liste recettes -->
      <div v-if="editMode === 'none'">
        <div v-if="store.allRecipes.length === 0" class="text-caption text-grey text-center q-py-md">
          Aucune recette — créez-en une
        </div>

        <div v-for="recipe in store.allRecipes" :key="recipe.id" class="q-mb-sm">
          <div
            class="q-pa-sm rounded-borders"
            :style="selectedRecipeId === recipe.id
              ? 'background: rgba(30,100,200,0.15); border: 1px solid rgba(30,100,200,0.4)'
              : 'background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08)'"
          >
            <div class="row items-center q-mb-sm">
              <q-icon name="mdi-book-open-variant" color="orange-4" class="q-mr-xs" />
              <span class="text-body2 text-bold col">{{ recipe.name }}</span>
              <span class="text-caption text-grey q-mr-sm">{{ recipe.steps.length }} étapes</span>
              <q-btn flat dense round icon="mdi-pencil-outline" size="xs" color="grey-5" @click="openEdit(recipe)" />
              <q-btn
                flat dense round icon="mdi-play" size="xs" color="positive"
                :disable="recipe.steps.length === 0"
                @click="launchRecipe(recipe)"
              />
            </div>

            <!-- Workflow visuel -->
            <div class="row items-center flex-wrap q-gutter-xs">
              <template v-for="(step, idx) in recipe.steps" :key="step.id">
                <div
                  class="q-pa-xs rounded-borders text-center"
                  style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); min-width: 80px"
                >
                  <div style="font-size: 14px">{{ zoneIcon(step.zone_id) }}</div>
                  <div class="text-caption text-bold" style="color: #e6edf3; font-size: 10px">{{ zoneLabel(step.zone_id) }}</div>
                  <div class="text-caption text-grey" style="font-size: 9px">{{ seqLabel(step.sequence_id) || '—' }}</div>
                  <!-- Status live -->
                  <div
                    v-if="store.getPhaseControl(step.zone_id)"
                    class="text-caption text-bold q-mt-xs"
                    :style="{ color: STATUS_COLOR[store.getPhaseControl(step.zone_id)!.status] ?? '#888', fontSize: '9px' }"
                  >
                    {{ store.getPhaseControl(step.zone_id)!.status }}
                  </div>
                </div>
                <q-icon v-if="idx < recipe.steps.length - 1" name="mdi-arrow-right" color="grey-6" size="14px" />
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Recipe editor -->
      <div v-if="editMode === 'edit'">
        <div class="row items-center q-mb-sm">
          <q-btn flat dense round icon="mdi-arrow-left" color="grey-4" @click="editMode = 'none'" />
          <span class="text-subtitle2 text-bold q-ml-xs">
            {{ isNew ? 'Nouvelle recette' : 'Modifier : ' + recipeForm.name }}
          </span>
        </div>

        <LabeledField label="Nom de la recette" class="q-mb-sm">
          <q-input v-model="recipeForm.name" dense borderless placeholder="ex: Blonde 12°" />
        </LabeledField>

        <div class="text-caption text-grey q-mb-xs">WORKFLOW</div>

        <div v-for="(step, idx) in recipeForm.steps" :key="step.id" class="q-mb-xs">
          <div
            class="row items-center q-pa-xs rounded-borders q-gutter-xs"
            style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08)"
          >
            <span class="text-caption text-grey" style="min-width: 16px">{{ idx + 1 }}</span>
            <q-select
              v-model="step.zone_id"
              :options="store.allZones.map(z => ({ label: z.icon + ' ' + z.name, value: z.id }))"
              dense borderless emit-value map-options
              class="col"
              style="min-width: 100px"
            />
            <q-select
              v-model="step.sequence_id"
              :options="seqsByZone(step.zone_id)"
              dense borderless emit-value map-options
              class="col"
              style="min-width: 110px"
              placeholder="Séquence"
            />
            <q-btn flat dense round icon="mdi-chevron-up" size="xs" color="grey-6" :disable="idx === 0" @click="moveRecipeStep(idx, -1)" />
            <q-btn flat dense round icon="mdi-chevron-down" size="xs" color="grey-6" :disable="idx === recipeForm.steps.length - 1" @click="moveRecipeStep(idx, 1)" />
            <q-btn flat dense round icon="mdi-close" size="xs" color="negative" @click="removeRecipeStep(idx)" />
          </div>
        </div>

        <q-btn
          flat dense icon="mdi-plus" label="Ajouter une étape" color="blue-3" size="sm"
          class="q-mb-md"
          :disable="store.allZones.length === 0"
          @click="addRecipeStep"
        />

        <div class="row q-gutter-xs">
          <q-btn color="positive" icon="mdi-content-save" label="Sauvegarder" size="sm" @click="saveRecipe" />
          <q-btn flat color="grey-6" label="Annuler" size="sm" @click="editMode = 'none'" />
          <q-btn v-if="!isNew" flat color="negative" icon="mdi-delete" label="Supprimer" size="sm" @click="deleteRecipe" />
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
