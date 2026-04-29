import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { X } from 'lucide-react';
import type {
  DashboardEditorPanelTemplate,
  DashboardEditorTemplateId,
} from '@/entities/panel/model/dashboardEditorData';
import type {
  QuickAccessWidgetPreset,
  QuickAccessItem,
} from '@/entities/quick-access/model/quickAccessEditorData';

type DrawerMode = 'blocks' | 'widgets' | null;

type DrawerPreview = {
  id: string;
  title: string;
  description: string;
  mode: 'blocks' | 'widgets';
};

type Props = {
  drawerMode: DrawerMode;
  drawerSearch: string;
  blockOptions: DashboardEditorPanelTemplate[];
  widgetOptions: QuickAccessWidgetPreset[];
  editingQuickItemId: string | null;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onAddPanel: (templateId: DashboardEditorTemplateId) => void;
  onAssignWidget: (
    quickItemId: string,
    widgetId: QuickAccessItem['widgetId'],
  ) => void;
};

const PREVIEW_BOX =
  'h-[34px] rounded-xl border border-border-muted bg-white/92';

const PREVIEW_LINE = 'h-2.5 rounded-full bg-[rgba(75,98,116,0.18)]';

function renderDrawerPreview(preview: DrawerPreview) {
  if (preview.mode === 'widgets') {
    return (
      <div className="flex flex-col gap-2">
        <span className="h-5 w-[72px] rounded-full bg-[rgba(155,232,247,0.38)]" />
        <span className={`${PREVIEW_LINE} w-[88%]`} />
        <span className={`${PREVIEW_LINE} w-[72%]`} />
      </div>
    );
  }

  switch (preview.id) {
    case 'notifications':
      return (
        <div className="flex flex-col gap-2">
          <span className="h-5 w-[72px] rounded-full bg-[rgba(155,232,247,0.38)]" />
          <span className={`${PREVIEW_LINE} w-[88%]`} />
          <span className={PREVIEW_BOX} />
          <span className={PREVIEW_BOX} />
        </div>
      );
    case 'progress':
      return (
        <div className="flex flex-col gap-2">
          <span className="h-5 w-[72px] rounded-full bg-[rgba(155,232,247,0.38)]" />
          <span className={`${PREVIEW_LINE} w-[88%]`} />
          <span className="h-3 rounded-full bg-[linear-gradient(90deg,#9be8f7_0%,#67cfe6_66%,rgba(218,229,239,0.8)_66%,rgba(218,229,239,0.8)_100%)]" />
          <div className="flex justify-between gap-2.5">
            <span className={`${PREVIEW_LINE} w-[42%]`} />
            <span className={`${PREVIEW_LINE} w-[42%]`} />
          </div>
        </div>
      );
    case 'performance':
      return (
        <div className="grid grid-cols-2 gap-2">
          <span className="border-border-muted h-[54px] rounded-xl border bg-white/92" />
          <span className="border-border-muted h-[54px] rounded-xl border bg-white/92" />
          <span className="border-border-muted h-[54px] rounded-xl border bg-white/92" />
          <span className="border-border-muted h-[54px] rounded-xl border bg-white/92" />
        </div>
      );
    case 'deadlines':
      return (
        <div className="flex flex-col gap-2">
          <span className="border-border-muted h-[42px] rounded-xl border bg-white/92" />
          <span className="border-border-muted h-[42px] rounded-xl border bg-white/92" />
          <span className="border-border-muted h-[42px] rounded-xl border bg-white/92" />
        </div>
      );
    case 'activity':
      return (
        <div className="grid grid-cols-2 gap-2">
          <span className="border-border-muted h-[54px] rounded-xl border bg-white/92" />
          <span className="border-border-muted h-[54px] rounded-xl border bg-white/92" />
          <span className="border-border-muted h-[54px] rounded-xl border bg-white/92" />
        </div>
      );
    case 'recommendations':
      return (
        <div className="flex flex-wrap gap-2">
          <span className="border-border-muted h-[30px] w-[120px] rounded-full border bg-white/92" />
          <span className="border-border-muted h-[30px] w-[120px] rounded-full border bg-white/92" />
          <span className="border-border-muted h-[30px] w-[92px] rounded-full border bg-white/92" />
        </div>
      );
    default:
      return (
        <div className="flex flex-col gap-2">
          <span className={`${PREVIEW_LINE} w-[88%]`} />
          <span className={PREVIEW_BOX} />
          <span className={PREVIEW_BOX} />
        </div>
      );
  }
}

