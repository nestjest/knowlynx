import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@heroui/react';

type Props = {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

export function UnsavedChangesPrompt(props: Props) {
  const { isOpen, onSave, onDiscard, onCancel } = props;

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="prompt-backdrop"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-[40] bg-black/50"
            onClick={onCancel}
          />
          <motion.div
            key="prompt"
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-changes-title"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{ left: '50%', top: '50%', x: '-50%', y: '-50%' }}
            className="bordered-overlay shadow-panel bg-surface-overlay fixed z-[41] flex w-[min(420px,calc(100vw-32px))] flex-col gap-4 rounded-3xl p-6 [backdrop-filter:blur(22px)_saturate(135%)]"
          >
            <div>
              <h3
                id="unsaved-changes-title"
                className="m-0 mb-1.5 text-lg font-semibold text-white"
              >
                Сохранить изменения макета?
              </h3>
              <p className="m-0 text-[13px] text-white/72">
                Вы изменили расположение блоков, но не сохранили макет. Закрыть
                редактирование с сохранением изменений?
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2.5">
              <Button variant="ghost" className="text-white hover:bg-white/12" onPress={onCancel}>
                Отмена
              </Button>
              <Button variant="danger-soft" onPress={onDiscard}>
                Не сохранять
              </Button>
              <Button variant="primary" onPress={onSave}>
                Сохранить
              </Button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
