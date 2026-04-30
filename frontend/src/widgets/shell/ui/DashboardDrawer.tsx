import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@heroui/react';
import {
  BarChart3,
  Bell,
  Check,
  EyeOff,
  GraduationCap,
  Plus,
  Trophy,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  panelCategoryLabels,
  panelCategoryOrder,
  type DashboardEditorPanel,
  type DashboardEditorPanelCategory,
  type DashboardEditorPanelTemplate,
  type DashboardEditorTemplateId,
} from '@/entities/panel/model/dashboardEditorData';
import type {
  QuickAccessWidgetPreset,
  QuickAccessItem,
} from '@/entities/quick-access/model/quickAccessEditorData';

type DrawerMode = 'blocks' | 'widgets' | null;

type Props = {
  drawerMode: DrawerMode;
  drawerSearch: string;
  blockOptions: DashboardEditorPanelTemplate[];
  widgetOptions: QuickAccessWidgetPreset[];
  panels: DashboardEditorPanel[];
  editingQuickItemId: string | null;
  onClose: () => void;
  onClickOutside: () => void;
  onSearchChange: (value: string) => void;
  onAddPanel: (templateId: DashboardEditorTemplateId) => void;
  onTogglePanelVisibility: (panelId: string) => void;
  onAssignWidget: (
    quickItemId: string,
    widgetId: QuickAccessItem['widgetId'],
  ) => void;
};

const NEUTRAL_SECTION_TITLE =
  'mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/64';

const CATEGORY_STYLE: Record<
  DashboardEditorPanelCategory,
  { icon: LucideIcon; stripe: string; text: string }
> = {
  learning: {
    icon: GraduationCap,
    stripe: 'border-sky-500',
    text: 'text-sky-300',
  },
  metrics: {
    icon: BarChart3,
    stripe: 'border-emerald-500',
    text: 'text-emerald-300',
  },
  news: { icon: Bell, stripe: 'border-amber-500', text: 'text-amber-300' },
  achievements: {
    icon: Trophy,
    stripe: 'border-violet-500',
    text: 'text-violet-300',
  },
};

const CARD_BASE =
  'flex flex-col gap-1.5 rounded-2xl border border-white/12 bg-white/6 p-3.5 text-left text-white transition-colors duration-150 hover:bg-white/10 dark:border-white/8 dark:bg-white/4';

const CARD_DISABLED =
  'cursor-default opacity-60 hover:bg-white/6 dark:hover:bg-white/4';

const STATUS_BADGE =
  'inline-flex items-center gap-1 self-start rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.04em] uppercase';

