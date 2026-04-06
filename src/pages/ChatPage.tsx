import { Flag, SendHorizontal, UserPlus } from 'lucide-react';
import { Button, Card, Input, Modal, Select } from 'antd';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { cn } from '@/lib/utils';

import { AppFrame, PageHeader } from '../components/AppFrame';
import { Avatar } from '../components/Avatar';
import { CATEGORY_META } from '../lib/constants';
import { REPORT_REASONS } from '../lib/constants';
import { useBubbleStore } from '../store/BubbleStore';

export function ChatPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const {
    currentUser,
    events,
    messages,
    users,
    joinEvent,
    sendMessage,
    submitReport,
  } = useBubbleStore();
  const event = events.find((entry) => entry.id === eventId);
  const currentUserId = currentUser?.id;
  const [draft, setDraft] = useState('');
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportNotes, setReportNotes] = useState('');
  const scrollAnchor = useRef<HTMLDivElement | null>(null);

  const eventMessages = messages.filter((message) => message.eventId === eventId);
  const blockedIds = currentUser?.trustFlags.blockedUserIds ?? [];
  const isAttending = currentUserId
    ? event?.attendeeIds.includes(currentUserId)
    : false;
  const hasReadableTitle = event ? /[A-Za-z0-9]/.test(event.title ?? '') : false;
  const chatTitle = event
    ? hasReadableTitle
      ? event.title
      : `${CATEGORY_META[event.category].label} session`
    : 'Chat';
  const attendeeLabel = event?.attendeeIds.length === 1 ? 'player' : 'players';

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: 'smooth' });
  }, [eventMessages.length]);

  if (!event) {
    return (
      <AppFrame showBottomNav={false}>
        <main className="flex-1 flex flex-col gap-4 p-5 pb-8">
          <PageHeader
            title="Chat unavailable"
            subtitle="The session behind this chat no longer exists."
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

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    sendMessage(event.id, draft);
    setDraft('');
  };

  const handleReport = () => {
    if (!reportingMessageId) {
      return;
    }

    submitReport({
      targetType: 'message',
      targetId: reportingMessageId,
      reason: reportReason,
      notes: reportNotes,
    });
    setReportingMessageId(null);
    setReportNotes('');
  };

  return (
    <AppFrame showBottomNav={false}>
      <main className="flex-1 flex flex-col gap-4 p-5 pb-8 min-h-0">
        <PageHeader
          title={chatTitle}
          subtitle={`${event.attendeeIds.length} ${attendeeLabel}`}
          backTo={`/chats`}
        />

        {!isAttending ? (
          <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
            <UserPlus size={20} className="text-amber-600 shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold">Join to chat</h3>
              <p className="mt-1 text-[0.88rem] leading-relaxed text-muted-foreground">
                Join the session to participate in the group chat.
              </p>
            </div>
            <Button
              htmlType="button"
              type="primary"
              onClick={() => joinEvent(event.id)}
            >
              Join
            </Button>
          </Card>
        ) : null}

        <div className="flex-1 min-h-0 flex flex-col gap-3">
          <div className="scrollbar-thin flex min-h-[260px] flex-1 flex-col gap-3 overflow-auto pr-1">
            {eventMessages.length > 0 ? (
              eventMessages.map((message) => {
                const sender = users.find((user) => user.id === message.senderId);
                const isOwnMessage = message.senderId === currentUserId;
                const isBlocked = blockedIds.includes(message.senderId);

                if (!sender) {
                  return null;
                }

                if (isBlocked && !isOwnMessage) {
                  return (
                    <div
                      key={message.id}
                      className="flex justify-center"
                    >
                      <div className="max-w-[78%] rounded-[20px] bg-[color:var(--surface-strong)] px-4 py-2 text-center text-sm text-muted-foreground">
                        Message hidden
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex items-end gap-[10px]',
                      'group',
                      isOwnMessage && 'justify-end'
                    )}
                  >
                    {!isOwnMessage && <Avatar user={sender} size="sm" />}
                    <div className="flex max-w-[75%] flex-col gap-1">
                      {!isOwnMessage && (
                        <span className="text-xs font-semibold text-muted-foreground ml-1">
                          {sender.displayName}
                        </span>
                      )}
                      <article
                        className={cn(
                          'rounded-[20px] bg-[color:var(--surface-strong)] p-3 text-ink-strong shadow-[var(--shadow-soft)]',
                          isOwnMessage &&
                            'bg-[image:var(--gradient-cta)] text-primary-foreground',
                          message.demoModerationState === 'flagged' &&
                            'border border-[rgba(217,111,111,0.18)]'
                        )}
                      >
                        <p className="text-sm">{message.text}</p>
                      </article>
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        {new Intl.DateTimeFormat('en', {
                          hour: 'numeric',
                          minute: '2-digit',
                        }).format(new Date(message.createdAt))}
                        {message.demoModerationState === 'flagged' && ' · Flagged'}
                      </span>
                    </div>
                    {!isOwnMessage && (
                      <Button
                        type="text"
                        shape="circle"
                        size="small"
                        htmlType="button"
                        onClick={() => setReportingMessageId(message.id)}
                        aria-label="Report message"
                      >
                        <Flag size={12} />
                      </Button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[0.88rem] leading-relaxed text-muted-foreground">
                  No messages yet. Say hi!
                </p>
              </div>
            )}
            <div ref={scrollAnchor} />
          </div>

          {isAttending && (
            <form onSubmit={handleSubmit} className="shrink-0">
              <div className="rounded-[20px] border border-[rgba(44,44,44,0.22)] bg-[color:var(--surface-strong)] p-3">
                <div className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  type="text"
                  placeholder="Message the group..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
                <Button
                  htmlType="submit"
                  type="primary"
                  shape="circle"
                  className="!h-11 !w-11 !min-w-11 !p-0 !shadow-[4px_4px_0_#2C2C2C]"
                  icon={<SendHorizontal size={16} />}
                  aria-label="Send message"
                />
                </div>
              </div>
            </form>
          )}
        </div>

        <Modal
          open={Boolean(reportingMessageId)}
          onCancel={() => setReportingMessageId(null)}
          onOk={handleReport}
          title="Report message"
          okText="Submit"
          cancelText="Cancel"
        >
          <p className="mb-4 text-sm text-muted-foreground">
            Reports are stored locally to demonstrate the flow.
          </p>
          <div className="flex flex-col gap-4">
            <label className="field">
              <span className="mb-1.5 block text-sm font-medium">Reason</span>
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
              <span className="mb-1.5 block text-sm font-medium">Notes</span>
              <Input.TextArea
                rows={3}
                value={reportNotes}
                onChange={(event) => setReportNotes(event.target.value)}
                placeholder="Explain what happened."
              />
            </label>
          </div>
        </Modal>
      </main>
    </AppFrame>
  );
}
