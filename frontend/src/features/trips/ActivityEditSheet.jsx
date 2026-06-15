import { useState, useEffect } from 'react';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS } from '@pepetrip/shared';
import { BottomSheet, Button, Icon } from '../../components/ui';

const EMPTY = {
  title: '',
  type: 'activity',
  startTime: '',
  endTime: '',
  description: '',
  costAmount: '',
};

export function ActivityEditSheet({ open, onClose, activity, currency, saving, onSave }) {
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
      setError('Title is required');
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
    <BottomSheet open={open} onClose={onClose} title={activity ? 'Edit activity' : 'Add activity'}>
      <form className="stack" onSubmit={submit}>
        <div className="field">
          <label className="field__label" htmlFor="a-title">
            Title
          </label>
          <input
            id="a-title"
            className="input"
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Fushimi Inari Shrine"
          />
          {error && <span className="field__error">{error}</span>}
        </div>
        <div className="field__row">
          <div className="field">
            <label className="field__label" htmlFor="a-type">
              Type
            </label>
            <select id="a-type" className="select" value={form.type} onChange={set('type')}>
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ACTIVITY_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="a-cost">
              Cost ({currency})
            </label>
            <input
              id="a-cost"
              type="number"
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
              Start
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
              End
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
            Notes
          </label>
          <textarea
            id="a-desc"
            className="textarea"
            value={form.description}
            onChange={set('description')}
            placeholder="Optional details"
          />
        </div>
        <Button type="submit" variant="primary" block loading={saving}>
          <Icon name="check" size={18} /> Save
        </Button>
      </form>
    </BottomSheet>
  );
}
