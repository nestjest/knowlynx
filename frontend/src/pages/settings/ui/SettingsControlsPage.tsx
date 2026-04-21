import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DashboardEditorShell } from '../../../widgets/shell/ui/DashboardEditorShell';
import {
  settingsFormSections,
  settingsReadonlyNotes,
  type SettingsControl,
} from '../model/settingsFormSections';
import {
  settingsSections,
  settingsSectionsMap,
  type SettingsSectionId,
} from '../model/settingsSections';

const PANEL_BASE =
  'rounded-3xl border border-[rgba(219,229,238,0.95)] bg-(--panel-bg) p-[22px] shadow-card';

const EYEBROW =
  'm-0 mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted';

const CONTROL_INPUT =
  'min-w-[190px] rounded-[14px] border border-border-strong bg-surface-raised px-3.5 py-[11px] text-text-primary dark:border-[rgba(57,78,95,0.9)] dark:bg-[rgba(18,28,36,0.95)] dark:text-[#e4eef6]';

const SEGMENT_BASE =
  'rounded-full border border-border-strong bg-surface-raised px-3.5 py-2.5 text-text-primary hover:border-accent-soft-border hover:bg-accent-soft-bg hover:text-accent-soft-text dark:text-[#dbe8f2]';

function buildInitialState(sectionId: SettingsSectionId) {
  const controls = settingsFormSections[sectionId].flatMap(
    (group) => group.controls,
  );

  return controls.reduce<Record<string, string | boolean>>(
    (accumulator, control) => {
      if (control.type === 'toggle') {
        accumulator[control.id] = control.value;
        return accumulator;
      }

      if (control.type === 'action') {
        return accumulator;
      }

      accumulator[control.id] = control.value;
      return accumulator;
    },
    {},
  );
}

