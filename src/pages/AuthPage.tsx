import { ArrowRight, Compass, Shield, UserRound } from 'lucide-react';
import { Button, Card, Input, Switch, Tag, Typography } from 'antd';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppFrame } from '../components/AppFrame';
import { Avatar } from '../components/Avatar';
import { HERO_TAGLINES, HIGHLIGHT_BADGES, INTEREST_OPTIONS } from '../lib/constants';
import { useBubbleStore } from '../store/BubbleStore';

export function AuthPage() {
  const navigate = useNavigate();
  const { authenticate, currentUser, users } = useBubbleStore();
  const [displayName, setDisplayName] = useState('');
  const [nearbyDiscoveryEnabled, setNearbyDiscoveryEnabled] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Tennis', 'Running']);

  useEffect(() => {
    if (currentUser) {
      navigate('/discover', { replace: true });
    }
  }, [currentUser, navigate]);

  const demoUsers = users.slice(0, 4);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((entry) => entry !== interest)
        : [...current, interest],
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    authenticate({
      displayName,
      interests: selectedInterests,
      nearbyDiscoveryEnabled,
    });
  };

  return (
    <AppFrame>
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-5 pb-6">
        <Card className="relative overflow-hidden rounded-2xl" styles={{ body: { padding: 16 } }}>
          <div className="flex flex-wrap gap-[10px] mb-4">
            <Tag className="m-0 inline-flex items-center gap-2 rounded-full bg-accent-purple-light px-3.5 py-2.5 text-[0.86rem] font-bold text-primary">
              <Compass size={14} />
              Nearby sports
            </Tag>
            <Tag className="m-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full text-[0.86rem] font-bold bg-[rgba(255,212,150,0.22)] text-[#8d5f48]">
              <Shield size={14} />
              Text-only safety demo
            </Tag>
          </div>
          <h1 className="font-serif text-[2.3rem] leading-tight tracking-tight text-ink-strong dark:text-foreground">
            Sports near you, without guessing who will actually show up.
          </h1>
          <p className="mt-2.5 text-[0.95rem] leading-relaxed text-muted-foreground">
            {HERO_TAGLINES[0]}
          </p>
          <div className="flex flex-wrap gap-[10px] mt-4">
            {HIGHLIGHT_BADGES.map((badge) => (
              <Tag
                key={badge}
                className="m-0 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-2 text-[0.8rem] font-bold text-ink-strong dark:bg-white/20"
              >
                {badge}
              </Tag>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl" styles={{ body: { padding: 16 } }}>
          <div className="mb-2 inline-flex items-center gap-2 text-[0.98rem] font-extrabold text-ink-strong dark:text-foreground">
            <UserRound size={16} />
            <span>Jump in fast</span>
          </div>
          <p className="mb-4 text-[0.88rem] leading-relaxed text-muted-foreground">
            Use a demo profile or create one with a visible display name so people know who is joining the session.
          </p>

          <div className="mb-5 grid gap-[10px]">
            {demoUsers.map((user) => (
              <Button
                key={user.id}
                data-testid={`btn-demo-user-${user.id}`}
                type="default"
                htmlType="button"
                className="!h-auto !w-full !justify-start !px-3 !py-2"
                onClick={() =>
                  authenticate({
                    displayName: user.displayName,
                    interests: user.interests,
                    nearbyDiscoveryEnabled: user.nearbyDiscoveryEnabled,
                  })
                }
              >
                <div className="flex w-full items-center gap-3 text-left">
                  <Avatar user={user} />
                  <div className="min-w-0 flex-1">
                    <Typography.Text className="!block !truncate !font-semibold !text-ink-strong dark:!text-foreground">
                      {user.displayName}
                    </Typography.Text>
                    <Typography.Text className="!text-[0.82rem] !text-muted-foreground">
                      {user.interests.slice(0, 2).join(' · ')}
                    </Typography.Text>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <form className="flex flex-col gap-4 border-t border-[rgba(44,44,44,0.14)] pt-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-bold text-ink-strong dark:text-foreground">Display name</span>
              <Input
                type="text"
                placeholder="e.g. Noor"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </label>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink-strong dark:text-foreground">Interests</span>
                <span className="text-[0.78rem] font-medium text-muted-foreground">
                  Optional, but it improves your session feed.
                </span>
              </div>
              <div className="flex flex-wrap gap-[10px]">
                {INTEREST_OPTIONS.map((interest) => (
                  <Button
                    key={interest}
                    htmlType="button"
                    type={selectedInterests.includes(interest) ? 'primary' : 'default'}
                    size="small"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2.5 text-[0.86rem] font-bold"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </div>

            <label className="grid grid-cols-[1fr_auto] items-center gap-3 p-4 rounded-[20px] border border-[rgba(112,95,163,0.14)] bg-white/68 dark:bg-white/10">
              <div>
                <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Enable nearby discovery</span>
                <p className="mt-0.5 text-[0.78rem] font-medium text-muted-foreground">Open map mode keeps nearby sports sessions visible in your discover feed.</p>
              </div>
              <Switch
                checked={nearbyDiscoveryEnabled}
                onChange={setNearbyDiscoveryEnabled}
              />
            </label>

            <Button htmlType="submit" type="primary" className="!w-full !shadow-[4px_4px_0_#2C2C2C]">
              Enter Bubbleverse
              <ArrowRight size={16} />
            </Button>
          </form>
        </Card>
      </main>
    </AppFrame>
  );
}
