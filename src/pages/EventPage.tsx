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

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

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
            title="Session missing"
            subtitle="This session may have been removed from the mock store."
            backTo="/discover"
          />
          <Card className="empty-state">
            <h2>That session is gone.</h2>
            <p>If the host deleted their profile, hosted sessions disappear too.</p>
            <Link
              className={cn(buttonVariants({ size: 'sm' }), 'primary-button')}
              to="/discover"
            >
              Back to discover
            </Link>
          </Card>
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
          title="Session details"
          subtitle="Players, timing, cost, and safety entry points stay visible before you join chat."
          backTo="/discover"
        />

        <Card className="hero-card hero-card--event">
          <div className="hero-card__halo" style={{ background: category.glow }} />
          <div
            className="hero-card__bubble-icon"
            style={{ boxShadow: `0 24px 60px ${category.glow}` }}
          >
            {category.emoji}
          </div>
          <Badge
            className="category-token"
            style={{ background: category.glow, color: category.accent }}
          >
            <span>{category.emoji}</span>
            {category.label}
          </Badge>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <div className="hero-card__metrics">
            <Badge variant="outline" className="soft-badge">
              <Users size={12} />
              {event.attendeeIds.length} players
            </Badge>
            <Badge variant="outline" className="soft-badge">
              <BellRing size={12} />
              {formatEventWindow(event.startTime, event.durationMinutes)}
            </Badge>
            {event.womenOnly ? (
              <Badge variant="outline" className="soft-badge">
                <ShieldAlert size={12} />
                Women-only
              </Badge>
            ) : null}
          </div>
        </Card>

        {hostBlocked ? (
          <Card className="notice-card notice-card--warning">
            <TriangleAlert size={16} />
            <div>
              <h3>Host blocked</h3>
              <p>
                You blocked this host from your profile. The session remains visible here
                because you opened it directly.
              </p>
            </div>
          </Card>
        ) : null}

        <Card>
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
                <div className="person-card__copy">
                  <strong>{participant.displayName}</strong>
                  <span>
                    {participant.id === host?.id
                      ? 'Host'
                      : ATTENDANCE_LABELS[event.attendanceStatuses[participant.id]]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="stat-grid">
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
        </Card>

        <Card>
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
            <Badge variant="outline" className="soft-badge">
              {event.location.label}
            </Badge>
            <Link
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'secondary-button',
              )}
              to={`/discover?focus=${event.id}`}
            >
              View on map
            </Link>
          </div>
        </Card>

        <Card>
          <div className="section-title">
            <Lock size={16} />
            <span>Attendance & chat</span>
          </div>
          <div className="status-selector">
            {(Object.entries(ATTENDANCE_LABELS) as Array<[AttendanceStatus, string]>).map(
              ([status, label]) => (
                <Button
                  key={status}
                  type="button"
                  variant={currentStatus === status ? 'default' : 'outline'}
                  size="sm"
                  className="status-button"
                  onClick={() => handleAttendance(status)}
                >
                  {label}
                </Button>
              ),
            )}
          </div>
          <label className="switch-card">
            <div>
              <span className="field__label">Reminder</span>
              <p className="field__hint">Mock local notification toggle for event start.</p>
            </div>
            <Switch
              checked={reminderEnabled}
              onCheckedChange={() => toggleReminder(event.id)}
            />
          </label>
          <div className="button-row">
            <Button className="primary-button" type="button" onClick={handleChatEntry}>
              {isAttending ? 'Open chat' : 'Join session & chat'}
            </Button>
            {!isAttending ? (
              <Button
                variant="outline"
                className="secondary-button"
                type="button"
                onClick={() => joinEvent(event.id)}
              >
                Join without chat
              </Button>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="section-title">
            <ShieldAlert size={16} />
            <span>Session setup</span>
          </div>
          <div className="chip-grid">
            {event.requiredEquipment.map((item) => (
              <Badge key={item} variant="outline" className="soft-badge">
                {item}
              </Badge>
            ))}
            {event.extraFacilities.map((item) => (
              <Badge key={item} variant="secondary" className="soft-badge soft-badge--warm">
                {item}
              </Badge>
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
            <Button
              variant="outline"
              className="secondary-button"
              type="button"
              onClick={() =>
                setReportTarget({ type: 'event', id: event.id, label: event.title })
              }
            >
              <Flag size={14} />
              Report session
            </Button>
            {host ? (
              <>
                <Button
                  variant="outline"
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
                </Button>
                <Button
                  variant="outline"
                  className="secondary-button"
                  type="button"
                  onClick={() => blockUser(host.id)}
                >
                  Block host
                </Button>
              </>
            ) : null}
          </div>
        </Card>

        <Modal
          open={Boolean(reportTarget)}
          title={reportTarget ? `Report ${reportTarget.label}` : 'Report'}
          description="This stays a frontend-only placeholder in the mock, but the flow is real."
          onClose={() => setReportTarget(null)}
          footer={
            <>
              <Button
                variant="outline"
                className="secondary-button"
                type="button"
                onClick={() => setReportTarget(null)}
              >
                Cancel
              </Button>
              <Button
                className="primary-button primary-button--compact"
                type="button"
                onClick={handleSubmitReport}
              >
                Submit report
              </Button>
            </>
          }
        >
          <label className="field">
            <span className="field__label">Reason</span>
            <NativeSelect
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
            >
              {REPORT_REASONS.map((reason) => (
                <NativeSelectOption key={reason} value={reason}>
                  {reason}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>
          <label className="field">
            <span className="field__label">Notes</span>
            <Textarea
              className="text-field--textarea"
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
