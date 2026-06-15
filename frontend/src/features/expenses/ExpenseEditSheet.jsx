import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createExpenseSchema,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  CURRENCIES,
} from '@pepetrip/shared';
import { BottomSheet, Button } from '../../components/ui';
import { useTranslation } from '../../i18n';

const emptyDefaults = (currency) => ({
  label: '',
  amount: undefined,
  currency,
  category: 'other',
  date: undefined,
  notes: '',
});

export function ExpenseEditSheet({ open, onClose, expense, currency = 'USD', saving, onSave }) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: emptyDefaults(currency),
  });

  useEffect(() => {
    if (!open) return;
    reset(
      expense
        ? {
            label: expense.label,
            amount: expense.amount,
            currency: expense.currency,
            category: expense.category,
            date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : undefined,
            notes: expense.notes ?? '',
          }
        : emptyDefaults(currency),
    );
  }, [open, expense, currency, reset]);

  const category = watch('category');

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={expense ? t('expenses.editTitle') : t('expenses.addTitle')}
    >
      <form className="stack" onSubmit={handleSubmit(onSave)}>
        <div className="field">
          <label className="field__label" htmlFor="exp-label">
            {t('expenses.whatFor')}
          </label>
          <input
            id="exp-label"
            className="input"
            {...register('label')}
            placeholder={t('expenses.whatForPlaceholder')}
          />
          {errors.label && <span className="field__error">{errors.label.message}</span>}
        </div>

        <div className="field__row">
          <div className="field">
            <label className="field__label" htmlFor="exp-amount">
              {t('expenses.amount')}
            </label>
            <input
              id="exp-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              className="input"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && <span className="field__error">{errors.amount.message}</span>}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="exp-currency">
              {t('expenses.currency')}
            </label>
            <select id="exp-currency" className="select" {...register('currency')}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <span className="field__label">{t('expenses.category')}</span>
          <div className="chips">
            {EXPENSE_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip${category === c ? ' is-selected' : ''}`}
                aria-pressed={category === c}
                onClick={() => setValue('category', c, { shouldValidate: true })}
              >
                {EXPENSE_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="exp-date">
            {t('expenses.dateOptional')}
          </label>
          <input id="exp-date" type="date" className="input" {...register('date')} />
        </div>

        <Button type="submit" variant="primary" block loading={saving}>
          {expense ? t('common.saveChanges') : t('expenses.addExpense')}
        </Button>
      </form>
    </BottomSheet>
  );
}
