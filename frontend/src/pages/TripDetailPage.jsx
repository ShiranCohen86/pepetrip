import { useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useTrip,
  useGenerate,
  useReorder,
  useAddActivity,
  useUpdateActivity,
  useDeleteActivity,
  useDeleteTrip,
} from '../features/trips/tripQueries.js';
import { ItineraryEditor } from '../features/trips/ItineraryEditor.jsx';
import { ActivityEditSheet } from '../features/trips/ActivityEditSheet.jsx';
import { TripTimeline } from '../features/trips/TripTimeline.jsx';
import { TripPeople } from '../features/trips/TripPeople.jsx';
import { PhotosPanel } from '../features/photos/PhotosPanel.jsx';
import { DocumentsPanel } from '../features/documents/DocumentsPanel.jsx';
import { ExpensesPanel } from '../features/expenses/ExpensesPanel.jsx';
import { PackingPanel } from '../features/packing/PackingPanel.jsx';
import { WeatherStrip } from '../features/weather/WeatherStrip.jsx';
import { Button, Icon, Spinner, EmptyState, useToast } from '../components/ui';
import { formatDateRange, sumTripCost, formatCurrency, tripEmoji } from '../utils/format.js';

// Lazy-load the map: MapLibre is heavy, so it loads only when the Map tab opens.
const TripMap = lazy(() =>
  import('../features/trips/TripMap.jsx').then((m) => ({ default: m.TripMap })),
);

const TABS = [
  { key: 'plan', label: '🗂️ Plan' },
  { key: 'map', label: '🗺️ Map' },
  { key: 'timeline', label: '🕰️ Timeline' },
  { key: 'spending', label: '💸 Spending' },
  { key: 'packing', label: '🧳 Packing' },
  { key: 'weather', label: '🌤️ Weather' },
  { key: 'photos', label: '📸 Photos' },
  { key: 'documents', label: '📄 Docs' },
  { key: 'people', label: '🧑‍🤝‍🧑 People' },
];

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isLoading, isError, error } = useTrip(id);
  const trip = data?.trip;

  const generate = useGenerate(id);
  const reorder = useReorder(id);
  const addActivity = useAddActivity(id);
  const updateActivity = useUpdateActivity(id);
  const deleteActivity = useDeleteActivity(id);
  const deleteTrip = useDeleteTrip();

  const [sheet, setSheet] = useState(null); // null | { dayId, activity? }
  const [tab, setTab] = useState('plan');

  if (isLoading) {
    return (
      <div className="splash" style={{ minHeight: '50dvh' }}>
        <Spinner size="lg" />
        <p>Loading trip…</p>
      </div>
    );
  }
  if (isError || !trip) {
    return (
      <EmptyState emoji="⚠️" title="Couldn’t load this trip">
        {error?.message}
      </EmptyState>
    );
  }

  const cost = sumTripCost(trip);
  const currency = trip.currency || trip.budget?.currency || 'USD';
  const hasItinerary = (trip.days || []).some((d) => d.activities?.length);

  const handleSaveActivity = async (body) => {
    try {
      if (sheet.activity) {
        await updateActivity.mutateAsync({
          dayId: sheet.dayId,
          activityId: sheet.activity.id,
          body,
        });
      } else {
        await addActivity.mutateAsync({ dayId: sheet.dayId, body });
      }
      setSheet(null);
    } catch (e) {
      toast(e.message);
    }
  };

  const handleRegenerate = () =>
    generate.mutate(undefined, {
      onSuccess: () => toast('Itinerary updated'),
      onError: (e) => toast(e.message),
    });

  const handleDeleteTrip = () => {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return;
    deleteTrip.mutate(id, {
      onSuccess: () => navigate('/'),
      onError: (e) => toast(e.message),
    });
  };

  const renderPlan = () => (
    <>
      <div className="row" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={handleRegenerate} loading={generate.isPending}>
          <Icon name="sparkles" size={18} /> {hasItinerary ? 'Regenerate' : 'Generate with AI'}
        </Button>
        <Button variant="danger" onClick={handleDeleteTrip} loading={deleteTrip.isPending}>
          <Icon name="trash" size={16} /> Delete
        </Button>
      </div>

      {generate.isPending && !hasItinerary && (
        <div className="splash" style={{ minHeight: '28dvh' }}>
          <Spinner />
          <p>Planning your days…</p>
        </div>
      )}

      {hasItinerary ? (
        <ItineraryEditor
          trip={trip}
          onReorder={(days) => reorder.mutate({ days })}
          onAddActivity={(dayId) => setSheet({ dayId })}
          onEditActivity={(dayId, activity) => setSheet({ dayId, activity })}
          onDeleteActivity={(dayId, activityId) => deleteActivity.mutate({ dayId, activityId })}
        />
      ) : (
        !generate.isPending && (
          <EmptyState
            emoji="✨"
            title="No itinerary yet"
            action={
              <Button variant="primary" onClick={handleRegenerate} loading={generate.isPending}>
                <Icon name="sparkles" size={18} /> Generate with AI
              </Button>
            }
          >
            Let the AI draft a day-by-day plan you can edit.
          </EmptyState>
        )
      )}
    </>
  );

  return (
    <div>
      <button
        type="button"
        className="btn btn--icon"
        onClick={() => navigate('/')}
        aria-label="Back to trips"
        style={{ marginBottom: '0.5rem' }}
      >
        <Icon name="back" />
      </button>

      <div className="trip-hero">
        <div className="spread">
          <h1>{trip.title}</h1>
          <span style={{ fontSize: '1.6rem' }} aria-hidden="true">
            {tripEmoji(trip.travelStyle)}
          </span>
        </div>
        <div className="trip-hero__meta">
          <span>📍 {trip.destination?.label}</span>
          <span>🗓️ {formatDateRange(trip.startDate, trip.endDate)}</span>
          <span>👥 {trip.travelers}</span>
        </div>
        {cost > 0 && (
          <div className="trip-hero__cost">
            Est. {formatCurrency(cost, currency)}
            {trip.budget?.amount
              ? ` of ${formatCurrency(trip.budget.amount, currency)} budget`
              : ''}
          </div>
        )}
      </div>

      <div className="tabs" role="tablist" aria-label="Trip sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`tab${tab === t.key ? ' is-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'plan' && renderPlan()}
      {tab === 'map' && (
        <Suspense
          fallback={
            <div className="splash" style={{ minHeight: '20dvh' }}>
              <Spinner />
            </div>
          }
        >
          <TripMap trip={trip} />
        </Suspense>
      )}
      {tab === 'timeline' && <TripTimeline trip={trip} />}
      {tab === 'spending' && <ExpensesPanel tripId={id} tripCurrency={currency} />}
      {tab === 'packing' && <PackingPanel tripId={id} />}
      {tab === 'weather' && <WeatherStrip tripId={id} />}
      {tab === 'photos' && <PhotosPanel tripId={id} />}
      {tab === 'documents' && <DocumentsPanel tripId={id} />}
      {tab === 'people' && <TripPeople trip={trip} />}

      <ActivityEditSheet
        open={Boolean(sheet)}
        onClose={() => setSheet(null)}
        activity={sheet?.activity}
        currency={currency}
        saving={addActivity.isPending || updateActivity.isPending}
        onSave={handleSaveActivity}
      />
    </div>
  );
}
