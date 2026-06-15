import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createTripSchema, TRAVEL_STYLES, TRAVEL_STYLE_LABELS, CURRENCIES } from '@pepetrip/shared';
import { tripApi } from '../services/tripApi.js';
import { tripKeys } from '../features/trips/tripQueries.js';
import { Button, Icon, Spinner, useToast } from '../components/ui';

const iso = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const DEFAULTS = {
  destination: { label: '' },
  startDate: iso(new Date(today.getTime() + 14 * 86_400_000)),
  endDate: iso(new Date(today.getTime() + 17 * 86_400_000)),
  travelers: 2,
  budget: { amount: 1500, currency: 'USD' },
  travelStyle: 'adventure',
  notes: '',
};

const STEP_FIELDS = [
  ['destination.label', 'startDate', 'endDate'],
  ['travelers', 'budget.amount', 'budget.currency', 'travelStyle'],
];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTripSchema),
    defaultValues: DEFAULTS,
    mode: 'onTouched',
  });

  const travelStyle = watch('travelStyle');

  const next = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, 2));
  };

  const onSubmit = async (values) => {
    setBusy(true);
    try {
      const { trip } = await tripApi.create(values);
      qc.invalidateQueries({ queryKey: tripKeys.all });
      try {
        const result = await tripApi.generate(trip.id);
        qc.setQueryData(tripKeys.detail(trip.id), result);
      } catch (genErr) {
        toast(`Trip saved — AI planning failed: ${genErr.message}`);
      }
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      toast(err.message || 'Could not create the trip');
      setBusy(false);
    }
  };

  if (busy) {
    return (
      <div className="splash" style={{ minHeight: '60dvh' }}>
        <Spinner size="lg" />
        <p>Planning your trip with AI…</p>
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          Mapping out your days — this usually takes a few seconds.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="page-head">
        <h1>Plan a trip</h1>
      </div>

      <div className="wizard__progress">
        <div className="wizard__bar" style={{ width: `${((step + 1) / 3) * 100}%` }} />
      </div>

      {step === 0 && (
        <div className="stack">
          <div className="field">
            <label className="field__label" htmlFor="dest">
              Where are you going?
            </label>
            <input
              id="dest"
              className="input"
              placeholder="e.g. Kyoto, Japan"
              autoComplete="off"
              {...register('destination.label')}
            />
            {errors.destination?.label && (
              <span className="field__error">{errors.destination.label.message}</span>
            )}
          </div>
          <div className="field__row">
            <div className="field">
              <label className="field__label" htmlFor="start">
                Start
              </label>
              <input id="start" type="date" className="input" {...register('startDate')} />
              {errors.startDate && <span className="field__error">{errors.startDate.message}</span>}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="end">
                End
              </label>
              <input id="end" type="date" className="input" {...register('endDate')} />
              {errors.endDate && <span className="field__error">{errors.endDate.message}</span>}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="stack">
          <div className="field__row">
            <div className="field">
              <label className="field__label" htmlFor="travelers">
                Travelers
              </label>
              <input
                id="travelers"
                type="number"
                min="1"
                className="input"
                {...register('travelers', { valueAsNumber: true })}
              />
              {errors.travelers && <span className="field__error">{errors.travelers.message}</span>}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="currency">
                Currency
              </label>
              <select id="currency" className="select" {...register('budget.currency')}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="budget">
              Total budget
            </label>
            <input
              id="budget"
              type="number"
              min="0"
              className="input"
              {...register('budget.amount', { valueAsNumber: true })}
            />
            {errors.budget?.amount && (
              <span className="field__error">{errors.budget.amount.message}</span>
            )}
          </div>
          <div className="field">
            <span className="field__label">Travel style</span>
            <div className="chips">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`chip${travelStyle === style ? ' is-selected' : ''}`}
                  aria-pressed={travelStyle === style}
                  onClick={() => setValue('travelStyle', style, { shouldValidate: true })}
                >
                  {TRAVEL_STYLE_LABELS[style]}
                </button>
              ))}
            </div>
            {errors.travelStyle && (
              <span className="field__error">{errors.travelStyle.message}</span>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack">
          <div className="field">
            <label className="field__label" htmlFor="notes">
              Anything specific? <span className="muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              className="textarea"
              placeholder="Foodie spots, must-sees, accessibility needs, pace…"
              {...register('notes')}
            />
          </div>
          <div className="card">
            <strong>{watch('destination.label') || 'Your trip'}</strong>
            <div className="muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {watch('startDate')} → {watch('endDate')} · {watch('travelers')} travelers ·{' '}
              {TRAVEL_STYLE_LABELS[travelStyle]}
            </div>
          </div>
        </div>
      )}

      <div className="wizard__actions">
        {step > 0 && (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <Icon name="back" size={18} /> Back
          </Button>
        )}
        {step < 2 ? (
          <Button type="button" variant="primary" block onClick={next}>
            Continue
          </Button>
        ) : (
          <Button type="submit" variant="primary" block>
            <Icon name="sparkles" size={18} /> Generate with AI
          </Button>
        )}
      </div>
    </form>
  );
}
