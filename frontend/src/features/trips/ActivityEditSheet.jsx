import { useState, useEffect } from 'react';
import { ACTIVITY_TYPES } from '@pepetrip/shared';
import { BottomSheet, Button, Icon } from '../../components/ui';
import { useTranslation } from '../../i18n';

const EMPTY = {
  title: '',
  type: 'activity',
  startTime: '',
  endTime: '',
  description: '',
  costAmount: '',
};

export function ActivityEditSheet({ open, onClose, activity, currency, saving, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      activity
        ? {
            title: activity.title || '',
            type: activity.type || 'activity',
            startTime: activity.startTime || '',
            endTime: activity.endTime || '',
            description: activity.description || '',
            costAmount:
              activity.estimatedCost?.amount != null ? String(activity.estimatedCost.amount) : '',
          }
        : EMPTY,
    );
  }, [open, activity]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError(t('activity.titleRequired'));
      return;
    }
    const cost = Number(form.costAmount);
    onSave({
      title: form.title.trim(),
      type: form.type,
      description: form.description.trim() || undefined,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      estimatedCost:
        form.costAmount !== '' && !Number.isNaN(cost) ? { amount: cost, currency } : undefined,
    });
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={activity ? t('activity.editTitle') : t('activity.addTitle')}
    >
      <form className="stack" onSubmit={submit}>
        <div className="field">
          <label className="field__label" htmlFor="a-title">
            {t('activity.title')}
          </label>
          <input
            id="a-title"
            className="input"
            value={form.title}
            onChange={set('title')}
            placeholder={t('activity.titlePlaceholder')}
          />
          {error && <span className="field__error">{error}</span>}
        </div>
        <div className="field__row">
          <div className="field">
            <label className="field__label" htmlFor="a-type">
              {t('activity.type')}
            </label>
            <select id="a-type" className="select" value={form.type} onChange={set('type')}>
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`activityTypes.${type}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="a-cost">
              {t('activity.cost', { currency })}
            </label>
            <input
              id="a-cost"
              type="number"
              inputMode="decimal"
              min="0"
              className="input"
              value={form.costAmount}
              onChange={set('costAmount')}
              placeholder="0"
            />
          </div>
        </div>
        <div className="field__row">
          <div className="field">
            <label className="field__label" htmlFor="a-start">
              {t('activity.start')}
            </label>
            <input
              id="a-start"
              type="time"
              className="input"
              value={form.startTime}
              onChange={set('startTime')}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="a-end">
              {t('activity.end')}
            </label>
            <input
              id="a-end"
              type="time"
              className="input"
              value={form.endTime}
              onChange={set('endTime')}
            />
          </div>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="a-desc">
            {t('activity.notes')}
          </label>
          <textarea
            id="a-desc"
            className="textarea"
            value={form.description}
            onChange={set('description')}
            placeholder={t('activity.notesPlaceholder')}
          />
        </div>
        <Button type="submit" variant="primary" block loading={saving}>
          <Icon name="check" size={18} /> {t('common.save')}
        </Button>
      </form>
    </BottomSheet>
  );
}
