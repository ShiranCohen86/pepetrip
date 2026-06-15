import { useState } from 'react';
import { convertCurrency } from '@pepetrip/shared';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from './expenseQueries.js';
import { ExpenseEditSheet } from './ExpenseEditSheet.jsx';
import { Button, Icon, Spinner, EmptyState, useToast } from '../../components/ui';
import { formatCurrency, formatDate, expenseEmoji } from '../../utils/format.js';
import { useTranslation } from '../../i18n';

export function ExpensesPanel({ tripId, tripCurrency = 'USD' }) {
  const { t } = useTranslation();
  const toast = useToast();
  const { data, isLoading, isError, error } = useExpenses(tripId);
  const create = useCreateExpense(tripId);
  const update = useUpdateExpense(tripId);
  const remove = useDeleteExpense(tripId);
  const [sheet, setSheet] = useState(null); // null | { expense? }

  if (isLoading) {
    return (
      <div className="splash" style={{ minHeight: '20dvh' }}>
        <Spinner />
      </div>
    );
  }
  if (isError) {
    return (
      <EmptyState emoji="⚠️" title={t('expenses.loadError')}>
        {error?.message}
      </EmptyState>
    );
  }

  const { expenses, summary } = data;
  const pct = summary.budget
    ? Math.min(100, Math.round((summary.total / summary.budget) * 100))
    : 0;
  const over = summary.budget && summary.total > summary.budget;
  // Some expenses may be logged in a different currency than the trip's base.
  const hasMixedCurrency = expenses.some((e) => e.currency !== summary.currency);

  const handleSave = async (body) => {
    try {
      if (sheet.expense) {
        await update.mutateAsync({ expenseId: sheet.expense.id, body });
      } else {
        await create.mutateAsync(body);
      }
      setSheet(null);
    } catch (e) {
      toast(e.message);
    }
  };

  const topCategories = Object.entries(summary.byCategory)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="stack">
      <div className="card expense-summary">
        <div className="spread">
          <div>
            <div className="expense-summary__total">
              {formatCurrency(summary.total, summary.currency)}
            </div>
            <div className="muted">{t('expenses.spentAcross', { count: summary.count })}</div>
            {hasMixedCurrency && (
              <div className="muted" style={{ fontSize: '0.78rem', marginTop: '0.15rem' }}>
                {t('expenses.convertedNote', { currency: summary.currency })}
              </div>
            )}
          </div>
          {summary.budget > 0 && (
            <div className="center">
              <div className={`expense-summary__remaining${over ? ' is-over' : ''}`}>
                {over ? '−' : ''}
                {formatCurrency(Math.abs(summary.remaining), summary.currency)}
              </div>
              <div className="muted">{over ? t('expenses.overBudget') : t('expenses.left')}</div>
            </div>
          )}
        </div>
        {summary.budget > 0 && (
          <div className="budget-bar" aria-hidden="true">
            <div
              className={`budget-bar__fill${over ? ' is-over' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        {topCategories.length > 0 && (
          <div className="chips" style={{ marginTop: '0.75rem' }}>
            {topCategories.map(([cat, val]) => (
              <span key={cat} className="pill">
                {expenseEmoji(cat)} {t(`expenseCategories.${cat}`)} ·{' '}
                {formatCurrency(val, summary.currency)}
              </span>
            ))}
          </div>
        )}
      </div>

      <Button variant="primary" onClick={() => setSheet({})}>
        <Icon name="plus" size={18} /> {t('expenses.addExpense')}
      </Button>

      {expenses.length === 0 ? (
        <EmptyState emoji="💸" title={t('expenses.noExpenses')}>
          {t('expenses.noExpensesBody')}
        </EmptyState>
      ) : (
        <div className="stack" style={{ gap: '0.5rem' }}>
          {expenses.map((e) => (
            <div key={e.id} className="expense-row card">
              <span className="expense-row__emoji" aria-hidden="true">
                {expenseEmoji(e.category)}
              </span>
              <button
                type="button"
                className="expense-row__body"
                onClick={() => setSheet({ expense: e })}
              >
                <div className="expense-row__label">{e.label}</div>
                <div className="muted">
                  {t(`expenseCategories.${e.category}`)}
                  {e.date ? ` · ${formatDate(e.date)}` : ''}
                </div>
              </button>
              <span className="expense-row__amounts">
                <span className="expense-row__amount">{formatCurrency(e.amount, e.currency)}</span>
                {e.currency !== summary.currency && (
                  <span className="expense-row__converted">
                    ≈ {formatCurrency(convertCurrency(e.amount, e.currency, summary.currency), summary.currency)}
                  </span>
                )}
              </span>
              <button
                type="button"
                className="btn--icon"
                onClick={() => remove.mutate(e.id, { onError: (err) => toast(err.message) })}
                aria-label={t('expenses.deleteAria', { label: e.label })}
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ExpenseEditSheet
        open={Boolean(sheet)}
        onClose={() => setSheet(null)}
        expense={sheet?.expense}
        currency={tripCurrency}
        saving={create.isPending || update.isPending}
        onSave={handleSave}
      />
    </div>
  );
}
