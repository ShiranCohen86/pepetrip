import { useState } from 'react';
import { PACKING_CATEGORIES, PACKING_CATEGORY_LABELS } from '@pepetrip/shared';
import {
  usePacking,
  useGeneratePacking,
  useAddPackingItem,
  useUpdatePackingItem,
  useDeletePackingItem,
} from './packingQueries.js';
import { Button, Icon, Spinner, EmptyState, useToast } from '../../components/ui';
import { packingEmoji } from '../../utils/format.js';

export function PackingPanel({ tripId }) {
  const toast = useToast();
  const { data, isLoading, isError } = usePacking(tripId);
  const generate = useGeneratePacking(tripId);
  const addItem = useAddPackingItem(tripId);
  const updateItem = useUpdatePackingItem(tripId);
  const deleteItem = useDeletePackingItem(tripId);
  const [newLabel, setNewLabel] = useState('');

  if (isLoading) {
    return (
      <div className="splash" style={{ minHeight: '20dvh' }}>
        <Spinner />
      </div>
    );
  }
  if (isError) {
    return <EmptyState emoji="⚠️" title="Couldn't load packing list" />;
  }

  const items = data?.packing?.items ?? [];
  const packed = items.filter((i) => i.packed).length;
  const pct = items.length ? Math.round((packed / items.length) * 100) : 0;

  const grouped = PACKING_CATEGORIES.map((cat) => ({
    cat,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length);

  const onGenerate = () =>
    generate.mutate(undefined, {
      onSuccess: () => toast('Packing list ready'),
      onError: (e) => toast(e.message),
    });

  const onAdd = (e) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    addItem.mutate(
      { label, category: 'misc' },
      { onSuccess: () => setNewLabel(''), onError: (err) => toast(err.message) },
    );
  };

  if (items.length === 0) {
    return (
      <EmptyState
        emoji="🧳"
        title="No packing list yet"
        action={
          <Button variant="primary" onClick={onGenerate} loading={generate.isPending}>
            <Icon name="sparkles" size={18} /> Generate with AI
          </Button>
        }
      >
        Let the AI build a checklist tailored to your destination, dates and style.
      </EmptyState>
    );
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="spread">
          <strong>
            {packed} / {items.length} packed
          </strong>
          <Button size="sm" variant="ghost" onClick={onGenerate} loading={generate.isPending}>
            <Icon name="sparkles" size={16} /> Regenerate
          </Button>
        </div>
        <div className="budget-bar" aria-hidden="true" style={{ marginTop: '0.5rem' }}>
          <div className="budget-bar__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {grouped.map(({ cat, items: catItems }) => (
        <section key={cat}>
          <h3 className="packing__group">
            {packingEmoji(cat)} {PACKING_CATEGORY_LABELS[cat]}
          </h3>
          <div className="stack" style={{ gap: '0.4rem' }}>
            {catItems.map((item) => (
              <label key={item.id} className={`packing-item${item.packed ? ' is-packed' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.packed}
                  onChange={(e) =>
                    updateItem.mutate({ itemId: item.id, body: { packed: e.target.checked } })
                  }
                />
                <span className="packing-item__label">
                  {item.label}
                  {item.qty ? ` ×${item.qty}` : ''}
                </span>
                <button
                  type="button"
                  className="btn--icon"
                  onClick={() =>
                    deleteItem.mutate(item.id, { onError: (err) => toast(err.message) })
                  }
                  aria-label={`Remove ${item.label}`}
                >
                  <Icon name="x" size={16} />
                </button>
              </label>
            ))}
          </div>
        </section>
      ))}

      <form className="row" onSubmit={onAdd}>
        <input
          className="input grow"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Add an item…"
          aria-label="Add packing item"
        />
        <Button type="submit" loading={addItem.isPending}>
          <Icon name="plus" size={18} />
        </Button>
      </form>
    </div>
  );
}
