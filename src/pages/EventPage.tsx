import {
  BellRing,
  Flag,
  Lock,
  MapPin,
  ShieldAlert,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { AppFrame, PageHeader } from '../components/AppFrame';
import { Avatar } from '../components/Avatar';
import { EventMap } from '../components/EventMap';
import { Modal } from '../components/Modal';
import {
  ATTENDANCE_LABELS,
  CATEGORY_META,
  REPORT_REASONS,
} from '../lib/constants';
import { formatCurrency, formatEventWindow } from '../lib/format';
import { useBubbleStore } from '../store/BubbleStore';
import type { AttendanceStatus, ReportTargetType } from '../types';

type ReportTarget = {
  type: ReportTargetType;
  id: string;
  label: string;
};

export function EventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const {
    currentUser,
    events,
    users,
    userLocation,
    joinEvent,
    setAttendance,
    toggleReminder,
    submitReport,
    blockUser,
  } = useBubbleStore();
  const event = events.find((entry) => entry.id === eventId);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportNotes, setReportNotes] = useState('');

  if (!event) {
    return (
      <AppFrame>
        <main className="screen">
          <PageHeader
            title="Bubble missing"
            subtitle="This event may have been removed from the mock store."
            backTo="/discover"
          />
          <div className="glass-card empty-state">
            <h2>That bubble is gone.</h2>
            <p>If the host deleted their profile, hosted events disappear too.</p>
            <Link className="primary-button primary-button--compact" to="/discover">
              Back to discover
            </Link>
          </div>
        </main>
      </AppFrame>
    );
  }

  const host = users.find((user) => user.id === event.hostId);
  const participants = event.attendeeIds
    .map((userId) => users.find((user) => user.id === userId))
    .filter((user): user is NonNullable<typeof user> => Boolean(user));
  const currentStatus = currentUser ? event.attendanceStatuses[currentUser.id] : undefined;
  const isAttending = Boolean(currentStatus);
  const reminderEnabled = currentUser
    ? event.reminderUserIds.includes(currentUser.id)
    : false;
  const hostBlocked = currentUser
    ? currentUser.trustFlags.blockedUserIds.includes(event.hostId)
    : false;
  const category = CATEGORY_META[event.category];

  const handleAttendance = (status: AttendanceStatus) => {
    setAttendance(event.id, status);
  };

  const handleChatEntry = () => {
    if (!isAttending) {
      joinEvent(event.id);
    }
    navigate(`/chat/${event.id}`);
  };

  const handleSubmitReport = () => {
    if (!reportTarget) {
      return;
    }

    submitReport({
      targetType: reportTarget.type,
      targetId: reportTarget.id,
      reason: reportReason,
      notes: reportNotes,
    });
    setReportNotes('');
    setReportTarget(null);
  };

  return (
    <AppFrame>
      <main className="screen">
        <PageHeader
          title="Bubble details"
          subtitle="Participants, timing, cost, and safety entry points stay visible before you join chat."
          backTo="/discover"
        />

        <section className="hero-card hero-card--event">
          <div className="hero-card__halo" style={{ background: category.glow }} />
          <div
            className="hero-card__bubble-icon"
            style={{ boxShadow: `0 24px 60px ${category.glow}` }}
          >
            {category.emoji}
          </div>
          <span
            className="category-token"
            style={{ background: category.glow, color: category.accent }}
          >
            <span>{category.emoji}</span>
            {category.label}
          </span>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <div className="hero-card__metrics">
            <span className="soft-badge">
              <Users size={12} />
              {event.attendeeIds.length} joining
            </span>
            <span className="soft-badge">
              <BellRing size={12} />
              {formatEventWindow(event.startTime, event.durationMinutes)}
            </span>
            {event.womenOnly ? (
              <span className="soft-badge">
                <ShieldAlert size={12} />
                Women-only
              </span>
            ) : null}
          </div>
        </section>

        {hostBlocked ? (
          <div className="glass-card notice-card notice-card--warning">
            <TriangleAlert size={16} />
            <div>
              <h3>Host blocked</h3>
              <p>
                You blocked this host from your profile. The event remains visible here
                because you opened it directly.
              </p>
            </div>
          </div>
        ) : null}

        <section className="glass-card">
          <div className="section-title">
            <Users size={16} />
            <span>Who is coming</span>
          </div>
          <div className="people-grid">
            {participants.map((participant) => (
              <Link
                key={participant.id}
                className="person-card"
                to={`/profile/${participant.id}`}
              >
                <Avatar user={participant} size="lg" />
                <strong>{participant.displayName}</strong>
                <span>
                  {participant.id === host?.id
                    ? 'Host'
                    : ATTENDANCE_LABELS[event.attendanceStatuses[participant.id]]}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="glass-card stat-grid">
          <div className="stat-card">
            <span className="eyebrow">Price</span>
            <strong>{formatCurrency(event.price)}</strong>
          </div>
          <div className="stat-card">
            <span className="eyebrow">Skill</span>
            <strong>{event.skillLevel.replace('_', ' ')}</strong>
          </div>
          <div className="stat-card">
            <span className="eyebrow">Duration</span>
            <strong>{event.durationMinutes} min</strong>
          </div>
          <div className="stat-card">
            <span className="eyebrow">Attendance</span>
            <strong>{event.attendanceCounts.here} here now</strong>
          </div>
        </section>

        <section className="glass-card">
          <div className="section-title">
            <MapPin size={16} />
            <span>Location</span>
          </div>
          <p className="helper-copy">{event.safetyNote}</p>
          <EventMap
            compact
            events={[event]}
            selectedEventId={event.id}
            userLocation={userLocation}
            onSelectEvent={() => undefined}
          />
          <div className="inline-actions">
            <span className="soft-badge">{event.location.label}</span>
            <Link className="secondary-button" to={`/discover?focus=${event.id}`}>
              View on map
            </Link>
          </div>
        </section>

        <section className="glass-card">
          <div className="section-title">
            <Lock size={16} />
            <span>Attendance & chat</span>
          </div>
          <div className="status-selector">
            {(Object.entries(ATTENDANCE_LABELS) as Array<[AttendanceStatus, string]>).map(
              ([status, label]) => (
                <button
                  key={status}
                  className={`status-button${currentStatus === status ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => handleAttendance(status)}
                >
                  {label}
                </button>
              ),
            )}
          </div>
          <label className="switch-card">
            <div>
              <span className="field__label">Reminder</span>
              <p className="field__hint">Mock local notification toggle for event start.</p>
            </div>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={() => toggleReminder(event.id)}
            />
            <span className="switch-card__toggle" aria-hidden="true" />
          </label>
          <div className="button-row">
            <button className="primary-button" type="button" onClick={handleChatEntry}>
              {isAttending ? 'Open chat' : 'Join event & chat'}
            </button>
            {!isAttending ? (
              <button
                className="secondary-button"
                type="button"
                onClick={() => joinEvent(event.id)}
              >
                Join without chatting
              </button>
            ) : null}
          </div>
        </section>

        <section className="glass-card">
          <div className="section-title">
            <ShieldAlert size={16} />
            <span>Community notes</span>
          </div>
          <div className="chip-grid">
            {event.requiredEquipment.map((item) => (
              <span key={item} className="soft-badge">
                {item}
              </span>
            ))}
            {event.extraFacilities.map((item) => (
              <span key={item} className="soft-badge soft-badge--warm">
                {item}
              </span>
            ))}
          </div>
          {host ? (
            <div className="host-card">
              <Avatar user={host} />
              <div>
                <strong>{host.displayName}</strong>
                <p>
                  {host.trustFlags.verifiedHost ? 'Verified host' : 'Standard host'} ·{' '}
                  {host.trustFlags.noShowStrikes} no-show strike(s)
                </p>
              </div>
            </div>
          ) : null}
          <div className="button-row">
            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                setReportTarget({ type: 'event', id: event.id, label: event.title })
              }
            >
              <Flag size={14} />
              Report event
            </button>
            {host ? (
              <>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() =>
                    setReportTarget({
                      type: 'user',
                      id: host.id,
                      label: host.displayName,
                    })
                  }
                >
                  Report host
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => blockUser(host.id)}
                >
                  Block host
                </button>
              </>
            ) : null}
          </div>
        </section>

        <Modal
          open={Boolean(reportTarget)}
          title={reportTarget ? `Report ${reportTarget.label}` : 'Report'}
          description="This stays a frontend-only placeholder in the mock, but the flow is real."
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
                onClick={handleSubmitReport}
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
              placeholder="What feels unsafe or fake?"
            />
          </label>
        </Modal>
      </main>
    </AppFrame>
  );
}
