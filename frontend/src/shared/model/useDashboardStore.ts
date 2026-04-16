import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  createDashboardPanel,
  defaultEditablePanels,
  type DashboardTemplateId,
  type EditableDashboardPanel,
  type WidgetPresetId
} from '../../entities/panel/model/dashboardPanelData';

export type DrawerMode = 'blocks' | 'widgets' | null;

type DashboardState = {
  panels: EditableDashboardPanel[];
  isEditMode: boolean;
  drawerMode: DrawerMode;
  drawerSearch: string;
  editingPanelId: string | null;
  toggleEditMode: () => void;
  openBlockDrawer: () => void;
  openWidgetDrawer: (panelId: string) => void;
  closeDrawer: () => void;
  setDrawerSearch: (value: string) => void;
  addPanel: (templateId: DashboardTemplateId) => void;
  assignWidget: (panelId: string, widgetId: WidgetPresetId) => void;
  movePanel: (draggedId: string, targetId: string) => void;
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      panels: defaultEditablePanels,
      isEditMode: false,
      drawerMode: null,
      drawerSearch: '',
      editingPanelId: null,
      toggleEditMode: () =>
        set((state) => ({
          isEditMode: !state.isEditMode,
          drawerMode: state.isEditMode ? null : state.drawerMode,
          drawerSearch: '',
          editingPanelId: state.isEditMode ? null : state.editingPanelId
        })),
      openBlockDrawer: () =>
        set({
          drawerMode: 'blocks',
          drawerSearch: '',
          editingPanelId: null
        }),
      openWidgetDrawer: (panelId) =>
        set({
          drawerMode: 'widgets',
          drawerSearch: '',
          editingPanelId: panelId
        }),
      closeDrawer: () =>
        set({
          drawerMode: null,
          drawerSearch: '',
          editingPanelId: null
        }),
      setDrawerSearch: (value) => set({ drawerSearch: value }),
      addPanel: (templateId) =>
        set((state) => ({
          panels: [...state.panels, createDashboardPanel(templateId)],
          drawerMode: null,
          drawerSearch: '',
          editingPanelId: null
        })),
      assignWidget: (panelId, widgetId) =>
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === panelId
              ? {
                  ...panel,
                  widgetId
                }
              : panel
          ),
          drawerMode: null,
          drawerSearch: '',
          editingPanelId: null
        })),
      movePanel: (draggedId, targetId) =>
        set((state) => {
          const draggedIndex = state.panels.findIndex((panel) => panel.id === draggedId);
          const targetIndex = state.panels.findIndex((panel) => panel.id === targetId);

          if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
            return state;
          }

          const nextPanels = [...state.panels];
          const [draggedPanel] = nextPanels.splice(draggedIndex, 1);
          nextPanels.splice(targetIndex, 0, draggedPanel);

          return {
            panels: nextPanels
          };
        })
    }),
    {
      name: 'knowlynx-dashboard-editor',
      partialize: (state) => ({
        panels: state.panels
      })
    }
  )
);
