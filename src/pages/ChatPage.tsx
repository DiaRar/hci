import { Flag, Lock, SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { AppFrame, PageHeader } from '../components/AppFrame';
import { Avatar } from '../components/Avatar';
import { Modal } from '../components/Modal';
import { REPORT_REASONS } from '../lib/constants';
import { useBubbleStore } from '../store/BubbleStore';

export function ChatPage() {
  const { eventId } = useParams();
  const { currentUser, events, messages, users, joinEvent, sendMessage, submitReport } =
    useBubbleStore();
  const event = events.find((entry) => entry.id === eventId);
  const currentUserId = currentUser?.id;
  const [draft, setDraft] = useState('');
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportNotes, setReportNotes] = useState('');
  const scrollAnchor = useRef<HTMLDivElement | null>(null);

  const eventMessages = messages.filter((message) => message.eventId === eventId);
  const blockedIds = currentUser?.trustFlags.blockedUserIds ?? [];
  const isAttending = currentUserId ? event?.attendeeIds.includes(currentUserId) : false;

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: 'smooth' });
  }, [eventMessages.length]);

  if (!event) {
    return (
      <AppFrame>
        <main className="screen">
          <PageHeader
            title="Chat unavailable"
            subtitle="The session behind this chat no longer exists."
            backTo="/discover"
          />
          <Card className="empty-state">
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
    <AppFrame>
      <main className="screen screen--chat">
        <PageHeader
          title="Session chat"
          subtitle="Text-only team chat with demo moderation markers."
          backTo={`/event/${event.id}`}
          action={
            <Badge variant="outline" className="soft-badge">
              <Lock size={12} />
              Encrypted badge
            </Badge>
          }
        />

        {!isAttending ? (
          <Card className="notice-card">
            <div>
              <h2>Join first</h2>
              <p>
                You can read the flow, but joining adds you to the attendee list before
                you send messages.
              </p>
            </div>
            <Button
              className="primary-button primary-button--compact"
              type="button"
              onClick={() => joinEvent(event.id)}
            >
              Join session
            </Button>
          </Card>
        ) : null}

        <Card className="chat-stream">
          <div className="chat-stream__header">
            <div>
              <p className="eyebrow">{event.title}</p>
              <h2>{event.attendeeIds.length} people in chat</h2>
            </div>
            <span className="helper-copy">Photos and calls stay disabled in this version.</span>
          </div>

          <div className="message-list">
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
                    <div key={message.id} className="message-row message-row--system">
                      <div className="message-bubble message-bubble--muted">
                        Message hidden from a blocked user.
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`message-row${isOwnMessage ? ' message-row--own' : ''}`}
                  >
                    {!isOwnMessage ? <Avatar user={sender} size="sm" /> : null}
                    <article
                      className={`message-bubble${isOwnMessage ? ' message-bubble--own' : ''}${
                        message.demoModerationState === 'flagged'
                          ? ' message-bubble--flagged'
                          : ''
                      }`}
                    >
                      <div className="message-bubble__meta">
                        <strong>{sender.displayName}</strong>
                        <span>
                          {new Intl.DateTimeFormat('en', {
                            hour: 'numeric',
                            minute: '2-digit',
                          }).format(new Date(message.createdAt))}
                        </span>
                      </div>
                      <p>{message.text}</p>
                      <div className="message-bubble__actions">
                        {message.demoModerationState === 'flagged' ? (
                          <Badge variant="destructive" className="soft-badge soft-badge--danger">
                            Flagged by demo moderation
                          </Badge>
                        ) : null}
                        {!isOwnMessage ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-button"
                            type="button"
                            onClick={() => setReportingMessageId(message.id)}
                          >
                            <Flag size={12} />
                            Report
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  </div>
                );
              })
            ) : (
              <div className="message-row message-row--system">
                <div className="message-bubble message-bubble--muted">
                  No messages yet. Say hi first.
                </div>
              </div>
            )}
            <div ref={scrollAnchor} />
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="composer">
            <Input
              className="composer__input"
              type="text"
              placeholder="Type a message for the group..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <Button className="primary-button composer__button" type="submit">
              <SendHorizontal size={16} />
            </Button>
          </Card>
        </form>

        <Modal
          open={Boolean(reportingMessageId)}
          title="Report message"
          description="This mock records the report locally so the trust/safety flow is tangible."
          onClose={() => setReportingMessageId(null)}
          footer={
            <>
              <Button
                variant="outline"
                className="secondary-button"
                type="button"
                onClick={() => setReportingMessageId(null)}
              >
                Cancel
              </Button>
              <Button
                className="primary-button primary-button--compact"
                type="button"
                onClick={handleReport}
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
              placeholder="Explain what happened."
            />
          </label>
        </Modal>
      </main>
    </AppFrame>
  );
}
