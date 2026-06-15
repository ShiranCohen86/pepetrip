import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableActivity } from './SortableActivity.jsx';
import { formatDate } from '../../utils/format.js';
import { Icon } from '../../components/ui';
import { useTranslation } from '../../i18n';

const buildContainers = (trip) =>
  (trip.days || []).map((d) => ({
    id: d.id,
    dayNumber: d.dayNumber,
    date: d.date,
    summary: d.summary,
    activityIds: (d.activities || []).map((a) => a.id),
  }));

const buildActivityMap = (trip) => {
  const map = {};
  for (const d of trip.days || []) {
    for (const a of d.activities || []) map[a.id] = a;
  }
  return map;
};

function DayColumn({ container, activityMap, onEditActivity, onAddActivity, onDeleteActivity }) {
  const { t } = useTranslation();
  const { setNodeRef } = useDroppable({ id: container.id });
  return (
    <section className="day">
      <div className="day__head">
        <h2>{t('itinerary.day', { n: container.dayNumber })}</h2>
        <span className="muted">
          {formatDate(container.date, { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>
      {container.summary && (
        <p className="muted" style={{ marginBottom: '0.5rem' }}>
          {container.summary}
        </p>
      )}
      <div className="day__list" ref={setNodeRef}>
        <SortableContext items={container.activityIds} strategy={verticalListSortingStrategy}>
          {container.activityIds.map((id) => {
            const activity = activityMap[id];
            if (!activity) return null;
            return (
              <SortableActivity
                key={id}
                activity={activity}
                onEdit={() => onEditActivity(container.id, activity)}
                onDelete={() => onDeleteActivity(container.id, id)}
              />
            );
          })}
        </SortableContext>
        {container.activityIds.length === 0 && (
          <p className="muted center" style={{ padding: '0.5rem' }}>
            {t('itinerary.noActivities')}
          </p>
        )}
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => onAddActivity(container.id)}
        >
          <Icon name="plus" size={16} /> {t('itinerary.addActivity')}
        </button>
      </div>
    </section>
  );
}

export function ItineraryEditor({
  trip,
  onReorder,
  onEditActivity,
  onAddActivity,
  onDeleteActivity,
}) {
  const [containers, setContainers] = useState(() => buildContainers(trip));
  const activityMap = useMemo(() => buildActivityMap(trip), [trip]);

  // Re-sync local DnD state whenever the trip's structure changes on the server.
  const signature = useMemo(
    () =>
      (trip.days || [])
        .map((d) => `${d.id}:${(d.activities || []).map((a) => a.id).join(',')}`)
        .join('|'),
    [trip],
  );
  useEffect(() => {
    setContainers(buildContainers(trip));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findContainer = (id) => {
    if (containers.some((c) => c.id === id)) return id;
    return containers.find((c) => c.activityIds.includes(id))?.id;
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const from = findContainer(active.id);
    const to = findContainer(over.id);
    if (!from || !to || from === to) return;
    setContainers((prev) => {
      const next = prev.map((c) => ({ ...c, activityIds: [...c.activityIds] }));
      const fromC = next.find((c) => c.id === from);
      const toC = next.find((c) => c.id === to);
      fromC.activityIds = fromC.activityIds.filter((i) => i !== active.id);
      const overIdx = toC.activityIds.indexOf(over.id);
      toC.activityIds.splice(overIdx >= 0 ? overIdx : toC.activityIds.length, 0, active.id);
      return next;
    });
  };

  const handleDragEnd = ({ active, over }) => {
    let result = containers;
    if (over) {
      const from = findContainer(active.id);
      const to = findContainer(over.id);
      if (from && to && from === to) {
        const c = containers.find((x) => x.id === from);
        const oldIdx = c.activityIds.indexOf(active.id);
        const newIdx = c.activityIds.indexOf(over.id);
        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
          result = containers.map((x) =>
            x.id === from ? { ...x, activityIds: arrayMove(x.activityIds, oldIdx, newIdx) } : x,
          );
        }
      }
    }
    setContainers(result);
    onReorder(result.map((c) => ({ id: c.id, activityIds: c.activityIds })));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {containers.map((container) => (
        <DayColumn
          key={container.id}
          container={container}
          activityMap={activityMap}
          onEditActivity={onEditActivity}
          onAddActivity={onAddActivity}
          onDeleteActivity={onDeleteActivity}
        />
      ))}
    </DndContext>
  );
}