export function DashboardDrawer(props: Props) {
  const {
    drawerMode,
    drawerSearch,
    blockOptions,
    widgetOptions,
    panels,
    editingQuickItemId,
    onClose,
    onClickOutside,
    onSearchChange,
    onAddPanel,
    onTogglePanelVisibility,
    onAssignWidget,
  } = props;

  const hiddenPanels = panels.filter((panel) => panel.isHidden);
  const onCanvasTemplateIds = new Set(
    panels
      .filter((panel) => !panel.isHidden)
      .map((panel) => panel.templateId),
  );

  return (
    <AnimatePresence>
      {drawerMode ? (
        <>
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(3px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed inset-0 z-28 bg-black/40"
            onClick={onClickOutside}
          />
          <motion.div
            key="drawer"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            style={{ left: '50%', x: '-50%' }}
            className="bordered-overlay shadow-panel bg-surface-overlay fixed bottom-24 z-29 mb-2.5 flex max-h-[72vh] w-[min(720px,calc(100vw-64px))] flex-col gap-3.5 rounded-t-3xl rounded-b-[18px] p-[18px] [backdrop-filter:blur(22px)_saturate(135%)] max-lg:bottom-[88px] max-lg:max-h-[74vh] max-lg:w-[min(100%,calc(100vw-32px))]"
          >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="m-0 mb-1 text-xl text-white">
                {drawerMode === 'blocks'
                  ? 'Каталог блоков'
                  : 'Выбрать виджет'}
              </h3>
              <p className="m-0 text-[13px] text-white/72">
                {drawerMode === 'blocks'
                  ? 'Добавляйте, скрывайте и возвращайте блоки на холст.'
                  : 'Список заглушек-виджетов для выбранного блока.'}
              </p>
            </div>
            <Button
              isIconOnly
              variant="ghost"
              className="text-white hover:bg-white/12"
              aria-label="Закрыть drawer"
              onPress={onClose}
            >
              <X size={16} />
            </Button>
          </div>

          <input
            className="h-11 w-full rounded-[14px] border border-white/14 bg-white/8 px-3.5 text-white placeholder:text-white/50 dark:border-white/10 dark:bg-white/6"
            type="search"
            placeholder={
              drawerMode === 'blocks' ? 'Поиск блока' : 'Поиск виджета'
            }
            value={drawerSearch}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.18)_transparent]">
            {drawerMode === 'blocks' ? (
              <BlockCatalog
                blockOptions={blockOptions}
                hiddenPanels={hiddenPanels}
                onCanvasTemplateIds={onCanvasTemplateIds}
                onAddPanel={onAddPanel}
                onTogglePanelVisibility={onTogglePanelVisibility}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
                {widgetOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={CARD_BASE}
                    onClick={() => {
                      if (editingQuickItemId) {
                        onAssignWidget(editingQuickItemId, item.id);
                      }
                    }}
                  >
                    <strong className="text-[15px]">{item.title}</strong>
                    <span className="text-xs text-white/68">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

type BlockCatalogProps = {
  blockOptions: DashboardEditorPanelTemplate[];
  hiddenPanels: DashboardEditorPanel[];
  onCanvasTemplateIds: Set<string>;
  onAddPanel: (templateId: DashboardEditorTemplateId) => void;
  onTogglePanelVisibility: (panelId: string) => void;
};

function BlockCatalog(props: BlockCatalogProps) {
  const {
    blockOptions,
    hiddenPanels,
    onCanvasTemplateIds,
    onAddPanel,
    onTogglePanelVisibility,
  } = props;

  return (
    <>
      {hiddenPanels.length > 0 ? (
        <section>
          <h4 className={NEUTRAL_SECTION_TITLE}>
            Скрытые блоки · {hiddenPanels.length}
          </h4>
          <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
            {hiddenPanels.map((panel) => (
              <button
                key={panel.id}
                type="button"
                className={CARD_BASE}
                onClick={() => onTogglePanelVisibility(panel.id)}
              >
                <span
                  className={`${STATUS_BADGE} bg-white/10 text-white/72`}
                >
                  <EyeOff size={11} />
                  Скрыт
                </span>
                <strong className="text-[13px] leading-tight">
                  {panel.title}
                </strong>
                <span className="text-[11px] text-white/56">
                  Вернуть на холст
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {panelCategoryOrder.map((category) => {
        const templates = blockOptions.filter(
          (item) => item.category === category,
        );
        if (templates.length === 0) {
          return null;
        }
        const allOnCanvas = templates.every((item) =>
          onCanvasTemplateIds.has(item.templateId),
        );
        const { icon: CategoryIcon, stripe, text } = CATEGORY_STYLE[category];
        return (
          <section key={category}>
            <header
              className={`mb-2.5 flex items-center gap-2.5 border-l-[3px] pl-3 ${stripe}`}
            >
              <CategoryIcon size={14} className={text} />
              <h4
                className={`m-0 text-[12px] font-bold tracking-[0.08em] uppercase ${text}`}
              >
                {panelCategoryLabels[category]}
              </h4>
            </header>
            {allOnCanvas ? (
              <p className="m-0 rounded-[12px] border border-white/8 bg-white/4 p-3 text-xs text-white/56">
                Все блоки этой группы уже на холсте.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
                {templates.map((item) => {
                  const isOnCanvas = onCanvasTemplateIds.has(item.templateId);
                  return (
                    <button
                      key={item.templateId}
                      type="button"
                      className={`${CARD_BASE} ${isOnCanvas ? CARD_DISABLED : ''}`}
                      disabled={isOnCanvas}
                      onClick={() => onAddPanel(item.templateId)}
                    >
                      <span
                        className={`${STATUS_BADGE} ${isOnCanvas ? 'bg-emerald-400/20 text-emerald-200' : 'bg-cyan-400/20 text-cyan-100'}`}
                      >
                        {isOnCanvas ? <Check size={11} /> : <Plus size={11} />}
                        {isOnCanvas ? 'На холсте' : 'Добавить'}
                      </span>
                      <strong className="text-[13px] leading-tight">
                        {item.title}
                      </strong>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
