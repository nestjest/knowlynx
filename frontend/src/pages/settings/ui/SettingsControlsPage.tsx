import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DashboardEditorShell } from '../../../widgets/shell/ui/DashboardEditorShell';
import { settingsFormSections, settingsReadonlyNotes, type SettingsControl } from '../model/settingsFormSections';
import { settingsSections, settingsSectionsMap, type SettingsSectionId } from '../model/settingsSections';

function buildInitialState(sectionId: SettingsSectionId) {
  const controls = settingsFormSections[sectionId].flatMap((group) => group.controls);

  return controls.reduce<Record<string, string | boolean>>((accumulator, control) => {
    if (control.type === 'toggle') {
      accumulator[control.id] = control.value;
      return accumulator;
    }

    if (control.type === 'action') {
      return accumulator;
    }

    accumulator[control.id] = control.value;
    return accumulator;
  }, {});
}

export function SettingsControlsPage() {
  const { sectionId } = useParams<{ sectionId: SettingsSectionId }>();

  if (!sectionId || !(sectionId in settingsSectionsMap)) {
    return <Navigate to="/settings" replace />;
  }

  const section = settingsSectionsMap[sectionId];
  const groups = settingsFormSections[sectionId];
  const [values, setValues] = useState<Record<string, string | boolean>>(() => buildInitialState(sectionId));
  const Icon = section.icon;
  const relatedSections = useMemo(
    () => settingsSections.filter((item) => item.id !== section.id).slice(0, 3),
    [section.id]
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
          className={`settings-control__toggle ${currentValue ? 'settings-control__toggle--active' : ''}`}
          onClick={() => setValue(control.id, !currentValue)}
          aria-pressed={Boolean(currentValue)}
        >
          <span className="settings-control__toggle-thumb" />
        </button>
      );
    }

    if (control.type === 'select') {
      return (
        <label className="settings-control__select-wrap">
          <select
            className="settings-control__select"
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
        <div className="settings-control__segments">
          {control.options.map((option) => (
            <button
              key={option}
              type="button"
              className={`settings-control__segment ${currentValue === option ? 'settings-control__segment--active' : ''}`}
              onClick={() => setValue(control.id, option)}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    if (control.type === 'input') {
      return (
        <input
          className="settings-control__input"
          value={String(currentValue)}
          placeholder={control.placeholder}
          onChange={(event) => setValue(control.id, event.target.value)}
        />
      );
    }

    return (
      <button
        type="button"
        className={`settings-control__action ${control.tone === 'danger' ? 'settings-control__action--danger' : ''}`}
      >
        {control.actionLabel}
      </button>
    );
  };

  return (
    <DashboardEditorShell>
      <div className="settings settings--section">
        <div className="settings-page__hero">
          <div className="settings-page__hero-top">
            <Link to="/settings" className="settings-page__back">
              <ChevronLeft size={16} />
              Все настройки
            </Link>
            {section.badge ? <span className="settings__badge">{section.badge}</span> : null}
          </div>

          <div className="settings-page__hero-body">
            <div className="settings-page__hero-icon">
              <Icon size={28} />
            </div>
            <div className="settings-page__hero-copy">
              <p className="settings-page__eyebrow">Настройки раздела</p>
              <h1 className="settings-page__title">{section.title}</h1>
              <p className="settings-page__subtitle">{section.summary}</p>
            </div>
          </div>
        </div>

        <div className="settings-page__facts">
          {section.facts.map((fact) => (
            <article key={fact.label} className={`settings-page__fact settings-page__fact--${fact.tone ?? 'default'}`}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </article>
          ))}
        </div>

        <div className="settings-page__grid">
          <section className="settings-page__column">
            {groups.map((group) => (
              <article key={group.id} className="settings-page__panel">
                <div className="settings-page__panel-head">
                  <div>
                    <p className="settings-page__panel-eyebrow">Настройки</p>
                    <h2>{group.title}</h2>
                    {group.description ? <p>{group.description}</p> : null}
                  </div>
                </div>

                <div className="settings-control__list">
                  {group.controls.map((control) => (
                    <div key={control.id} className="settings-control">
                      <div className="settings-control__copy">
                        <strong>{control.label}</strong>
                        <span>{control.description}</span>
                      </div>
                      <div className="settings-control__value">{renderControl(control)}</div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <aside className="settings-page__column settings-page__column--aside">
            <article className="settings-page__panel settings-page__panel--soft">
              <div className="settings-page__panel-head">
                <div>
                  <p className="settings-page__panel-eyebrow">Системно</p>
                  <h2>Что задаётся платформой</h2>
                </div>
              </div>
              <ul className="settings-page__list settings-page__list--compact">
                {settingsReadonlyNotes[sectionId].map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </article>

            <article className="settings-page__related">
              <div>
                <p className="settings-page__eyebrow">Соседние разделы</p>
                <h2 className="settings-page__related-title">Другие настройки</h2>
              </div>

              <div className="settings-page__related-list">
                {relatedSections.map((item) => {
                  const RelatedIcon = item.icon;

                  return (
                    <Link key={item.id} to={`/settings/${item.id}`} className="settings-page__related-card">
                      <span className="settings-page__related-icon">
                        <RelatedIcon size={18} />
                      </span>
                      <span className="settings-page__related-copy">
                        <strong>{item.shortTitle}</strong>
                        <span>{item.summary}</span>
                      </span>
                      <ChevronRight size={16} className="settings__row-chevron" />
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
