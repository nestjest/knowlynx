import { useDashboardEditorStore } from '@/shared/model/useDashboardEditorStore';

export function useHasUnsavedLayout() {
  return useDashboardEditorStore(
    (state) =>
      state.draftPanels !== null &&
      JSON.stringify(state.draftPanels) !== JSON.stringify(state.panels),
  );
}
