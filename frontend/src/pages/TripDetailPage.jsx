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
import { useDevice } from '../hooks/responsive';
import { useTranslation } from '../i18n';
import { formatDateRange, sumTripCost, formatCurrency, tripEmoji } from '../utils/format.js';

// Lazy-load the map: MapLibre is heavy, so it loads only when the Map tab opens.
const TripMap = lazy(() =>
  import('../features/trips/TripMap.jsx').then((m) => ({ default: m.TripMap })),
);

// key + emoji; labels come from the dictionary (tripDetail.tabs.*).
const TABS = [
  { key: 'plan', emoji: '🗂️' },
  { key: 'map', emoji: '🗺️' },
  { key: 'timeline', emoji: '🕰️' },
  { key: 'spending', emoji: '💸' },
  { key: 'packing', emoji: '🧳' },
  { key: 'weather', emoji: '🌤️' },
  { key: 'photos', emoji: '📸' },
  { key: 'documents', emoji: '📄' },
  { key: 'people', emoji: '🧑‍🤝‍🧑' },
];

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { isDesktop, isLargeDesktop } = useDevice();
  const twoPane = isDesktop || isLargeDesktop; // ≥1024px → split itinerary + panel

  const { data, isLoading, isError, error } = useTrip(id);
  const trip = data?.trip;

  const generate = useGenerate(id);
  const reorder = useReorder(id);
  const addActivity = useAddActivity(id);
  const updateActivity = useUpdateActivity(id);
  const deleteActivity = useDeleteActivity(id);
  const deleteTrip = useDeleteTrip();

  const [sheet, setSheet] = useState(null); // null | { dayId, activity? }
  const [tab, setTab] = useState('plan'); // single-pane (mobile/tablet)
  const [asideTab, setAsideTab] = useState('map'); // right pane (desktop)

  if (isLoading) {
    return (
      <div className="splash" style={{ minHeight: '50dvh' }}>
        <Spinner size="lg" />
        <p>{t('tripDetail.loading')}</p>
      </div>
    );
  }
  if (isError || !trip) {
    return (
      <EmptyState emoji="⚠️" title={t('tripDetail.loadError')}>
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
        await updateActivity.mutateAsync({ dayId: sheet.dayId, activityId: sheet.activity.id, body });
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
      onSuccess: () => toast(t('tripDetail.itineraryUpdated')),
      onError: (e) => toast(e.message),
    });

  const handleDeleteTrip = () => {
    if (!window.confirm(t('tripDetail.deleteConfirm'))) return;
    deleteTrip.mutate(id, {
      onSuccess: () => navigate('/'),
      onError: (e) => toast(e.message),
    });
  };

  const renderPlan = () => (
    <>
      <div className="row" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={handleRegenerate} loading={generate.isPending}>
          <Icon name="sparkles" size={18} />{' '}
          {hasItinerary ? t('common.regenerate') : t('createTrip.generate')}
        </Button>
        <Button variant="danger" onClick={handleDeleteTrip} loading={deleteTrip.isPending}>
          <Icon name="trash" size={16} /> {t('common.delete')}
        </Button>
      </div>

      {generate.isPending && !hasItinerary && (
        <div className="splash" style={{ minHeight: '28dvh' }}>
          <Spinner />
          <p>{t('tripDetail.planningDays')}</p>
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
            title={t('tripDetail.noItinerary')}
            action={
              <Button variant="primary" onClick={handleRegenerate} loading={generate.isPending}>
                <Icon name="sparkles" size={18} /> {t('createTrip.generate')}
              </Button>
            }
          >
            {t('tripDetail.noItineraryBody')}
          </EmptyState>
        )
      )}
    </>
  );

  const renderSection = (key) => {
    switch (key) {
      case 'plan':
        return renderPlan();
      case 'map':
        return (
          <Suspense
            fallback={
              <div className="splash" style={{ minHeight: '20dvh' }}>
                <Spinner />
              </div>
            }
          >
            <TripMap trip={trip} />
          </Suspense>
        );
      case 'timeline':
        return <TripTimeline trip={trip} />;
      case 'spending':
        return <ExpensesPanel tripId={id} tripCurrency={currency} />;
      case 'packing':
        return <PackingPanel tripId={id} />;
      case 'weather':
        return <WeatherStrip tripId={id} />;
      case 'photos':
        return <PhotosPanel tripId={id} />;
      case 'documents':
        return <DocumentsPanel tripId={id} />;
      case 'people':
        return <TripPeople trip={trip} />;
      default:
        return null;
    }
  };

  const TabButton = ({ tabDef, selected, onSelect }) => (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={`tab${selected ? ' is-active' : ''}`}
      onClick={onSelect}
    >
      {tabDef.emoji} {t(`tripDetail.tabs.${tabDef.key}`)}
    </button>
  );

  const secondaryTabs = TABS.filter((tb) => tb.key !== 'plan');

  return (
    <div>
      <button
        type="button"
        className="btn btn--icon"
        onClick={() => navigate('/')}
        aria-label={t('tripDetail.backToTrips')}
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
            {t('tripDetail.estCost', { cost: formatCurrency(cost, currency) })}
            {trip.budget?.amount
              ? t('tripDetail.ofBudget', { budget: formatCurrency(trip.budget.amount, currency) })
              : ''}
          </div>
        )}
      </div>

      {twoPane ? (
        <div className="split">
          <section className="split__main" aria-label={t('tripDetail.tabs.plan')}>
            {renderPlan()}
          </section>
          <aside className="split__aside">
            <div className="tabs" role="tablist" aria-label={t('tripDetail.sections')}>
              {secondaryTabs.map((tb) => (
                <TabButton
                  key={tb.key}
                  tabDef={tb}
                  selected={asideTab === tb.key}
                  onSelect={() => setAsideTab(tb.key)}
                />
              ))}
            </div>
            {renderSection(asideTab)}
          </aside>
        </div>
      ) : (
        <>
          <div className="tabs" role="tablist" aria-label={t('tripDetail.sections')}>
            {TABS.map((tb) => (
              <TabButton
                key={tb.key}
                tabDef={tb}
                selected={tab === tb.key}
                onSelect={() => setTab(tb.key)}
              />
            ))}
          </div>
          {renderSection(tab)}
        </>
      )}

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