export function SettingsControlsPage() {
  const { sectionId } = useParams<{ sectionId: SettingsSectionId }>();

  if (!sectionId || !(sectionId in settingsSectionsMap)) {
    return <Navigate to="/settings" replace />;
  }

  const section = settingsSectionsMap[sectionId];
  const groups = settingsFormSections[sectionId];
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    buildInitialState(sectionId),
  );
  const Icon = section.icon;
  const relatedSections = useMemo(
    () => settingsSections.filter((item) => item.id !== section.id).slice(0, 3),
    [section.id],
  );

  const setValue = (id: string, value: string | boolean) => {
    setValues((current) => ({ ...current, [id]: value }));
  };

  const renderControl = (control: SettingsControl) => {
    const currentValue = values[control.id];

    if (control.type === 'toggle') {
      return (
        <button
          type="button"
          className={`relative h-[30px] w-[52px] rounded-full border-0 p-0 ${currentValue ? 'bg-[#5dc7de] dark:bg-[#1d7f95]' : 'bg-[rgba(180,195,210,0.42)] dark:bg-[rgba(60,80,95,0.5)]'}`}
          onClick={() => setValue(control.id, !currentValue)}
          aria-pressed={Boolean(currentValue)}
        >
          <span
            className={`absolute top-[3px] left-[3px] size-6 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.16)] transition-transform duration-200 ${currentValue ? 'translate-x-[22px]' : ''}`}
          />
        </button>
      );
    }

    if (control.type === 'select') {
      return (
        <label>
          <select
            className={CONTROL_INPUT}
            value={String(currentValue)}
            onChange={(event) => setValue(control.id, event.target.value)}
          >
            {control.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (control.type === 'segmented') {
      return (
        <div className="flex max-w-[320px] flex-wrap items-center justify-end gap-2">
          {control.options.map((option) => {
            const active = currentValue === option;
            return (
              <button
                key={option}
                type="button"
                className={`${SEGMENT_BASE} ${active ? 'border-accent-soft-border bg-accent-soft-bg text-accent-soft-text' : ''}`}
                onClick={() => setValue(control.id, option)}
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    if (control.type === 'input') {
      return (
        <input
          className={`${CONTROL_INPUT} min-w-[260px]`}
          value={String(currentValue)}
          placeholder={control.placeholder}
          onChange={(event) => setValue(control.id, event.target.value)}
        />
      );
    }

    return (
      <button
        type="button"
        className={`${SEGMENT_BASE} font-semibold ${control.tone === 'danger' ? 'border-danger-border bg-danger-bg text-danger-text' : ''}`}
      >
        {control.actionLabel}
      </button>
    );
  };

  return (
    <DashboardEditorShell>
      <div className="mx-auto flex max-w-[1100px] flex-col gap-4 px-0 py-2">
        <div className="shadow-card rounded-3xl border border-[rgba(219,229,238,0.95)] bg-[radial-gradient(circle_at_top_right,rgba(155,232,247,0.22),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.82)_0%,rgba(247,250,253,0.94)_100%)] p-6 max-sm:rounded-[18px] dark:bg-[radial-gradient(circle_at_top_right,rgba(43,94,111,0.35),transparent_30%),rgba(18,26,34,0.94)]">
          <div className="mb-[18px] flex items-start justify-between gap-4">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(219,229,238,0.9)] bg-white/72 px-3 py-2 text-[#47606f] dark:text-[#b6c7d5]"
            >
              <ChevronLeft size={16} />
              Все настройки
            </Link>
            {section.badge ? (
              <span className="inline-flex rounded-md bg-[rgba(155,232,247,0.25)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-[#1e4b57] uppercase dark:text-[#97e5f5]">
                {section.badge}
              </span>
            ) : null}
          </div>

          <div className="flex items-start gap-[18px]">
            <div className="grid size-16 flex-shrink-0 place-items-center rounded-[20px] bg-gradient-to-br from-[#9be8f7] to-[#5dc7de] text-white dark:from-[#235165] dark:to-[#1d7f95]">
              <Icon size={28} />
            </div>
            <div className="min-w-0">
              <p className={EYEBROW}>Настройки раздела</p>
              <h1 className="text-text-primary m-0 text-[32px] leading-[1.1]">
                {section.title}
              </h1>
              <p className="text-text-muted m-0 mt-2.5 text-sm leading-[1.5]">
                {section.summary}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {section.facts.map((fact) => (
            <article
              key={fact.label}
              className={`shadow-card rounded-[18px] border border-[rgba(219,229,238,0.95)] p-4 ${fact.tone === 'accent' ? 'bg-gradient-to-b from-[rgba(155,232,247,0.2)] to-white/88' : 'bg-white/78'}`}
            >
              <span className="mb-2 block text-xs text-[#7b8b98] dark:text-[#9eb1c2]">
                {fact.label}
              </span>
              <strong
                className={`text-text-primary ${fact.tone === 'muted' ? 'text-base' : 'text-lg'}`}
              >
                {fact.value}
              </strong>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] gap-[18px] max-lg:grid-cols-1">
          <section className="flex flex-col gap-[18px]">
            {groups.map((group) => (
              <article key={group.id} className={PANEL_BASE}>
                <div className="mb-[18px] flex items-start justify-between gap-4">
                  <div>
                    <p className={EYEBROW}>Настройки</p>
                    <h2 className="text-text-primary m-0">{group.title}</h2>
                    {group.description ? (
                      <p className="text-text-muted m-0 mt-2.5 text-sm leading-[1.5]">
                        {group.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col">
                  {group.controls.map((control, idx) => (
                    <div
                      key={control.id}
                      className={`flex items-center justify-between gap-[18px] py-4 max-lg:flex-col max-lg:items-start ${idx === 0 ? '' : 'border-t border-[rgba(219,229,238,0.78)] dark:border-[rgba(42,60,74,0.78)]'}`}
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <strong className="text-text-primary text-[15px] font-semibold">
                          {control.label}
                        </strong>
                        <span className="text-[13px] leading-[1.45] text-[#778894] dark:text-[#9eb1c2]">
                          {control.description}
                        </span>
                      </div>
                      <div className="flex flex-shrink-0 items-center justify-end">
                        {renderControl(control)}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <aside className="flex flex-col gap-[18px]">
            <article
              className={`${PANEL_BASE} bg-[linear-gradient(180deg,rgba(155,232,247,0.08)_0%,transparent_40%),var(--panel-bg)]`}
            >
              <div className="mb-[18px]">
                <p className={EYEBROW}>Системно</p>
                <h2 className="text-text-primary m-0">
                  Что задаётся платформой
                </h2>
              </div>
              <ul className="m-0 flex flex-col gap-2.5 pl-5 text-[#34424e] marker:text-[#5dc7de] dark:text-[#9eb1c2]">
                {settingsReadonlyNotes[sectionId].map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>

            <article className={PANEL_BASE}>
              <div>
                <p className={EYEBROW}>Соседние разделы</p>
                <h2 className="text-text-primary m-0">Другие настройки</h2>
              </div>

              <div className="mt-[18px] grid grid-cols-1 gap-3.5">
                {relatedSections.map((item) => {
                  const RelatedIcon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      to={`/settings/${item.id}`}
                      className="flex w-full items-center gap-3.5 rounded-[18px] border border-[rgba(219,229,238,0.95)] bg-white/72 p-4 text-inherit"
                    >
                      <span className="grid size-[38px] flex-shrink-0 place-items-center rounded-xl bg-[rgba(155,232,247,0.14)] text-[#38a8c0]">
                        <RelatedIcon size={18} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <strong className="text-text-primary">
                          {item.shortTitle}
                        </strong>
                        <span className="text-xs text-[#7b8b98] dark:text-[#9eb1c2]">
                          {item.summary}
                        </span>
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-text-muted flex-shrink-0 opacity-60"
                      />
                    </Link>
                  );
                })}
              </div>
            </article>
          </aside>
        </div>
      </div>
    </DashboardEditorShell>
  );
}
