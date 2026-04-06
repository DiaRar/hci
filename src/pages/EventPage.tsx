import {
  BellRing,
  Flag,
  Lock,
  MapPin,
  MessageCircle,
  ShieldAlert,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { Button, Card, Input, Modal, Select, Switch, Tabs, Tag, Typography } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppFrame, PageHeader } from '../components/AppFrame';
import { Avatar } from '../components/Avatar';
import { EventMap } from '../components/EventMap';
import {
  ATTENDANCE_LABELS,
  CATEGORY_META,
  REPORT_REASONS,
} from '../lib/constants';
import { formatCurrency, formatEventWindow } from '../lib/format';
import { useAnimatedNavigate } from '../lib/useAnimatedNavigate';
import { useBubbleStore } from '../store/BubbleStore';
import type { AttendanceStatus, ReportTargetType } from '../types';

type ReportTarget = {
  type: ReportTargetType;
  id: string;
  label: string;
};

function isReadableText(value: string): boolean {
  return /[A-Za-z0-9]/.test(value);
}

export function EventPage() {
  const navigate = useAnimatedNavigate();
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
        <main className="flex-1 flex flex-col gap-4 p-5 pb-8">
          <PageHeader
            title="Session missing"
            subtitle="This session may have been removed from the mock store."
            backTo="/discover"
          />
          <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center rounded-2xl">
            <h2>That session is gone.</h2>
            <p>If the host deleted their profile, hosted sessions disappear too.</p>
            <Button
              size="small"
              htmlType="button"
              type="primary"
              onClick={() => navigate('/discover')}
            >
              Back to discover
            </Button>
          </Card>
        </main>
      </AppFrame>
    );
  }

  const host = users.find((user) => user.id === event.hostId);
  const participants = event.attendeeIds
    .map((userId) => users.find((user) => user.id === userId))
    .filter((user): user is NonNullable<typeof user> => Boolean(user));
  const currentStatus = currentUser
    ? event.attendanceStatuses[currentUser.id]
    : undefined;
  const isAttending = Boolean(currentStatus);
  const reminderEnabled = currentUser
    ? event.reminderUserIds.includes(currentUser.id)
    : false;
  const hostBlocked = currentUser
    ? currentUser.trustFlags.blockedUserIds.includes(event.hostId)
    : false;
  const category = CATEGORY_META[event.category];
  const safeTitle = isReadableText(event.title ?? '')
    ? event.title
    : `${category.label} session`;
  const safeDescription = isReadableText(event.description ?? '')
    ? event.description
    : 'Session details will be shared by the host.';
  const safeSafetyNote = isReadableText(event.safetyNote ?? '')
    ? event.safetyNote
    : 'Exact court, field, or meetup point stays visible on the map in this demo.';

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
      <main className="flex-1 flex flex-col gap-4 p-5 pb-8">
        <PageHeader
          title="Session details"
          subtitle="Players, timing, cost, and safety entry points stay visible before you join chat."
          backTo="/discover"
        />

        <Card
          className="relative overflow-hidden rounded-[24px] border border-[var(--surface-border)] bg-[var(--surface)] shadow-[var(--surface-shadow)] backdrop-blur-[18px]"
          styles={{ body: { padding: 16 } }}
        >
          <div className="relative flex flex-col items-center text-center">
            <div
              className="absolute -top-[86px] h-[220px] w-[220px] rounded-full opacity-[0.55]"
              style={{ background: category.glow }}
            />
            <div
              className="relative z-10 mb-3 grid h-[84px] w-[84px] place-items-center rounded-full"
              style={{ boxShadow: `0 18px 44px ${category.glow}` }}
            >
              {category.emoji}
            </div>
            <Tag
              className="m-0 mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8rem] font-bold"
              style={{ background: category.glow, color: category.accent }}
            >
              <span>{category.emoji}</span>
              {category.label}
            </Tag>
            <h1 className="font-serif text-[2rem] leading-tight tracking-tight text-ink-strong dark:text-foreground">
              {safeTitle}
            </h1>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-muted-foreground">
              {safeDescription}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-[10px]">
            <Tag className="m-0 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[0.8rem] font-semibold text-ink-strong dark:bg-white/20">
              <Users size={12} />
              {event.attendeeIds.length} players
            </Tag>
            <Tag className="m-0 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[0.8rem] font-semibold text-ink-strong dark:bg-white/20">
              <BellRing size={12} />
              {formatEventWindow(event.startTime, event.durationMinutes)}
            </Tag>
            {event.womenOnly ? (
              <Tag className="m-0 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[0.8rem] font-semibold text-ink-strong dark:bg-white/20">
                <ShieldAlert size={12} />
                Women-only
              </Tag>
            ) : null}
          </div>
        </Card>

        {hostBlocked ? (
          <Card className="flex gap-3 p-4">
            <TriangleAlert size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <div>
              <h3 className="font-semibold">Host blocked</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You blocked this host from your profile. The session remains visible here
                because you opened it directly.
              </p>
            </div>
          </Card>
        ) : null}

        <Tabs
          defaultActiveKey="details"
          items={[
            {
              key: 'details',
              label: <span data-testid="tab-details">Details</span>,
              children: (
                <>
                  <Card className="rounded-2xl" styles={{ body: { padding: 14 } }}>
                    <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[16px] bg-white/72 p-3.5">
                      <span className="mb-1 block text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Price</span>
                      <strong className="text-ink-strong dark:text-foreground">{formatCurrency(event.price)}</strong>
                    </div>
                    <div className="rounded-[16px] bg-white/72 p-3.5">
                      <span className="mb-1 block text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Skill</span>
                      <strong className="text-ink-strong dark:text-foreground">{event.skillLevel.replaceAll('_', ' ')}</strong>
                    </div>
                    <div className="rounded-[16px] bg-white/72 p-3.5">
                      <span className="mb-1 block text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Duration</span>
                      <strong className="text-ink-strong dark:text-foreground">{event.durationMinutes} min</strong>
                    </div>
                    <div className="rounded-[16px] bg-white/72 p-3.5">
                      <span className="mb-1 block text-[0.72rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Attendance</span>
                      <strong className="text-ink-strong dark:text-foreground">{event.attendanceCounts.here} here now</strong>
                    </div>
                    </div>
                  </Card>
                  <Card className="mt-4 rounded-2xl" styles={{ body: { padding: 14 } }}>
                    <div className="inline-flex items-center gap-2 mb-3.5 text-[0.98rem] font-extrabold text-ink-strong dark:text-foreground">
                      <ShieldAlert size={16} />
                      <span>Session setup</span>
                    </div>
                    <div className="flex flex-wrap gap-[10px]">
                      {event.requiredEquipment.map((item) => (
                        <Tag key={item} className="m-0 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[0.8rem] font-semibold text-ink-strong dark:bg-white/20">
                          {item}
                        </Tag>
                      ))}
                      {event.extraFacilities.map((item) => (
                        <Tag key={item} className="m-0 inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,205,137,0.22)] px-3 py-1.5 text-[0.8rem] font-semibold text-[#8d5f48] dark:bg-[rgba(255,224,181,0.58)] dark:text-[var(--accent-foreground)]">
                          {item}
                        </Tag>
                      ))}
                      {event.requiredEquipment.length === 0 && event.extraFacilities.length === 0 ? (
                        <Typography.Text className="!text-sm !text-muted-foreground">
                          No extra equipment or facilities listed.
                        </Typography.Text>
                      ) : null}
                    </div>
                  </Card>
                </>
              ),
            },
            {
              key: 'people',
              label: <span data-testid="tab-people">People</span>,
              children: (
                <>
                  <Card className="rounded-2xl" styles={{ body: { padding: 14 } }}>
                    <div className="inline-flex items-center gap-2 mb-3.5 text-[0.98rem] font-extrabold text-ink-strong dark:text-foreground">
                      <Users size={16} />
                      <span>Who is coming</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {participants.map((participant) => (
                        <Button
                          key={participant.id}
                          type="default"
                          className="!h-auto !min-h-[8.3rem] !w-full"
                          htmlType="button"
                          onClick={() => navigate(`/profile/${participant.id}`)}
                        >
                          <Avatar user={participant} size="lg" />
                          <div className="flex min-h-[3.5rem] w-full flex-col items-center gap-1.5">
                            <strong className="text-[1rem] leading-tight text-ink-strong dark:text-foreground">
                              {participant.displayName}
                            </strong>
                            <span className="text-[0.9rem] leading-relaxed text-muted-foreground">
                              {participant.id === host?.id
                                ? 'Host'
                                : ATTENDANCE_LABELS[event.attendanceStatuses[participant.id]]}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </Card>
                  {host ? (
                    <Card className="mt-4 rounded-2xl" styles={{ body: { padding: 14 } }}>
                      <div className="flex items-center gap-3">
                      <Avatar user={host} />
                      <div>
                        <strong className="text-ink-strong dark:text-foreground">{host.displayName}</strong>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {host.trustFlags.verifiedHost ? 'Verified host' : 'Standard host'} ·{' '}
                          {host.trustFlags.noShowStrikes} no-show strike(s)
                        </p>
                      </div>
                      </div>
                    </Card>
                  ) : null}
                </>
              ),
            },
            {
              key: 'location',
              label: (
                <span data-testid="tab-location" className="inline-flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>Map</span>
                </span>
              ),
              children: (
                <Card className="rounded-2xl" styles={{ body: { padding: 14 } }}>
                  <div className="inline-flex items-center gap-2 mb-3.5 text-[0.98rem] font-extrabold text-ink-strong dark:text-foreground">
                    <MapPin size={16} />
                    <span>Location</span>
                  </div>
                  <p className="mb-4 text-[0.88rem] leading-relaxed text-muted-foreground">{safeSafetyNote}</p>
                  <EventMap
                    compact
                    events={[event]}
                    selectedEventId={event.id}
                    userLocation={userLocation}
                    onSelectEvent={() => undefined}
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-[10px]">
                    <Tag className="m-0 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[0.8rem] font-semibold text-ink-strong dark:bg-white/20">
                      {event.location.label}
                    </Tag>
                    <Button
                      type="default"
                      size="small"
                      htmlType="button"
                      onClick={() => navigate(`/discover?focus=${event.id}`)}
                    >
                      View on map
                    </Button>
                  </div>
                </Card>
              ),
            },
            {
              key: 'chat',
              label: (
                <span data-testid="tab-chat" className="inline-flex items-center gap-1.5">
                  <MessageCircle size={14} />
                  <span>Chat</span>
                </span>
              ),
              children: (
                <Card className="rounded-2xl" styles={{ body: { padding: 14 } }}>
                  {!isAttending ? (
                    <div className="flex flex-col gap-4">
                      <p className="text-[0.88rem] leading-relaxed text-muted-foreground">
                        Join the session to access the group chat.
                      </p>
                      <Button className="w-full" htmlType="button" type="primary" onClick={handleChatEntry}>
                        Join session & open chat
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="inline-flex items-center gap-2 text-[0.98rem] font-extrabold text-ink-strong dark:text-foreground">
                        <Lock size={16} />
                        <span>You're in!</span>
                      </div>
                      <div className="flex flex-wrap gap-[10px]">
                        {(Object.entries(ATTENDANCE_LABELS) as Array<[AttendanceStatus, string]>).map(
                          ([status, label]) => (
                            <Button
                              key={status}
                              htmlType="button"
                              type={currentStatus === status ? 'primary' : 'default'}
                              size="small"
                              className="rounded-full border border-transparent px-3 py-1.5 text-sm font-bold"
                              onClick={() => handleAttendance(status)}
                            >
                              {label}
                            </Button>
                          ),
                        )}
                      </div>
                      <label className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[20px] border border-[rgba(112,95,163,0.14)] bg-white/68 p-4 dark:bg-white/10">
                        <div>
                          <span className="block text-sm font-medium">Reminder</span>
                          <p className="text-xs text-muted-foreground">Get notified when the session starts.</p>
                        </div>
                        <Switch
                          checked={reminderEnabled}
                          onChange={() => toggleReminder(event.id)}
                        />
                      </label>
                      <Button
                        htmlType="button"
                        type="primary"
                        onClick={handleChatEntry}
                      >
                        Open chat
                      </Button>
                    </div>
                  )}
                </Card>
              ),
            },
          ]}
        />

        <Card className="rounded-2xl" styles={{ body: { padding: 14 } }}>
          <div className="flex flex-wrap gap-[10px]">
            <Button
              type="default"
              htmlType="button"
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
                  type="default"
                  htmlType="button"
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
                  danger
                  htmlType="button"
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
          onCancel={() => setReportTarget(null)}
          onOk={handleSubmitReport}
          title={reportTarget ? `Report ${reportTarget.label}` : 'Report'}
          okText="Submit report"
          cancelText="Cancel"
        >
          <p className="mb-4 text-sm text-muted-foreground">
            This stays a frontend-only placeholder in the mock, but the flow is real.
          </p>
          <div className="flex flex-col gap-4">
            <label className="field">
              <span className="field__label">Reason</span>
              <Select
                value={reportReason}
                onChange={(value) => setReportReason(value)}
                options={REPORT_REASONS.map((reason) => ({
                  value: reason,
                  label: reason,
                }))}
              />
            </label>
            <label className="field">
              <span className="field__label">Notes</span>
              <Input.TextArea
                rows={4}
                value={reportNotes}
                onChange={(event) => setReportNotes(event.target.value)}
                placeholder="What feels unsafe or fake?"
              />
            </label>
          </div>
        </Modal>
      </main>
    </AppFrame>
  );
}
