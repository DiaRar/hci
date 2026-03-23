import { Download, ShieldAlert, Trash2, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { AppFrame, PageHeader } from '../components/AppFrame';
import { Avatar } from '../components/Avatar';
import { EventCard } from '../components/EventCard';
import { Modal } from '../components/Modal';
import { INTEREST_OPTIONS, REPORT_REASONS } from '../lib/constants';
import { useBubbleStore } from '../store/BubbleStore';
import type { ProfilePatch, ReportTargetType, User } from '../types';

type ReportTarget = {
  type: ReportTargetType;
  id: string;
  label: string;
};

export function ProfilePage() {
  const { userId } = useParams();
  const {
    currentUser,
    users,
    events,
    updateProfile,
    toggleFriend,
    submitReport,
    blockUser,
    exportCurrentUserData,
    deleteCurrentUser,
  } = useBubbleStore();
  const profile = users.find((user) => user.id === (userId ?? currentUser?.id));
  const isOwnProfile = !userId || userId === currentUser?.id;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportNotes, setReportNotes] = useState('');

  if (!profile) {
    return (
      <AppFrame>
        <main className="screen">
          <PageHeader
            title="Profile missing"
            subtitle="This user may have deleted their demo account."
            backTo="/discover"
          />
          <div className="glass-card empty-state">
            <Link className="primary-button primary-button--compact" to="/discover">
              Back to discover
            </Link>
          </div>
        </main>
      </AppFrame>
    );
  }

  const hostedEvents = events.filter((event) => event.hostId === profile.id);
  const joinedEvents = events.filter(
    (event) => event.attendeeIds.includes(profile.id) && event.hostId !== profile.id,
  );
  const isFriend = currentUser ? currentUser.friends.includes(profile.id) : false;

  const handleExport = () => {
    const payload = exportCurrentUserData();
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'bubbleverse-export.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    deleteCurrentUser();
    setDeleteOpen(false);
  };

  const handleReport = () => {
    if (!reportTarget) {
      return;
    }

    submitReport({
      targetType: reportTarget.type,
      targetId: reportTarget.id,
      reason: reportReason,
      notes: reportNotes,
    });
    setReportTarget(null);
    setReportNotes('');
  };

  return (
    <AppFrame>
      <main className="screen">
        <PageHeader
          title={isOwnProfile ? 'Your profile' : profile.displayName}
          subtitle={
            isOwnProfile
              ? 'Edit how you appear in the app and manage your mock GDPR actions.'
              : 'See who this person is before you join their event.'
          }
          backTo="/discover"
        />

        <section className="hero-card hero-card--profile">
          <Avatar user={profile} size="lg" />
          <h1>{profile.displayName}</h1>
          <p>{profile.bio}</p>
          <div className="hero-card__metrics">
            <span className="soft-badge">{profile.interests.length} interests</span>
            <span className="soft-badge">{profile.friends.length} friends</span>
            <span className="soft-badge">
              {profile.trustFlags.noShowStrikes} no-show strikes
            </span>
          </div>
        </section>

        {isOwnProfile ? (
          <div className="stack">
            <OwnProfileEditor
              key={profile.id}
              profile={profile}
              onSave={updateProfile}
            />

            <section className="glass-card">
              <div className="section-title">
                <ShieldAlert size={16} />
                <span>Data rights</span>
              </div>
              <div className="button-row">
                <button className="secondary-button" type="button" onClick={handleExport}>
                  <Download size={14} />
                  Export my data
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={14} />
                  Delete account
                </button>
              </div>
            </section>
          </div>
        ) : (
          <section className="glass-card">
            <div className="button-row">
              <button
                className="primary-button primary-button--compact"
                type="button"
                onClick={() => toggleFriend(profile.id)}
              >
                <UserPlus size={14} />
                {isFriend ? 'Remove friend' : 'Add friend'}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() =>
                  setReportTarget({
                    type: 'user',
                    id: profile.id,
                    label: profile.displayName,
                  })
                }
              >
                Report user
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => blockUser(profile.id)}
              >
                Block user
              </button>
            </div>
            <div className="chip-grid">
              {profile.languages.map((language) => (
                <span key={language} className="soft-badge">
                  {language}
                </span>
              ))}
              {profile.interests.map((interest) => (
                <span key={interest} className="soft-badge soft-badge--warm">
                  {interest}
                </span>
              ))}
            </div>
          </section>
        )}

        {hostedEvents.length > 0 ? (
          <section className="list-section">
            <div className="list-section__header">
              <div>
                <p className="eyebrow">Hosted</p>
                <h2>{profile.displayName.split(' ')[0]}'s bubbles</h2>
              </div>
            </div>
            <div className="event-list">
              {hostedEvents.slice(0, 2).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ) : null}

        {joinedEvents.length > 0 ? (
          <section className="list-section">
            <div className="list-section__header">
              <div>
                <p className="eyebrow">Joined</p>
                <h2>Upcoming plans</h2>
              </div>
            </div>
            <div className="event-list">
              {joinedEvents.slice(0, 2).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ) : null}

        <Modal
          open={deleteOpen}
          title="Delete account"
          description="This removes your local profile, hosted events, attendance, and messages from the mock store."
          onClose={() => setDeleteOpen(false)}
          footer={
            <>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                className="primary-button primary-button--compact"
                type="button"
                onClick={handleDelete}
              >
                Delete
              </button>
            </>
          }
        >
          <p className="helper-copy">
            This is the demo version of the right to be forgotten flow.
          </p>
        </Modal>

        <Modal
          open={Boolean(reportTarget)}
          title={reportTarget ? `Report ${reportTarget.label}` : 'Report user'}
          description="Reports are stored locally to demonstrate the flow."
          onClose={() => setReportTarget(null)}
          footer={
            <>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setReportTarget(null)}
              >
                Cancel
              </button>
              <button
                className="primary-button primary-button--compact"
                type="button"
                onClick={handleReport}
              >
                Submit report
              </button>
            </>
          }
        >
          <label className="field">
            <span className="field__label">Reason</span>
            <select
              className="select-field"
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
            >
              {REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Notes</span>
            <textarea
              className="text-field text-field--textarea"
              rows={4}
              value={reportNotes}
              onChange={(event) => setReportNotes(event.target.value)}
            />
          </label>
        </Modal>
      </main>
    </AppFrame>
  );
}

