import { ArrowRight, Compass, Shield, UserRound } from 'lucide-react';
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
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Coffee', 'Tennis']);

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
        <section className="hero-card hero-card--auth">
          <div className="hero-card__topline">
            <span className="hero-pill">
              <Compass size={14} />
              Nearby bubbles
            </span>
            <span className="hero-pill hero-pill--subtle">
              <Shield size={14} />
              Text-only safety demo
            </span>
          </div>
          <h1>Plans near you, without guessing who will actually show up.</h1>
          <p>{HERO_TAGLINES[0]}</p>
          <div className="badge-row">
            {HIGHLIGHT_BADGES.map((badge) => (
              <span key={badge} className="soft-badge">
                {badge}
              </span>
            ))}
          </div>
        </section>

        <section className="glass-card auth-card">
          <div className="section-title">
            <UserRound size={16} />
            <span>Jump in fast</span>
          </div>
          <p className="helper-copy">
            Use a demo profile or create one with a visible display name so people know who is joining.
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
              <input
                className="text-field"
                type="text"
                placeholder="e.g. Sunday Tennis Alex"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </label>

            <div className="field">
              <div className="field__label-row">
                <span className="field__label">Interests</span>
                <span className="field__hint">Optional, but it improves your event feed.</span>
              </div>
              <div className="chip-grid">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    className={`pill-button${selectedInterests.includes(interest) ? ' is-active' : ''}`}
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
                <span className="field__label">Enable nearby discovery</span>
                <p className="field__hint">Open map mode keeps event pins visible in the discover feed.</p>
              </div>
              <input
                type="checkbox"
                checked={nearbyDiscoveryEnabled}
                onChange={(event) => setNearbyDiscoveryEnabled(event.target.checked)}
              />
              <span className="switch-card__toggle" aria-hidden="true" />
            </label>

            <button className="primary-button" type="submit">
              Enter Bubbleverse
              <ArrowRight size={16} />
            </button>
          </form>
        </section>
      </main>
    </AppFrame>
  );
}
