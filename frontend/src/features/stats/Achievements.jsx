import { useAchievements } from './statsQueries.js';

export function Achievements() {
  const { data } = useAchievements();
  if (!data) return null;
  const { badges, earnedCount, total } = data;

  return (
    <div className="stack">
      <div className="spread">
        <h2 style={{ fontSize: '1.1rem' }}>Achievements</h2>
        <span className="pill pill--brand">
          {earnedCount}/{total}
        </span>
      </div>
      <div className="badge-grid">
        {badges.map((b) => {
          const pct = Math.round((b.progress.current / b.progress.target) * 100);
          return (
            <div
              key={b.key}
              className={`badge${b.earned ? ' is-earned' : ''}`}
              title={b.description}
            >
              <span className="badge__emoji" aria-hidden="true">
                {b.emoji}
              </span>
              <span className="badge__name">{b.name}</span>
              {b.earned ? (
                <span className="badge__done">Unlocked</span>
              ) : (
                <span className="badge__progress">
                  {b.progress.current}/{b.progress.target}
                  <span className="badge__bar">
                    <span className="badge__bar-fill" style={{ width: `${pct}%` }} />
                  </span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