function OwnProfileEditor({
  profile,
  onSave,
}: {
  profile: User;
  onSave: (patch: ProfilePatch) => void;
}) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [languages, setLanguages] = useState(profile.languages.join(', '));
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [nearbyDiscoveryEnabled, setNearbyDiscoveryEnabled] = useState(
    profile.nearbyDiscoveryEnabled,
  );
  const [savedMessage, setSavedMessage] = useState('');

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((entry) => entry !== interest)
        : [...current, interest],
    );
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      displayName,
      bio,
      interests,
      languages: languages
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
      nearbyDiscoveryEnabled,
    });
    setSavedMessage('Profile saved locally.');
  };

  return (
    <form className="stack" onSubmit={handleSave}>
      <section className="glass-card form-card">
        <label className="field">
          <span className="field__label">Display name</span>
          <input
            className="text-field"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">Bio</span>
          <textarea
            className="text-field text-field--textarea"
            rows={4}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">Languages</span>
          <input
            className="text-field"
            type="text"
            value={languages}
            onChange={(event) => setLanguages(event.target.value)}
            placeholder="Romanian, English"
          />
        </label>
        <div className="field">
          <div className="field__label-row">
            <span className="field__label">Interests</span>
            <span className="field__hint">These show up in the profile and auth flow.</span>
          </div>
          <div className="chip-grid">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                className={`pill-button${interests.includes(interest) ? ' is-active' : ''}`}
                type="button"
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
        <label className="switch-card">
          <div>
            <span className="field__label">Nearby discovery</span>
            <p className="field__hint">Open-map visibility is opt-in on the profile.</p>
          </div>
          <input
            type="checkbox"
            checked={nearbyDiscoveryEnabled}
            onChange={(event) => setNearbyDiscoveryEnabled(event.target.checked)}
          />
          <span className="switch-card__toggle" aria-hidden="true" />
        </label>
        {savedMessage ? <p className="helper-copy helper-copy--success">{savedMessage}</p> : null}
        <button className="primary-button" type="submit">
          Save profile
        </button>
      </section>
    </form>
  );
}
