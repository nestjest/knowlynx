import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createEditorPanel,
  defaultEditorPanels,
  getNextPanelSize,
  type DashboardEditorPanel,
  type DashboardEditorTemplateId,
} from '@/entities/panel/model/dashboardEditorData';

function cloneDefaultPanels(): DashboardEditorPanel[] {
  return defaultEditorPanels.map((panel) => ({ ...panel }));
}

function clonePanels(
  panels: DashboardEditorPanel[],
): DashboardEditorPanel[] {
  return panels.map((panel) => ({ ...panel }));
}
import {
  quickAccessItems,
  type QuickAccessItem,
  type QuickAccessWidgetPreset,
} from '@/entities/quick-access/model/quickAccessEditorData';

export type DashboardDrawerMode = 'blocks' | 'widgets' | null;
export type AppTheme = 'light' | 'dark';

type DashboardEditorState = {
  quickItems: QuickAccessItem[];
  panels: DashboardEditorPanel[];
  draftPanels: DashboardEditorPanel[] | null;
  theme: AppTheme;
  isEditMode: boolean;
  drawerMode: DashboardDrawerMode;
  drawerSearch: string;
  editingPanelId: string | null;
  editingQuickItemId: string | null;
  toggleTheme: () => void;
  toggleEditMode: () => void;
  commitLayout: () => void;
  cancelLayoutEdit: () => void;
  resetLayoutToDefault: () => void;
  openBlockDrawer: () => void;
  openWidgetDrawer: (quickItemId: string) => void;
  closeDrawer: () => void;
  setDrawerSearch: (value: string) => void;
  addPanel: (templateId: DashboardEditorTemplateId) => void;
  togglePanelVisibility: (panelId: string) => void;
  cyclePanelSize: (panelId: string) => void;
  assignWidget: (
    quickItemId: string,
    widgetId: QuickAccessWidgetPreset['id'],
  ) => void;
  movePanel: (draggedId: string, targetId: string) => void;
};

export const useDashboardEditorStore = create<DashboardEditorState>()(
  persist(
    (set) => ({
      quickItems: quickAccessItems,
      panels: defaultEditorPanels,
      draftPanels: null,
      theme: 'light',
      isEditMode: false,
      drawerMode: null,
      drawerSearch: '',
      editingPanelId: null,
      editingQuickItemId: null,
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      toggleEditMode: () =>
        set((state) => {
          if (state.isEditMode) {
            return {
              isEditMode: false,
              draftPanels: null,
              drawerMode: null,
              drawerSearch: '',
              editingPanelId: null,
              editingQuickItemId: null,
            };
          }
          return {
            isEditMode: true,
            draftPanels: clonePanels(state.panels),
          };
        }),
      commitLayout: () =>
        set((state) => ({
          panels: state.draftPanels ?? state.panels,
          draftPanels: null,
          isEditMode: false,
          drawerMode: null,
          drawerSearch: '',
          editingPanelId: null,
          editingQuickItemId: null,
        })),
      cancelLayoutEdit: () =>
        set({
          draftPanels: null,
          isEditMode: false,
          drawerMode: null,
          drawerSearch: '',
          editingPanelId: null,
          editingQuickItemId: null,
        }),
      resetLayoutToDefault: () =>
        set({ draftPanels: cloneDefaultPanels() }),
      openBlockDrawer: () =>
        set({
          drawerMode: 'blocks',
          drawerSearch: '',
          editingPanelId: null,
          editingQuickItemId: null,
        }),
      openWidgetDrawer: (quickItemId) =>
        set({
          drawerMode: 'widgets',
          drawerSearch: '',
          editingPanelId: null,
          editingQuickItemId: quickItemId,
        }),
      closeDrawer: () =>
        set({
          drawerMode: null,
          drawerSearch: '',
          editingPanelId: null,
          editingQuickItemId: null,
        }),
      setDrawerSearch: (value) => set({ drawerSearch: value }),
      addPanel: (templateId) =>
        set((state) => {
          const sourcePanels = state.draftPanels ?? state.panels;
          const nextPanels = [...sourcePanels, createEditorPanel(templateId)];
          return state.draftPanels !== null
            ? {
                draftPanels: nextPanels,
                drawerMode: null,
                drawerSearch: '',
                editingPanelId: null,
                editingQuickItemId: null,
              }
            : {
                panels: nextPanels,
                drawerMode: null,
                drawerSearch: '',
                editingPanelId: null,
                editingQuickItemId: null,
              };
        }),
      togglePanelVisibility: (panelId) =>
        set((state) => {
          const sourcePanels = state.draftPanels ?? state.panels;
          const nextPanels = sourcePanels.map((panel) =>
            panel.id === panelId
              ? { ...panel, isHidden: !panel.isHidden }
              : panel,
          );
          return state.draftPanels !== null
            ? { draftPanels: nextPanels }
            : { panels: nextPanels };
        }),
      cyclePanelSize: (panelId) =>
        set((state) => {
          const sourcePanels = state.draftPanels ?? state.panels;
          const nextPanels = sourcePanels.map((panel) =>
            panel.id === panelId
              ? { ...panel, size: getNextPanelSize(panel.size ?? 'medium') }
              : panel,
          );
          return state.draftPanels !== null
            ? { draftPanels: nextPanels }
            : { panels: nextPanels };
        }),
      assignWidget: (quickItemId, widgetId) =>
        set((state) => ({
          quickItems: state.quickItems.map((item) =>
            item.id === quickItemId
              ? {
                  ...item,
                  widgetId,
                }
              : item,
          ),
          drawerMode: null,
          drawerSearch: '',
          editingPanelId: null,
          editingQuickItemId: null,
        })),
      movePanel: (draggedId, targetId) =>
        set((state) => {
          const sourcePanels = state.draftPanels ?? state.panels;
          const draggedIndex = sourcePanels.findIndex(
            (panel) => panel.id === draggedId,
          );
          const targetIndex = sourcePanels.findIndex(
            (panel) => panel.id === targetId,
          );

          if (
            draggedIndex === -1 ||
            targetIndex === -1 ||
            draggedIndex === targetIndex
          ) {
            return state;
          }

          const nextPanels = [...sourcePanels];
          const [draggedPanel] = nextPanels.splice(draggedIndex, 1);
          nextPanels.splice(targetIndex, 0, draggedPanel);

          return state.draftPanels !== null
            ? { draftPanels: nextPanels }
            : { panels: nextPanels };
        }),
    }),
    {
      name: 'knowlynx-dashboard-editor',
      partialize: (state) => ({
        theme: state.theme,
        quickItems: state.quickItems,
        panels: state.panels,
      }),
    },
  ),
);
