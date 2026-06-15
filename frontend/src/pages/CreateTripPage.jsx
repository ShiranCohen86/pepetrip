import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { createTripSchema, TRAVEL_STYLES, CURRENCIES } from '@pepetrip/shared';
import { tripApi } from '../services/tripApi.js';
import { tripKeys } from '../features/trips/tripQueries.js';
import { Button, Icon, Spinner, useToast } from '../components/ui';
import { useTranslation } from '../i18n';

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
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const STEPS = [t('createTrip.stepDestination'), t('createTrip.stepDetails'), t('createTrip.stepReview')];

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
        toast(t('createTrip.savedAiFailed', { error: genErr.message }));
      }
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      toast(err.message || t('createTrip.createFailed'));
      setBusy(false);
    }
  };

  if (busy) {
    return (
      <div className="splash" style={{ minHeight: '60dvh' }}>
        <Spinner size="lg" />
        <p>{t('createTrip.planning')}</p>
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          {t('createTrip.planningHint')}
        </p>
      </div>
    );
  }

  return (
    <form className="wizard" onSubmit={handleSubmit(onSubmit)}>
      <div className="page-head">
        <h1>{t('createTrip.title')}</h1>
      </div>

      <ol className="stepper" aria-label={t('createTrip.title')}>
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`stepper__step${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}
            aria-current={i === step ? 'step' : undefined}
          >
            <span className="stepper__dot" />
            {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="stack">
          <div className="field">
            <label className="field__label" htmlFor="dest">
              {t('createTrip.whereGoing')}
            </label>
            <input
              id="dest"
              className="input"
              placeholder={t('createTrip.destPlaceholder')}
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
                {t('createTrip.start')}
              </label>
              <input id="start" type="date" className="input" {...register('startDate')} />
              {errors.startDate && <span className="field__error">{errors.startDate.message}</span>}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="end">
                {t('createTrip.end')}
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
                {t('createTrip.travelers')}
              </label>
              <input
                id="travelers"
                type="number"
                inputMode="numeric"
                min="1"
                className="input"
                {...register('travelers', { valueAsNumber: true })}
              />
              {errors.travelers && <span className="field__error">{errors.travelers.message}</span>}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="currency">
                {t('createTrip.currency')}
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
              {t('createTrip.totalBudget')}
            </label>
            <input
              id="budget"
              type="number"
              inputMode="decimal"
              min="0"
              className="input"
              {...register('budget.amount', { valueAsNumber: true })}
            />
            {errors.budget?.amount && (
              <span className="field__error">{errors.budget.amount.message}</span>
            )}
          </div>
          <div className="field">
            <span className="field__label">{t('createTrip.travelStyle')}</span>
            <div className="chips">
              {TRAVEL_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`chip${travelStyle === style ? ' is-selected' : ''}`}
                  aria-pressed={travelStyle === style}
                  onClick={() => setValue('travelStyle', style, { shouldValidate: true })}
                >
                  {t(`styles.${style}`)}
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
              {t('createTrip.anythingSpecific')} <span className="muted">{t('common.optional')}</span>
            </label>
            <textarea
              id="notes"
              className="textarea"
              placeholder={t('createTrip.notesPlaceholder')}
              {...register('notes')}
            />
          </div>
          <div className="card">
            <strong>{watch('destination.label') || t('createTrip.yourTrip')}</strong>
            <div className="muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {t('createTrip.summary', {
                start: watch('startDate'),
                end: watch('endDate'),
                travelers: watch('travelers'),
                style: t(`styles.${travelStyle}`),
              })}
            </div>
          </div>
        </div>
      )}

      <div className="wizard__actions">
        {step > 0 && (
          <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <Icon name="back" size={18} /> {t('common.back')}
          </Button>
        )}
        {step < 2 ? (
          <Button type="button" variant="primary" block onClick={next}>
            {t('common.continue')}
          </Button>
        ) : (
          <Button type="submit" variant="primary" block>
            <Icon name="sparkles" size={18} /> {t('createTrip.generate')}
          </Button>
        )}
      </div>
    </form>
  );
}
