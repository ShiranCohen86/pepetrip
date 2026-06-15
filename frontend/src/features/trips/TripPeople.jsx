import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../auth/authSlice.js';
import { useAddMember, useRemoveMember } from './tripQueries.js';
import { Button, Icon, useToast } from '../../components/ui';
import { useTranslation } from '../../i18n';

export function TripPeople({ trip }) {
  const { t } = useTranslation();
  const toast = useToast();
  const user = useSelector(selectUser);
  const isOwner = String(trip.ownerId) === String(user?.id);
  const addMember = useAddMember(trip.id);
  const removeMember = useRemoveMember(trip.id);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');

  const members = trip.members ?? [];

  const onAdd = (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    addMember.mutate(
      { email: value, role },
      { onSuccess: () => setEmail(''), onError: (err) => toast(err.message) },
    );
  };

  return (
    <div className="stack">
      <div className="list">
        <div className="list__row">
          <div className="row">
            <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
              👑
            </span>
            <div>
              <strong>{isOwner ? t('people.you') : t('people.tripOwner')}</strong>
              <div className="muted" style={{ fontSize: '0.85rem' }}>
                {t('people.owner')}
              </div>
            </div>
          </div>
        </div>
        {members.map((m) => (
          <div key={m.id} className="list__row">
            <div className="row">
              <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
                🧑‍🤝‍🧑
              </span>
              <div>
                <strong>{m.name || m.email}</strong>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  {m.email} · {m.role === 'editor' ? t('people.roleEditor') : t('people.roleViewer')}
                </div>
              </div>
            </div>
            {isOwner && (
              <button
                type="button"
                className="btn--icon"
                onClick={() => removeMember.mutate(m.id, { onError: (err) => toast(err.message) })}
                aria-label={t('people.removeAria', { name: m.email })}
              >
                <Icon name="x" size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {isOwner ? (
        <form className="stack" onSubmit={onAdd}>
          <div className="field__label">{t('people.inviteByEmail')}</div>
          <div className="row">
            <input
              type="email"
              className="input grow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('people.emailPlaceholder')}
              aria-label={t('people.memberEmailAria')}
            />
            <select
              className="select"
              style={{ width: 'auto' }}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              aria-label={t('people.roleAria')}
            >
              <option value="viewer">{t('people.roleViewer')}</option>
              <option value="editor">{t('people.roleEditor')}</option>
            </select>
            <Button type="submit" loading={addMember.isPending}>
              <Icon name="plus" size={18} />
            </Button>
          </div>
          <p className="muted" style={{ fontSize: '0.8rem' }}>
            {t('people.inviteHelp')}
          </p>
        </form>
      ) : (
        <p className="muted center">{t('people.sharedWithYou')}</p>
      )}
    </div>
  );
}