export function DashboardDrawer(props: Props) {
  const {
    drawerMode,
    drawerSearch,
    blockOptions,
    widgetOptions,
    editingQuickItemId,
    onClose,
    onSearchChange,
    onAddPanel,
    onAssignWidget,
  } = props;
  const [hoveredPreview, setHoveredPreview] = useState<DrawerPreview | null>(
    null,
  );

  return (
    <AnimatePresence>
      {drawerMode ? (
        <motion.div
          key="drawer"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          style={{ left: '50%', x: '-50%' }}
          className="bordered-overlay shadow-panel bg-surface-overlay fixed bottom-24 z-[29] mb-2.5 flex max-h-[72vh] w-[min(960px,calc(100vw-64px))] flex-col gap-3.5 rounded-t-3xl rounded-b-[18px] p-[18px] [backdrop-filter:blur(22px)_saturate(135%)] max-lg:bottom-[88px] max-lg:max-h-[74vh] max-lg:w-[min(100%,calc(100vw-32px))]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="m-0 mb-1 text-xl text-white">
                {drawerMode === 'blocks'
                  ? 'Добавить новый блок'
                  : 'Выбрать виджет'}
              </h3>
              <p className="m-0 text-[13px] text-white/72">
                {drawerMode === 'blocks'
                  ? 'Список доступных блоков для текущего макета дашборда.'
                  : 'Список заглушек-виджетов для выбранного блока.'}
              </p>
            </div>
            <Button
              isIconOnly
              variant="ghost"
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

          <div className="grid min-h-0 grid-cols-[minmax(0,1.4fr)_260px] items-start gap-4 max-lg:grid-cols-1">
            <div className="grid min-h-0 grid-cols-2 gap-3">
              {drawerMode === 'blocks'
                ? blockOptions.map((item) => (
                    <button
                      key={item.templateId}
                      type="button"
                      className="rounded-2xl border border-white/12 bg-white/6 p-3.5 text-left text-white dark:border-white/8 dark:bg-white/4"
                      onMouseEnter={() =>
                        setHoveredPreview({
                          id: item.templateId,
                          title: item.title,
                          description:
                            'Блок можно добавить в макет, затем менять размер и положение.',
                          mode: 'blocks',
                        })
                      }
                      onMouseLeave={() => setHoveredPreview(null)}
                      onClick={() => onAddPanel(item.templateId)}
                    >
                      <strong className="mb-1.5 block text-[15px]">
                        {item.title}
                      </strong>
                      <span className="text-xs text-white/68">
                        Добавить блок в текущий макет
                      </span>
                    </button>
                  ))
                : widgetOptions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="rounded-2xl border border-white/12 bg-white/6 p-3.5 text-left text-white dark:border-white/8 dark:bg-white/4"
                      onMouseEnter={() =>
                        setHoveredPreview({
                          id: item.id,
                          title: item.title,
                          description: item.description,
                          mode: 'widgets',
                        })
                      }
                      onMouseLeave={() => setHoveredPreview(null)}
                      onClick={() => {
                        if (editingQuickItemId) {
                          onAssignWidget(editingQuickItemId, item.id);
                        }
                      }}
                    >
                      <strong className="mb-1.5 block text-[15px]">
                        {item.title}
                      </strong>
                      <span className="text-xs text-white/68">
                        {item.description}
                      </span>
                    </button>
                  ))}
            </div>

            <aside
              className={`self-start rounded-[18px] border border-white/10 bg-white/5 p-4 transition-[opacity,transform] duration-[180ms] max-lg:hidden dark:border-white/8 dark:bg-white/4 ${hoveredPreview ? '-translate-y-0.5 opacity-100' : 'opacity-[0.88]'}`}
            >
              {hoveredPreview ? (
                <>
                  <div
                    className={`mb-3 flex flex-col gap-2.5 rounded-[18px] bg-[rgba(244,249,253,0.98)] p-3 ${hoveredPreview.mode === 'blocks' ? 'min-h-[210px]' : 'min-h-[120px]'}`}
                  >
                    <div className="h-4 w-3/5 rounded-full bg-[rgba(31,79,90,0.14)]" />
                    {renderDrawerPreview(hoveredPreview)}
                  </div>
                  <strong className="mb-1.5 block text-[15px] text-white">
                    {hoveredPreview.title}
                  </strong>
                  <p className="m-0 text-xs leading-[1.45] text-white/74">
                    {hoveredPreview.description}
                  </p>
                </>
              ) : (
                <>
                  <strong className="mb-1.5 block text-[15px] text-white">
                    Предпросмотр
                  </strong>
                  <p className="m-0 text-xs leading-[1.45] text-white/74">
                    Наведи на элемент в списке, чтобы увидеть его внешний вид и
                    краткое описание.
                  </p>
                </>
              )}
            </aside>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
