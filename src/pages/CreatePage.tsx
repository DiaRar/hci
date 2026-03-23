import { MapPinned, Rocket, ShieldCheck } from 'lucide-react';
import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppFrame, PageHeader } from '../components/AppFrame';
import { EventMap } from '../components/EventMap';
import {
  CATEGORY_META,
  EQUIPMENT_OPTIONS,
  FACILITY_OPTIONS,
  SKILL_LEVELS,
} from '../lib/constants';
import { toLocalDateTimeInputValue } from '../lib/format';
import { useBubbleStore } from '../store/BubbleStore';
import type { CategoryId, EventLocation, SkillLevel } from '../types';

export function CreatePage() {
  const navigate = useNavigate();
  const { createEvent, events, userLocation } = useBubbleStore();
  const [category, setCategory] = useState<CategoryId>('coffee');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(toLocalDateTimeInputValue());
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [price, setPrice] = useState(0);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('open');
  const [womenOnly, setWomenOnly] = useState(false);
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [extraFacilities, setExtraFacilities] = useState<string[]>(['Wi-Fi']);
  const [location, setLocation] = useState<EventLocation>({
    label: userLocation.label,
    lat: userLocation.lat,
    lng: userLocation.lng,
  });
  const [errorMessage, setErrorMessage] = useState('');

  const toggleListValue = (
    value: string,
    setter: Dispatch<SetStateAction<string[]>>,
  ) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !startTime || !location.label.trim()) {
      setErrorMessage('Title, description, start time, and location are required.');
      return;
    }

    const eventId = createEvent({
      title,
      description,
      category,
      startTime: new Date(startTime).toISOString(),
      durationMinutes,
      price,
      skillLevel,
      womenOnly,
      requiredEquipment,
      extraFacilities,
      location,
    });

    if (!eventId) {
      setErrorMessage('You need an active session before launching a bubble.');
      return;
    }

    navigate(`/event/${eventId}`);
  };

  return (
    <AppFrame>
      <main className="screen">
        <PageHeader
          title="Create bubble"
          subtitle="Every must-have field is visible up front so a new user can publish fast."
          backTo="/discover"
        />

        <section className="glass-card create-intro">
          <div>
            <p className="eyebrow">Checklist</p>
            <h2>Pin it, title it, launch it.</h2>
            <p>
              Category, title, description, start time, and location are required.
              Price, duration, equipment, and facilities make the event easier to trust.
            </p>
          </div>
          <div className="soft-badge">
            <ShieldCheck size={12} />
            Text, map, and attendee transparency only
          </div>
        </section>

        <form className="stack" onSubmit={handleSubmit}>
          <section className="glass-card">
            <div className="section-title">
              <Rocket size={16} />
              <span>Choose a vibe</span>
            </div>
            <div className="chip-grid chip-grid--categories">
              {Object.entries(CATEGORY_META).map(([id, meta]) => (
                <button
                  key={id}
                  className={`category-chip${category === id ? ' is-active' : ''}`}
                  type="button"
                  onClick={() => setCategory(id as CategoryId)}
                >
                  <span className="category-chip__emoji">{meta.emoji}</span>
                  <span>{meta.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="glass-card form-card">
            <label className="field">
              <span className="field__label">Title</span>
              <input
                className="text-field"
                type="text"
                placeholder="e.g. Sunday coffee sprint"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="field__label">Details</span>
              <textarea
                className="text-field text-field--textarea"
                rows={4}
                placeholder="What is the plan, what should people bring, and what makes the event feel safe?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>

            <div className="form-grid">
              <label className="field">
                <span className="field__label">Start time</span>
                <input
                  className="text-field"
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span className="field__label">Duration (minutes)</span>
                <input
                  className="text-field"
                  type="number"
                  min="30"
                  step="15"
                  value={durationMinutes}
                  onChange={(event) => setDurationMinutes(Number(event.target.value))}
                />
              </label>
            </div>

            <div className="form-grid">
              <label className="field">
                <span className="field__label">Price</span>
                <input
                  className="text-field"
                  type="number"
                  min="0"
                  step="5"
                  value={price}
                  onChange={(event) => setPrice(Number(event.target.value))}
                />
              </label>

              <label className="field">
                <span className="field__label">Skill level</span>
                <select
                  className="select-field"
                  value={skillLevel}
                  onChange={(event) => setSkillLevel(event.target.value as SkillLevel)}
                >
                  {SKILL_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="switch-card">
              <div>
                <span className="field__label">Women-only bubble</span>
                <p className="field__hint">
                  Inclusive filters were requested in the focus group and stay explicit on the event card.
                </p>
              </div>
              <input
                type="checkbox"
                checked={womenOnly}
                onChange={(event) => setWomenOnly(event.target.checked)}
              />
              <span className="switch-card__toggle" aria-hidden="true" />
            </label>
          </section>

          <section className="glass-card">
            <div className="section-title">
              <MapPinned size={16} />
              <span>Set the location</span>
            </div>
            <label className="field">
              <span className="field__label">Location label</span>
              <input
                className="text-field"
                type="text"
                placeholder="e.g. Piata Romana fountain"
                value={location.label}
                onChange={(event) =>
                  setLocation((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
                required
              />
            </label>
            <p className="helper-copy">
              Tap anywhere on the map to place the event pin. No pre-existing venues or sponsored spots are injected.
            </p>
            <EventMap
              compact
              events={events}
              userLocation={userLocation}
              pickerLocation={location}
              onPickLocation={setLocation}
            />
          </section>

          <section className="glass-card">
            <div className="field">
              <div className="field__label-row">
                <span className="field__label">Required equipment</span>
                <span className="field__hint">Focus-group addition</span>
              </div>
              <div className="chip-grid">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <button
                    key={item}
                    className={`pill-button${requiredEquipment.includes(item) ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => toggleListValue(item, setRequiredEquipment)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <div className="field__label-row">
                <span className="field__label">Extra facilities</span>
                <span className="field__hint">Another focus-group addition</span>
              </div>
              <div className="chip-grid">
                {FACILITY_OPTIONS.map((item) => (
                  <button
                    key={item}
                    className={`pill-button${extraFacilities.includes(item) ? ' is-active' : ''}`}
                    type="button"
                    onClick={() => toggleListValue(item, setExtraFacilities)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button className="primary-button" type="submit">
            Launch bubble
            <Rocket size={16} />
          </button>
        </form>
      </main>
    </AppFrame>
  );
}
