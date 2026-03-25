import { MapPinned, Rocket, ShieldCheck } from 'lucide-react';
import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

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
  const [category, setCategory] = useState<CategoryId>('tennis');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(toLocalDateTimeInputValue());
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [price, setPrice] = useState(0);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('open');
  const [womenOnly, setWomenOnly] = useState(false);
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [extraFacilities, setExtraFacilities] = useState<string[]>(['Lockers']);
  const [location, setLocation] = useState<EventLocation>({
    label: userLocation.label,
    lat: userLocation.lat,
    lng: userLocation.lng,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setErrorMessage('');

    if (!title.trim() || !description.trim() || !startTime || !location.label.trim()) {
      setErrorMessage('Title, description, start time, and location are required.');
      return;
    }

    setIsSubmitting(true);
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
      setErrorMessage('You need an active profile before creating a session.');
      setIsSubmitting(false);
      return;
    }

    navigate(`/event/${eventId}`);
  };

  return (
    <AppFrame>
      <main className="screen">
        <PageHeader
          title="Create session"
          subtitle="Sport, skill level, timing, and location stay visible up front so players can commit quickly."
          backTo="/discover"
        />

        <Card className="create-intro">
          <div>
            <p className="eyebrow">Checklist</p>
            <h2>Pick the sport, pin the court, launch it.</h2>
            <p>
              Sport, title, description, start time, and location are required.
              Price, duration, equipment, and facilities help players decide faster.
            </p>
          </div>
          <Badge variant="outline" className="soft-badge">
            <ShieldCheck size={12} />
            Text, map, and attendee transparency only
          </Badge>
        </Card>

        <form className="stack" onSubmit={handleSubmit}>
          <Card>
            <div className="section-title">
              <Rocket size={16} />
              <span>Choose a sport</span>
            </div>
            <div className="chip-grid chip-grid--categories">
              {Object.entries(CATEGORY_META).map(([id, meta]) => (
                <Button
                  key={id}
                  type="button"
                  variant={category === id ? 'secondary' : 'outline'}
                  className="category-chip"
                  onClick={() => setCategory(id as CategoryId)}
                >
                  <span className="category-chip__emoji">{meta.emoji}</span>
                  <span>{meta.label}</span>
                </Button>
              ))}
            </div>
          </Card>

          <Card className="form-card">
            <label className="field">
              <span className="field__label">Title</span>
              <Input
                type="text"
                placeholder="e.g. Thursday evening padel doubles"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>

            <label className="field">
              <span className="field__label">Details</span>
              <Textarea
                className="text-field--textarea"
                rows={4}
                placeholder="What is the format, who is it for, what should players bring, and anything important before arrival?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>

            <div className="form-grid">
              <label className="field">
                <span className="field__label">Start time</span>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span className="field__label">Duration (minutes)</span>
                <Input
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
                <Input
                  type="number"
                  min="0"
                  step="5"
                  value={price}
                  onChange={(event) => setPrice(Number(event.target.value))}
                />
              </label>

              <label className="field">
                <span className="field__label">Skill level</span>
                <NativeSelect
                  value={skillLevel}
                  onChange={(event) => setSkillLevel(event.target.value as SkillLevel)}
                >
                  {SKILL_LEVELS.map((level) => (
                    <NativeSelectOption key={level.value} value={level.value}>
                      {level.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </label>
            </div>

            <label className="switch-card">
              <div>
                <span className="field__label">Women-only session</span>
                <p className="field__hint">
                  Keep eligibility explicit on the session card so players can self-select confidently.
                </p>
              </div>
              <Switch
                checked={womenOnly}
                onCheckedChange={setWomenOnly}
              />
            </label>
          </Card>

          <Card>
            <div className="section-title">
              <MapPinned size={16} />
              <span>Set the location</span>
            </div>
            <label className="field">
              <span className="field__label">Location label</span>
              <Input
                type="text"
                placeholder="e.g. X TU Delft Outdoor Courts"
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
              Tap anywhere on the map to place the session pin. No pre-filled sponsored courts or clubs are injected.
            </p>
            <EventMap
              compact
              events={events}
              userLocation={userLocation}
              pickerLocation={location}
              onPickLocation={setLocation}
            />
          </Card>

          <Card>
            <div className="field">
              <div className="field__label-row">
                <span className="field__label">Required equipment</span>
                <span className="field__hint">Shows what players need before they leave</span>
              </div>
              <div className="chip-grid">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant={requiredEquipment.includes(item) ? 'default' : 'outline'}
                    size="sm"
                    className="pill-button"
                    onClick={() => toggleListValue(item, setRequiredEquipment)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>

            <div className="field">
              <div className="field__label-row">
                <span className="field__label">Extra facilities</span>
                <span className="field__hint">Shows what the venue already provides</span>
              </div>
              <div className="chip-grid">
                {FACILITY_OPTIONS.map((item) => (
                  <Button
                    key={item}
                    type="button"
                    variant={extraFacilities.includes(item) ? 'default' : 'outline'}
                    size="sm"
                    className="pill-button"
                    onClick={() => toggleListValue(item, setExtraFacilities)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <Button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Launching session…' : 'Launch session'}
            <Rocket size={16} />
          </Button>
        </form>
      </main>
    </AppFrame>
  );
}
