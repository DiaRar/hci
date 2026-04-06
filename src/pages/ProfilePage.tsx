import { Download, LogOut, ShieldAlert, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { Button, Card, Checkbox, Input, Modal, Select, Switch, Tag, Typography } from 'antd';
import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';

import { AppFrame, PageHeader } from '../components/AppFrame';
import { Avatar } from '../components/Avatar';
import { CATEGORY_META, REPORT_REASONS } from '../lib/constants';
import { formatCurrency, formatEventWindow } from '../lib/format';
import { useAnimatedNavigate } from '../lib/useAnimatedNavigate';
import { useBubbleStore } from '../store/BubbleStore';
import type { Event, ProfilePatch, ReportTargetType, User } from '../types';

type ReportTarget = {
  type: ReportTargetType;
  id: string;
  label: string;
};

function isReadableTitle(title: string): boolean {
  return /[A-Za-z0-9]/.test(title);
}

export function ProfilePage() {
  const navigate = useAnimatedNavigate();
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
    signOut,
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
        <main className="flex-1 flex flex-col gap-4 p-5 pb-8">
          <PageHeader
            title="Profile missing"
            subtitle="This user may have deleted their demo account."
            backTo="/discover"
          />
          <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center rounded-2xl">
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

  const hostedEvents = events.filter((event) => event.hostId === profile.id);
  const joinedEvents = events.filter(
    (event) =>
      event.attendeeIds.includes(profile.id) && event.hostId !== profile.id,
  );
  const sortedHostedEvents = [...hostedEvents].sort(
    (left, right) =>
      new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
  );
  const sortedJoinedEvents = [...joinedEvents].sort(
    (left, right) =>
      new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
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
      <main className="scrollbar-thin flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto p-5 pb-8">
        <PageHeader
          title={isOwnProfile ? 'Your profile' : 'Profile'}
          subtitle={
            isOwnProfile
              ? 'Edit how you appear in the app and manage your mock GDPR actions.'
              : `See who ${profile.displayName} is before you join their session.`
          }
          backTo="/discover"
        />

        <Card className="rounded-2xl" styles={{ body: { padding: 16 } }}>
          <div className="flex items-start gap-3">
            <Avatar user={profile} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-serif text-[2rem] leading-tight tracking-tight text-ink-strong dark:text-foreground">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.trustFlags.verifiedHost ? (
              <Tag className="m-0 inline-flex items-center gap-1.5 rounded-full bg-[rgba(107,92,255,0.12)] px-3 py-1.5 text-[0.78rem] font-semibold text-primary">
                <ShieldCheck size={13} />
                Verified host
              </Tag>
            ) : null}
            <Tag className="m-0 rounded-full bg-white/70 px-3 py-1.5 text-[0.78rem] font-semibold text-ink-strong dark:bg-white/20">
              {profile.interests.length} interests
            </Tag>
            <Tag className="m-0 rounded-full bg-white/70 px-3 py-1.5 text-[0.78rem] font-semibold text-ink-strong dark:bg-white/20">
              {profile.friends.length} friends
            </Tag>
            <Tag className="m-0 rounded-full bg-white/70 px-3 py-1.5 text-[0.78rem] font-semibold text-ink-strong dark:bg-white/20">
              {profile.trustFlags.noShowStrikes} no-show strikes
            </Tag>
          </div>
        </Card>

        {isOwnProfile ? (
          <div className="flex flex-col gap-4">
            <OwnProfileEditor
              key={profile.id}
              profile={profile}
              onSave={updateProfile}
            />

            <Card className="rounded-2xl" styles={{ body: { padding: 16 } }}>
              <div className="mb-3.5 inline-flex items-center gap-2 font-extrabold text-red-600 dark:text-red-400">
                <ShieldAlert size={16} />
                <span>Danger zone</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Account actions are local-only in this prototype, but this flow mimics production controls.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  type="default"
                  htmlType="button"
                  className="!justify-start"
                  onClick={handleExport}
                >
                  <Download size={14} />
                  Export my data
                </Button>
                <Button
                  danger
                  htmlType="button"
                  className="!justify-start"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={14} />
                  Delete account
                </Button>
                <Button
                  type="default"
                  htmlType="button"
                  className="!justify-start sm:col-span-2"
                  onClick={signOut}
                >
                  <LogOut size={14} />
                  Sign out
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="rounded-2xl" styles={{ body: { padding: 16 } }}>
            <div className="mb-4 flex flex-wrap gap-[10px]">
              <Button
                htmlType="button"
                type="primary"
                onClick={() => toggleFriend(profile.id)}
              >
                <UserPlus size={14} />
                {isFriend ? 'Remove friend' : 'Add friend'}
              </Button>
              <Button
                type="default"
                htmlType="button"
                onClick={() =>
                  setReportTarget({
                    type: 'user',
                    id: profile.id,
                    label: profile.displayName,
                  })
                }
              >
                Report user
              </Button>
              <Button
                type="default"
                htmlType="button"
                onClick={() => blockUser(profile.id)}
              >
                Block user
              </Button>
            </div>
            <div className="flex flex-wrap gap-[10px]">
              {profile.languages.map((language) => (
                <Tag
                  key={language}
                  className="m-0 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[0.8rem] font-semibold text-ink-strong dark:bg-white/20"
                >
                  {language}
                </Tag>
              ))}
              {profile.interests.map((interest) => (
                <Tag
                  key={interest}
                  className="m-0 inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,205,137,0.22)] px-3 py-1.5 text-[0.8rem] font-semibold text-[#8d5f48] dark:bg-[rgba(255,224,181,0.58)] dark:text-[var(--accent-foreground)]"
                >
                  {interest}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {hostedEvents.length > 0 ? (
          <section className="flex flex-col gap-[14px]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="mb-1 block text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Hosted
                </p>
                <h2 className="font-serif text-2xl tracking-tight text-ink-strong dark:text-foreground">
                  {profile.displayName.split(' ')[0]}'s sessions
                </h2>
              </div>
            </div>
            <div className="flex flex-col gap-[14px]">
              {sortedHostedEvents.slice(0, 3).map((event) => (
                <ProfileSessionCard
                  key={event.id}
                  event={event}
                  onOpen={() => navigate(`/event/${event.id}`)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {joinedEvents.length > 0 ? (
          <section className="flex flex-col gap-[14px]">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="mb-1 block text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Joined
                </p>
                <h2 className="font-serif text-2xl tracking-tight text-ink-strong dark:text-foreground">
                  Upcoming sessions
                </h2>
              </div>
            </div>
            <div className="flex flex-col gap-[14px]">
              {sortedJoinedEvents.slice(0, 3).map((event) => (
                <ProfileSessionCard
                  key={event.id}
                  event={event}
                  onOpen={() => navigate(`/event/${event.id}`)}
                />
              ))}
            </div>
          </section>
        ) : null}

        <Modal
          open={deleteOpen}
          onCancel={() => setDeleteOpen(false)}
          onOk={handleDelete}
          okButtonProps={{ danger: true }}
          okText="Delete"
          cancelText="Cancel"
          title="Delete account"
        >
          <p className="text-[0.88rem] leading-relaxed text-muted-foreground">
            This removes your local profile, hosted events, attendance, and messages from the mock store.
          </p>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-muted-foreground">
            This is the demo version of the right to be forgotten flow.
          </p>
        </Modal>

        <Modal
          open={Boolean(reportTarget)}
          onCancel={() => setReportTarget(null)}
          onOk={handleReport}
          title={reportTarget ? `Report ${reportTarget.label}` : 'Report user'}
          okText="Submit report"
          cancelText="Cancel"
        >
          <p className="mb-4 text-sm text-muted-foreground">
            Reports are stored locally to demonstrate the flow.
          </p>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="block text-sm font-medium">Reason</span>
              <Select
                value={reportReason}
                onChange={(value) => setReportReason(value)}
                options={REPORT_REASONS.map((reason) => ({
                  value: reason,
                  label: reason,
                }))}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="block text-sm font-medium">Notes</span>
              <Input.TextArea
                rows={4}
                value={reportNotes}
                onChange={(event) => setReportNotes(event.target.value)}
              />
            </label>
          </div>
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
    <form className="flex flex-col gap-4" onSubmit={handleSave}>
      <Card className="rounded-2xl" styles={{ body: { padding: 16 } }}>
        <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="block text-sm font-bold text-ink-strong dark:text-foreground">
            Display name
          </span>
          <Input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Bio</span>
          <Input.TextArea
            rows={4}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Languages</span>
          <Input
            type="text"
            value={languages}
            onChange={(event) => setLanguages(event.target.value)}
            placeholder="English, Dutch"
          />
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="block text-sm font-bold text-ink-strong dark:text-foreground">
              Interests
            </span>
            <span className="text-[0.78rem] font-medium text-muted-foreground">
              These show up in the profile and auth flow.
            </span>
          </div>
          {([
            ['Sports', ['Tennis', 'Padel', 'Football', 'Basketball', 'Running', 'Volleyball', 'Badminton']],
            ['Fitness', ['Cycling', 'Training', 'Gym', 'Mobility', 'Recovery']],
          ] as [string, string[]][]).map(([group, items]) => (
            <div key={group} className="mb-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {group}
              </p>
              <Checkbox.Group
                value={interests}
                onChange={(values) => setInterests(values as string[])}
                className="grid grid-cols-2 gap-x-3 gap-y-2"
              >
                {items.map((interest) => (
                  <Checkbox key={interest} value={interest} className="!mr-0">
                    <span className="text-sm font-medium">{interest}</span>
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </div>
          ))}
        </div>
        <label className="grid grid-cols-[1fr_auto] items-center gap-3 p-4 rounded-[20px] border border-[rgba(112,95,163,0.14)] bg-white/68 dark:bg-white/10">
          <div>
            <span className="block text-sm font-bold text-ink-strong dark:text-foreground">
              Nearby discovery
            </span>
            <p className="mt-0.5 text-[0.78rem] font-medium text-muted-foreground">
              Open-map visibility is opt-in on the profile.
            </p>
          </div>
          <Switch
            checked={nearbyDiscoveryEnabled}
            onChange={setNearbyDiscoveryEnabled}
          />
        </label>
        {savedMessage ? (
          <p className="text-[0.88rem] leading-relaxed text-success">{savedMessage}</p>
        ) : null}
        <Button htmlType="submit" type="primary" className="!w-full !shadow-[4px_4px_0_#2C2C2C]">
          Save profile
        </Button>
        </div>
      </Card>
    </form>
  );
}

function ProfileSessionCard({
  event,
  onOpen,
}: {
  event: Event;
  onOpen: () => void;
}) {
  const category = CATEGORY_META[event.category];
  const title = isReadableTitle(event.title)
    ? event.title
    : `${category.label} session`;

  return (
    <Card
      hoverable
      className="cursor-pointer rounded-2xl"
      styles={{ body: { padding: 14 } }}
      onClick={onOpen}
    >
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <Tag className="m-0 rounded-full bg-[rgba(107,92,255,0.12)] px-2.5 py-1 text-[0.78rem] font-semibold text-primary">
          {category.emoji} {category.label}
        </Tag>
        <Tag className="m-0 rounded-full bg-white/70 px-2.5 py-1 text-[0.78rem] font-semibold text-ink-strong dark:bg-white/20">
          {event.attendeeIds.length} {event.attendeeIds.length === 1 ? 'player' : 'players'}
        </Tag>
      </div>

      <Typography.Title
        level={4}
        className="!mb-1 !text-[1.1rem] !leading-snug !tracking-tight !text-ink-strong dark:!text-foreground"
        ellipsis={{ rows: 1 }}
      >
        {title}
      </Typography.Title>
      <Typography.Paragraph
        className="!mb-2.5 !text-sm !text-muted-foreground"
        ellipsis={{ rows: 2 }}
      >
        {event.description}
      </Typography.Paragraph>

      <div className="grid gap-1.5">
        <Typography.Text className="!text-[0.86rem] !text-muted-foreground">
          {formatEventWindow(event.startTime, event.durationMinutes)}
        </Typography.Text>
        <Typography.Text className="!text-[0.86rem] !text-muted-foreground">
          {event.location.label}
        </Typography.Text>
        <Typography.Text className="!text-[0.86rem] !text-muted-foreground">
          {formatCurrency(event.price)} · {event.skillLevel.replaceAll('_', ' ')}
        </Typography.Text>
      </div>
    </Card>
  );
}
