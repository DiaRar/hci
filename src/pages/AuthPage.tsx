import { ArrowRight, Compass, Shield, UserRound } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

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
    <AppFrame showNav={false}>
      <main className="screen screen--auth">
        <Card className="hero-card hero-card--auth">
          <div className="hero-card__topline">
            <Badge className="hero-pill">
              <Compass size={14} />
              Nearby sports
            </Badge>
            <Badge variant="secondary" className="hero-pill hero-pill--subtle">
              <Shield size={14} />
              Text-only safety demo
            </Badge>
          </div>
          <h1>Sports near you, without guessing who will actually show up.</h1>
          <p>{HERO_TAGLINES[0]}</p>
          <div className="badge-row">
            {HIGHLIGHT_BADGES.map((badge) => (
              <Badge key={badge} variant="outline" className="soft-badge">
                {badge}
              </Badge>
            ))}
          </div>
        </Card>

        <Card className="auth-card">
          <div className="section-title">
            <UserRound size={16} />
            <span>Jump in fast</span>
          </div>
          <p className="helper-copy">
            Use a demo profile or create one with a visible display name so people know who is joining the session.
          </p>

          <div className="quick-user-list">
            {demoUsers.map((user) => (
              <button
                key={user.id}
                className="quick-user"
                type="button"
                onClick={() =>
                  authenticate({
                    displayName: user.displayName,
                    interests: user.interests,
                    nearbyDiscoveryEnabled: user.nearbyDiscoveryEnabled,
                  })
                }
              >
                <Avatar user={user} />
                <div>
                  <strong>{user.displayName}</strong>
                  <span>{user.interests.slice(0, 2).join(' · ')}</span>
                </div>
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">Display name</span>
              <Input
                type="text"
                placeholder="e.g. Noor"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </label>

            <div className="field">
              <div className="field__label-row">
                <span className="field__label">Interests</span>
                <span className="field__hint">Optional, but it improves your session feed.</span>
              </div>
              <div className="chip-grid">
                {INTEREST_OPTIONS.map((interest) => (
                  <Button
                    key={interest}
                    type="button"
                    variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
                    size="sm"
                    className="pill-button"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </div>

            <label className="switch-card">
              <div>
                <span className="field__label">Enable nearby discovery</span>
                <p className="field__hint">Open map mode keeps nearby sports sessions visible in your discover feed.</p>
              </div>
              <Switch
                checked={nearbyDiscoveryEnabled}
                onCheckedChange={setNearbyDiscoveryEnabled}
              />
            </label>

            <Button className="primary-button" type="submit">
              Enter Bubbleverse
              <ArrowRight size={16} />
            </Button>
          </form>
        </Card>
      </main>
    </AppFrame>
  );
}
