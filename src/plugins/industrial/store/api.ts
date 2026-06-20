import { createApi } from '@/database/api';
import type { ProcessZone, Sequence, Recipe } from '../Sequence/types';

export const zoneApi = createApi<ProcessZone & { id: string }>({
  namespace: 'industrial-zones',
});

export const sequenceApi = createApi<Sequence & { id: string }>({
  namespace: 'industrial-sequences',
});

export const recipeApi = createApi<Recipe & { id: string }>({
  namespace: 'industrial-recipes',
});
