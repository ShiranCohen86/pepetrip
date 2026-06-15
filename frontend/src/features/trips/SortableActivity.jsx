import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icon } from '../../components/ui';
import { activityEmoji, formatCurrency } from '../../utils/format.js';

export function SortableActivity({ activity, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const time = [activity.startTime, activity.endTime].filter(Boolean).join(' – ');

  return (
    <div ref={setNodeRef} style={style} className={`activity${isDragging ? ' is-dragging' : ''}`}>
      <button
        type="button"
        className="activity__handle"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <Icon name="grip" size={18} />
      </button>

      <div
        className="activity__body"
        role="button"
        tabIndex={0}
        onClick={onEdit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit();
          }
        }}
      >
        <div className="activity__title">
          <span className="activity__type" aria-hidden="true">
            {activityEmoji(activity.type)}
          </span>
          {activity.title}
        </div>
        {time && <div className="activity__time">{time}</div>}
        {activity.description && <div className="activity__desc">{activity.description}</div>}
      </div>

      <div className="stack" style={{ gap: '0.4rem', alignItems: 'flex-end' }}>
        {activity.estimatedCost?.amount != null && (
          <span className="activity__cost">
            {formatCurrency(activity.estimatedCost.amount, activity.estimatedCost.currency)}
          </span>
        )}
        <button
          type="button"
          className="btn--icon"
          onClick={onDelete}
          aria-label={`Delete ${activity.title}`}
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </div>
  );
}
