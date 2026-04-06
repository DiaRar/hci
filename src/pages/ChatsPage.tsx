import { MessageCircle } from 'lucide-react';
import { Button, Card, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

import { CATEGORY_META } from '@/lib/constants';
import { formatClock } from '@/lib/format';
import { AppFrame, PageHeader } from '../components/AppFrame';
import { AvatarStack } from '../components/Avatar';
import { useBubbleStore } from '../store/BubbleStore';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
  return `${Math.floor(diffMins / 1440)}d`;
}

function isReadableTitle(title: string): boolean {
  return /[A-Za-z0-9]/.test(title);
}

function formatPlayerLabel(count: number): string {
  return `${count} ${count === 1 ? 'player' : 'players'}`;
}

export function ChatsPage() {
  const navigate = useNavigate();
  const { currentUser, events, users, messages } = useBubbleStore();

  const joinedEvents = events.filter(
    (event) =>
      event.attendeeIds.includes(currentUser?.id ?? '') &&
      event.hostId !== currentUser?.id,
  );

  const hostedEvents = events.filter(
    (event) => event.hostId === currentUser?.id,
  );

  const lastMessageByEventId = messages.reduce(
    (map, message) => {
      const existing = map.get(message.eventId);
      if (!existing || new Date(message.createdAt) > new Date(existing.createdAt)) {
        map.set(message.eventId, message);
      }
      return map;
    },
    new Map<string, (typeof messages)[number]>(),
  );

  const myEvents = [...hostedEvents, ...joinedEvents].sort((left, right) => {
    const leftActivity = lastMessageByEventId.get(left.id)?.createdAt ?? left.startTime;
    const rightActivity = lastMessageByEventId.get(right.id)?.createdAt ?? right.startTime;
    return new Date(rightActivity).getTime() - new Date(leftActivity).getTime();
  });

  return (
    <AppFrame>
      <main className="flex-1 flex flex-col gap-4 p-5 pb-8">
        <PageHeader
          title="Chats"
          subtitle="Jump into any session conversation."
        />

        {myEvents.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <MessageCircle size={40} className="mx-auto text-muted-foreground" />
            <h2>No chats yet</h2>
            <p>Join a session to start chatting with other players.</p>
            <Button
              size="small"
              htmlType="button"
              type="primary"
              onClick={() => navigate('/discover')}
            >
              Discover sessions
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-[14px]">
              {myEvents.map((event) => {
                const host = users.find((u) => u.id === event.hostId);
                const attendees = users.filter((u) =>
                  event.attendeeIds.includes(u.id),
                );
                const category = CATEGORY_META[event.category];
                const lastMessage = lastMessageByEventId.get(event.id) ?? null;
                const lastSender = lastMessage
                  ? users.find((u) => u.id === lastMessage.senderId)
                  : null;
                const safeTitle = isReadableTitle(event.title)
                  ? event.title
                  : `${category?.label ?? 'Session'} chat`;

                return (
                  <Card
                    key={event.id}
                    hoverable
                    className="cursor-pointer rounded-2xl"
                    styles={{ body: { padding: 14 } }}
                    onClick={() => navigate(`/chat/${event.id}`)}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl bg-white text-[1.45rem] dark:bg-white/20">
                        {category?.emoji ?? '🏅'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-start justify-between gap-2">
                          <Typography.Title
                            level={4}
                            className="!m-0 !text-[1.05rem] !leading-snug !tracking-tight !text-ink-strong dark:!text-foreground"
                            ellipsis={{ rows: 1 }}
                          >
                            {safeTitle}
                          </Typography.Title>
                          {lastMessage && (
                            <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">
                              {formatRelativeTime(lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        {lastMessage && lastSender ? (
                          <Typography.Text
                            className="!block !text-sm !text-muted-foreground"
                            ellipsis={{ tooltip: `${lastSender.displayName}: ${lastMessage.text}` }}
                          >
                            <span className="font-semibold text-foreground">{lastSender.displayName}:</span>{' '}
                            {lastMessage.text}
                          </Typography.Text>
                        ) : (
                          <Typography.Text className="!text-sm !text-muted-foreground">
                            {formatClock(event.startTime)} · {host?.displayName ?? 'Unknown host'}
                          </Typography.Text>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <AvatarStack users={attendees} limit={3} />
                      <Tag className="m-0 rounded-full bg-[rgba(107,92,255,0.14)] px-3 py-1.5 text-[0.8rem] font-semibold text-primary dark:bg-[rgba(107,92,255,0.25)]">
                        {formatPlayerLabel(event.attendeeIds.length)}
                      </Tag>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </AppFrame>
  );
}
