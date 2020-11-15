import { createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter } from './memory.reducer';
import { State as RootState } from '..';
import { State as MemoryState, memoriesFeatureKey } from './memory.reducer';

export const selectFeature = createFeatureSelector<RootState, MemoryState>(memoriesFeatureKey);

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

export const selectIsLoading = createSelector(
  selectFeature,
  (state: MemoryState) => state.loading
);

export const selectIsInitialized = createSelector(
  selectFeature,
  (state: MemoryState) => state.initialized
);

export const selectError = createSelector(
  selectFeature,
  (state: MemoryState) => state.error
);

export const selectMemories = createSelector(
  selectFeature,
  selectAll
);
