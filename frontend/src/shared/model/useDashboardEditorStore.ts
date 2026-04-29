import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createEditorPanel,
  defaultEditorPanels,
  getNextPanelSize,
  type DashboardEditorPanel,
  type DashboardEditorTemplateId,
} from '@/entities/panel/model/dashboardEditorData';
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
  theme: AppTheme;
  isEditMode: boolean;
  drawerMode: DashboardDrawerMode;
  drawerSearch: string;
  editingPanelId: string | null;
  editingQuickItemId: string | null;
  toggleTheme: () => void;
  toggleEditMode: () => void;
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
        set((state) => ({
          isEditMode: !state.isEditMode,
          drawerMode: state.isEditMode ? null : state.drawerMode,
          drawerSearch: '',
          editingPanelId: state.isEditMode ? null : state.editingPanelId,
          editingQuickItemId: state.isEditMode
            ? null
            : state.editingQuickItemId,
        })),
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
        set((state) => ({
          panels: [...state.panels, createEditorPanel(templateId)],
          drawerMode: null,
          drawerSearch: '',
          editingPanelId: null,
          editingQuickItemId: null,
        })),
      togglePanelVisibility: (panelId) =>
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === panelId
              ? { ...panel, isHidden: !panel.isHidden }
              : panel,
          ),
        })),
      cyclePanelSize: (panelId) =>
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === panelId
              ? {
                  ...panel,
                  size: getNextPanelSize(panel.size ?? 'medium'),
                }
              : panel,
          ),
        })),
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
          const draggedIndex = state.panels.findIndex(
            (panel) => panel.id === draggedId,
          );
          const targetIndex = state.panels.findIndex(
            (panel) => panel.id === targetId,
          );

          if (
            draggedIndex === -1 ||
            targetIndex === -1 ||
            draggedIndex === targetIndex
          ) {
            return state;
          }

          const nextPanels = [...state.panels];
          const [draggedPanel] = nextPanels.splice(draggedIndex, 1);
          nextPanels.splice(targetIndex, 0, draggedPanel);

          return {
            panels: nextPanels,
          };
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
